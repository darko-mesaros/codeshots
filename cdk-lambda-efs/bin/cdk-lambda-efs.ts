#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkLambdaEfsStack } from '../lib/cdk-lambda-efs-stack';

const app = new cdk.App();
new CdkLambdaEfsStack(app, 'CdkLambdaEfsStack');
