import type { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

interface VpcStackProps extends cdk.StackProps {
  appId: string;
  environment: string;
}

export class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;
  public readonly filesBucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    const { appId, environment } = props;

    this.vpc = new ec2.Vpc(this, `${environment}-vpc`, {
      maxAzs: 2,
      natGateways: 0,
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      subnetConfiguration: [
        {
          cidrMask: 22,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Create S3 bucket for NX cache
    const nxCacheBucket = new s3.Bucket(this, `${environment}-nx-cache`, {
      bucketName: `${appId}-${environment}-nx-cache`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const accountId = cdk.Stack.of(this).account;
    const cdkUserArn = `arn:aws:iam::${accountId}:user/CDK`;
    const cdkUser = new iam.ArnPrincipal(cdkUserArn);

    nxCacheBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject', 's3:PutObject', 's3:ListBucket', 's3:DeleteObject'],
        principals: [cdkUser],
        resources: [nxCacheBucket.arnForObjects('*'), nxCacheBucket.bucketArn],
      }),
    );

    // Export bucket name
    new cdk.CfnOutput(this, 'NxCacheBucketName', {
      value: nxCacheBucket.bucketName,
      exportName: `${environment}-NxCacheBucketName`,
    });

    // Create S3 bucket for files
    const filesBucket = new s3.Bucket(this, `${environment}-files`, {
      bucketName: `${appId}-${environment}-files`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });
    this.filesBucket = filesBucket;

    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      exportName: `${environment}-VpcId`,
    });

    // Export bucket name
    new cdk.CfnOutput(this, 'FilesBucketName', {
      value: filesBucket.bucketName,
      exportName: `${environment}-FilesBucketName`,
    });
  }
}
