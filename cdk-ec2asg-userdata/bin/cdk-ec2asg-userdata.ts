#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkEc2AsgUserdataStack } from '../lib/cdk-ec2asg-userdata-stack';

const app = new cdk.App();
new CdkEc2AsgUserdataStack(app, 'CdkEc2AsgUserdataStack');
