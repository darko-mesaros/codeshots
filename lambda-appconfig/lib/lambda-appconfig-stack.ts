import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2';
import * as iam from '@aws-cdk/aws-iam';

// Properties defined where we determine if this is a prod stack or not
interface EnvStackProps extends cdk.StackProps {
  prod: boolean;
}

export class LambdaAppconfigStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: EnvStackProps) {
    super(scope, id, props);

    // Defining the prod or no prod
    if (props && props.prod) { // prod
      var apiName = 'appConfigApiPROD'
      var lambdaVars = { 
        'CONFIG_ENV':   'lambdaProd',
        'CONFIG_APP':   'lambdaDemo',
        'CONFIG_CONFIG':'lambdaLimiter',
      };
    } else { // not prod 
      var apiName = 'appConfigApiSTAGE'
      var lambdaVars = { 
        'CONFIG_ENV':   'lambdaStage',
        'CONFIG_APP':   'lambdaDemo',
        'CONFIG_CONFIG':'lambdaLimiter',
      };
    }

    // here be code

    // --- lambda ---
    const appConfigLambda = new lambda.Function(this, 'appConfigHandler', {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset('lambda'),
      environment: lambdaVars,
      handler: 'index.lambda_handler'
    });

    // adding some appconfig permissions
    appConfigLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [
        'arn:aws:appconfig:eu-west-1:*'
      ],
      actions: [
          'appconfig:GetConfiguration'
      ]
    }));
    // --- api gateway ---
    const api = new apigwv2.HttpApi(this, apiName, {
      defaultIntegration: new apigwv2.LambdaProxyIntegration({
        handler: appConfigLambda
      })
    })

    // --- cfn output ---
    new cdk.CfnOutput(this, 'ApiURL', {value: api.url!})
  }
}
