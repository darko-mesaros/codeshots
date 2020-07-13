import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as autoscaling from '@aws-cdk/aws-autoscaling';
import * as elbv2Targets from '@aws-cdk/aws-elasticloadbalancingv2-targets';

// FileSystem access
import * as fs from 'fs';

export class CdkEc2AsgUserdataStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // IAM 
    const instanceRole = new iam.Role(this, 'instanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    });

    instanceRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2RoleforSSM'))
    // SSM Permissions

    // VPC
    const vpc = new ec2.Vpc(this, 'VPC');

    // Security group
    const webSg = new ec2.SecurityGroup(this, 'WebSG',{
      vpc: vpc,
      allowAllOutbound: true,
      description: "Web Server Security Group"
    });

    webSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000), 'Web from anywhere')

    // ASG Configuration
    const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage(), // get the latest Amazon Linux image
      maxCapacity: 5,
      minCapacity: 1,
      desiredCapacity: 3,
      role: instanceRole
    });

    // Add user Data
    var bootscript:string;
    bootscript = fs.readFileSync('assets/web_userdata.sh','utf8');

    asg.addUserData(bootscript);
    asg.addSecurityGroup(webSg)

    const weblb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      internetFacing: true
    });

    const listener = weblb.addListener('Listener', {
      port: 80,
      open: true
    });

    listener.addTargets('WebFleet', {
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [asg]
    });
    
    // CFN Output
    new cdk.CfnOutput(this, 'LbURL', {value: weblb.loadBalancerDnsName!})

  }
}
