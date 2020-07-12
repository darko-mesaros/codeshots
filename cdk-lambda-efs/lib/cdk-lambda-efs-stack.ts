import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as lambda from '@aws-cdk/aws-lambda';
import * as efs from '@aws-cdk/aws-efs';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2';

export class CdkLambdaEfsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'MyVPC', {
      cidr: "11.0.0.0/16"
    })

    // EFS FileSystem
    const fs = new efs.FileSystem(this, 'MyEFS', {
      vpc, 
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    }) 
    // EFS Access point
    const accessPoint = fs.addAccessPoint('MyAccessPoint', {
      createAcl: {
        ownerGid: '1001',
        ownerUid: '1001',
        permissions: '750',
      },
      path: '/export/lambda',
      posixUser: {
        gid: '1001',
        uid: '1001',
      }
    })

    // Lambda Function
    const efsLambda = new lambda.Function(this, 'MyFunction',{
      code: lambda.Code.fromAsset('lambda-fs'),
      handler: 'index.lambda_handler',
      runtime: lambda.Runtime.PYTHON_3_7,
      vpc,
      filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, '/mnt/msg')
    })

    // API Gateway
    const api = new apigwv2.HttpApi(this, 'Api', {
      defaultIntegration: new apigwv2.LambdaProxyIntegration({
        handler: efsLambda
      })
    })

    // CFN Output
    new cdk.CfnOutput(this, 'ApiURL', {value: api.url!})
  }
}
