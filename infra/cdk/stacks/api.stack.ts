import type { Construct } from 'constructs';
import type * as s3 from 'aws-cdk-lib/aws-s3';

import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';

interface ApiStackProps extends cdk.StackProps {
  domainName: string;
  appId: string;
  environment: string;
  projectDir: string;
  apiEnvVars: ((params: Record<string, string>) => Record<string, string>) | Record<string, string>;
  vpc: ec2.IVpc;
  filesBucket: s3.IBucket;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { domainName, appId, environment, projectDir, vpc, filesBucket, apiEnvVars } = props;

    // RDS Database credentials stored in Secrets Manager
    const dbName = `${appId}_${environment}`.toLowerCase();
    const dbUser = 'api';
    const dbCredentialsSecret = new secretsmanager.Secret(
      this,
      `${environment}-DBCredentialsSecret`,
      {
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
            username: dbUser,
            dbName,
          }),
          excludePunctuation: true,
          includeSpace: false,
          generateStringKey: 'password',
        },
      },
    );

    // Create a security group for the RDS instance
    const dbSecurityGroup = new ec2.SecurityGroup(this, `${environment}-DBSecurityGroup`, {
      vpc,
      description: 'Security group for RDS instance',
      allowAllOutbound: true,
    });

    // Create a security group for the Fargate service
    const serviceSecurityGroup = new ec2.SecurityGroup(this, `${environment}-ApiServiceSG`, {
      vpc,
      description: 'Security group for API Fargate service',
      allowAllOutbound: true,
    });

    // Allow inbound access only from the Fargate service security group to the RDS
    dbSecurityGroup.addIngressRule(
      ec2.Peer.securityGroupId(serviceSecurityGroup.securityGroupId),
      ec2.Port.tcp(5432),
      'Allow access from Fargate service',
    );

    // Also allow any IP to access the RDS
    dbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'Allow access from any IP',
    );

    // Change RDS instance to use PostgreSQL and add the security group
    const rdsInstance = new rds.DatabaseInstance(this, `${environment}-RdsInstance`, {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_4,
      }),
      vpc,
      credentials: rds.Credentials.fromSecret(dbCredentialsSecret),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroups: [dbSecurityGroup],
      publiclyAccessible: true,
      allocatedStorage: 20,
      maxAllocatedStorage: 30,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      databaseName: dbName,
    });

    // Create Fargate cluster
    const cluster = new ecs.Cluster(this, `${environment}-ApiCluster`, {
      vpc,
      clusterName: `${environment}-${appId}-api-cluster`,
    });

    // Create the Docker image asset from the project directory
    const dockerImageAsset = new ecrAssets.DockerImageAsset(this, `${environment}-ApiDockerImage`, {
      directory: projectDir,
    });

    // Create a task role for the container to access AWS resources
    const taskRole = new iam.Role(this, `${environment}-ApiTaskRole`, {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Create a task execution role for ECS to pull images and publish logs
    const executionRole = new iam.Role(this, `${environment}-ApiTaskExecutionRole`, {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Add permissions needed for the execution role
    executionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
    );

    // Grant the execution role permission to read the secret
    dbCredentialsSecret.grantRead(executionRole);

    // Grant the task role permission to read the secret
    dbCredentialsSecret.grantRead(taskRole);

    // Grant the task role permission to read/write to the files bucket
    filesBucket.grantReadWrite(taskRole);

    // Add permissions to invoke all Lambda functions if needed
    taskRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['lambda:InvokeFunction'],
        resources: ['*'],
      }),
    );

    // Create a log group for the container
    const logGroup = new logs.LogGroup(this, `${environment}-ApiLogGroup`, {
      logGroupName: `/ecs/${environment}-${appId}-api`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_MONTH,
    });

    // Define the Fargate task definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, `${environment}-ApiTaskDef`, {
      memoryLimitMiB: 1024,
      cpu: 512,
      taskRole,
      executionRole,
    });

    // Add container to the task definition
    const container = taskDefinition.addContainer(`${environment}-ApiContainer`, {
      image: ecs.ContainerImage.fromDockerImageAsset(dockerImageAsset),
      memoryLimitMiB: 1024,
      cpu: 512,
      essential: true,
      environment:
        typeof apiEnvVars === 'function'
          ? apiEnvVars({
              dbHost: rdsInstance.dbInstanceEndpointAddress,
              dbUser,
              dbName,
              dbSecretArn: dbCredentialsSecret.secretArn,
            })
          : apiEnvVars,
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: `${environment}-api`,
        logGroup,
      }),
    });

    // Add port mapping to the container
    container.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    });

    // Create a security group for the ALB
    const albSecurityGroup = new ec2.SecurityGroup(this, `${environment}-AlbSecurityGroup`, {
      vpc,
      description: 'Security group for API ALB',
      allowAllOutbound: true,
    });

    // Allow inbound HTTP and HTTPS traffic to the ALB
    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic from anywhere',
    );

    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic from anywhere',
    );

    // Only allow the Fargate service to receive traffic from the ALB
    serviceSecurityGroup.addIngressRule(
      ec2.Peer.securityGroupId(albSecurityGroup.securityGroupId),
      ec2.Port.tcp(3000),
      'Allow HTTP traffic from ALB only',
    );

    // Create an Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, `${environment}-ApiALB`, {
      vpc,
      internetFacing: true,
      loadBalancerName: `${environment}-${appId}-api-alb`,
      securityGroup: albSecurityGroup,
    });

    // Custom domain and Route 53 configuration
    const domainParts = domainName.split('.');
    const rootDomain = domainParts.length > 2 ? domainParts.slice(-2).join('.') : domainName;
    const zone = route53.HostedZone.fromLookup(this, `${environment}-HostedZone`, {
      domainName: rootDomain,
    });

    // SSL Certificate for the API
    const certificate = new certificatemanager.Certificate(this, `${environment}-ApiCertificate`, {
      domainName,
      validation: certificatemanager.CertificateValidation.fromDns(zone),
    });

    // Create HTTP listener with HTTPS
    const httpsListener = alb.addListener(`${environment}-ApiHttpsListener`, {
      port: 443,
      certificates: [certificate],
      protocol: elbv2.ApplicationProtocol.HTTPS,
    });

    // Create target group for the Fargate service
    const targetGroup = new elbv2.ApplicationTargetGroup(this, `${environment}-ApiECSTargetGroup`, {
      vpc,
      targetType: elbv2.TargetType.IP,
      protocol: elbv2.ApplicationProtocol.HTTP,
      port: 3000,
      healthCheck: {
        path: '/health',
        interval: cdk.Duration.seconds(60),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 5,
      },
      deregistrationDelay: cdk.Duration.seconds(30),
    });

    // Create ECS Service
    const fargateService = new ecs.FargateService(this, `${environment}-ApiService`, {
      cluster,
      taskDefinition,
      desiredCount: 1,
      securityGroups: [serviceSecurityGroup],
      assignPublicIp: true, // If using public subnets
      serviceName: `${environment}-${appId}-api-service`,
    });

    // Add the target group to the listener
    httpsListener.addTargetGroups(`${environment}-ApiTargetGroup`, {
      targetGroups: [targetGroup],
    });

    // HTTP to HTTPS redirect
    alb.addListener(`${environment}-ApiHttpListener`, {
      port: 80,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        host: '#{host}',
        path: '/#{path}',
        query: '#{query}',
        permanent: true,
      }),
    });

    // Register targets with the target group
    targetGroup.addTarget(fargateService);

    // Route 53 record to point the domain to the ALB
    new route53.ARecord(this, `${environment}-ApiARecord`, {
      zone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(alb)),
    });

    // Enable autoscaling if needed
    const scaling = fargateService.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 5,
    });

    scaling.scaleOnCpuUtilization(`${environment}-ApiCpuScaling`, {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Output the API URL for easy reference
    new cdk.CfnOutput(this, `${environment}-ApiFargateUrl`, {
      value: `https://${domainName}`,
      description: 'The URL of the Fargate API',
    });
  }
}
