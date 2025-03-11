import type { Construct } from 'constructs';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as resources from 'aws-cdk-lib/custom-resources';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';

interface FrontendStackProps extends cdk.StackProps {
  domainName: string;
  environment: string;
  projectDir: string;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { domainName, environment, projectDir } = props;

    const contentHash = this.generateContentHash(projectDir);

    const bucket = new s3.Bucket(this, `${environment}-WebsiteBucket`, {
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
    });

    new s3Deployment.BucketDeployment(this, `${environment}-DeployWebsite`, {
      sources: [s3Deployment.Source.asset(projectDir)],
      destinationBucket: bucket,
      destinationKeyPrefix: contentHash,
      cacheControl: [
        s3Deployment.CacheControl.setPublic(),
        s3Deployment.CacheControl.maxAge(cdk.Duration.days(365)),
        s3Deployment.CacheControl.immutable(),
      ],
    });

    // Hosted Zone lookup
    const domainParts = domainName.split('.');
    const rootDomain = domainParts.length > 2 ? domainParts.slice(-2).join('.') : domainName;
    const zone = route53.HostedZone.fromLookup(this, `${environment}-HostedZone`, {
      domainName: rootDomain,
    });

    // SSL Certificate for HTTPS
    const certificate = new certificatemanager.Certificate(this, `${environment}-SiteCertificate`, {
      domainName,
      validation: certificatemanager.CertificateValidation.fromDns(zone),
    });

    // CloudFront distribution with SSL and custom domain
    const distribution = new cloudfront.Distribution(this, `${environment}-WebsiteDistribution`, {
      defaultBehavior: {
        origin: new origins.S3StaticWebsiteOrigin(bucket, {
          originPath: `/${contentHash}`,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      domainNames: [domainName],
      certificate,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // Add targeted cache invalidation for index.html only
    const cloudFrontInvalidation = new resources.AwsCustomResource(
      this,
      `${environment}-CloudFrontInvalidation-${contentHash}`,
      {
        onCreate: {
          service: 'CloudFront',
          action: 'createInvalidation',
          parameters: {
            DistributionId: distribution.distributionId,
            InvalidationBatch: {
              CallerReference: contentHash,
              Paths: {
                Quantity: 1,
                Items: ['/'],
              },
            },
          },
          physicalResourceId: resources.PhysicalResourceId.of(
            `${distribution.distributionId}-${contentHash}`,
          ),
        },
        policy: resources.AwsCustomResourcePolicy.fromSdkCalls({
          resources: resources.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
      },
    );

    cloudFrontInvalidation.node.addDependency(distribution);

    // Route 53 ARecord to point domain to CloudFront
    new route53.ARecord(this, `${environment}-CloudFrontAliasRecord`, {
      zone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      recordName: domainName,
    });

    // Output CloudFront Distribution Domain Name
    new cdk.CfnOutput(this, `${environment}-CloudFrontURL`, {
      value: distribution.distributionDomainName,
      description: 'The CloudFront distribution domain name',
      exportName: `${environment}-CloudFrontURL`,
    });
  }

  private generateContentHash(directory: string): string {
    const hash = crypto.createHash('md5');
    this.hashDirectory(directory, hash);
    return hash.digest('hex').slice(0, 8); // Use first 8 characters of the hash
  }

  private hashDirectory(directory: string, hash: crypto.Hash) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        this.hashDirectory(filePath, hash);
      } else {
        const content = fs.readFileSync(filePath);
        hash.update(content);
      }
    }
  }
}
