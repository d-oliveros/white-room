import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import logger from '#whiteroom/logger.js';
import typeCheck from '#whiteroom/util/typeCheck.js';
import parseJSON from '#whiteroom/util/parseJSON.js';

const debug = logger.createDebug('awsLambdaClient');
const lambdaClient = new LambdaClient();

export const LAMBDA_FUNCTION_TBD = 'tbd';

/**
 * Invokes an AWS Lambda function.
 *
 * @param  {string} options.functionName Lambda function to invoke.
 * @param  {Object} options.payload      Function payload.
 * @return {Object}                      Function response.
 */
export async function invokeLambdaFunction({ functionName, payload }) {
  // Type checking for functionName and payload
  typeCheck('functionName::NonEmptyString', functionName);
  typeCheck('payload::Maybe NonEmptyObject', payload);

  debug(`Invoking Lambda function "${functionName}".`, payload);

  const params = {
    FunctionName: functionName,
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: Buffer.from(JSON.stringify(payload || {})),
  };

  try {
    const result = await lambdaClient.send(new InvokeCommand(params));

    typeCheck('result::NonEmptyObject', result);
    typeCheck('resultStatus::PositiveNumber', result.StatusCode);

    const resultPayload = parseJSON(Buffer.from(result.Payload).toString());
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
  } catch (error) {
    debug(`Error invoking Lambda function "${functionName}":`, error);
    throw error;
  }
}
