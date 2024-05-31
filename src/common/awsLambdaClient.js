import AWS from 'aws-sdk';

import logger from '#common/logger.js';
import typeCheck from '#common/util/typeCheck.js';
import parseJSON from '#common/util/parseJSON.js';

const debug = logger.createDebug('awsLambdaClient');
const lambda = new AWS.Lambda();

export const LAMBDA_FUNCTION_TBD = 'tbd';

/**
 * Invokes an AWS Lambda function.
 *
 * @param  {string} options.functionName Lambda function to invoke.
 * @param  {Object} options.payload      Function payload.
 * @return {Object}                      Function response.
 */
export async function invokeLambdaFunction({ functionName, payload }) {
  typeCheck('functionName::NonEmptyString', functionName);
  typeCheck('payload::Maybe NonEmptyObject', payload);

  debug(`Invoking Lambda function "${functionName}".`, payload);

  const result = await lambda.invoke({
    FunctionName: functionName,
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify(payload || {}),
  }).promise();

  typeCheck('result::NonEmptyObject', result);
  typeCheck('resultStatus::PositiveNumber', result.StatusCode);

  const resultPayload = parseJSON(result.Payload);
  typeCheck('resultPayload::NonEmptyObject', resultPayload);

  if (result.StatusCode !== 200) {
    const error = new Error(
      `Error while invoking Lambda function "${functionName}": ${resultPayload}`
    );
    error.name = 'AwsLambdaFunctionInvokeError';
    error.details = {
      functionName,
      payload,
      resultPayload,
    };
    throw error;
  }

  debug(`[${functionName}]`, result);
  return resultPayload;
}
