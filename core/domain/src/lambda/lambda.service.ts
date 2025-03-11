import type { LambdaPayloadMap } from '@namespace/lambda';
import type { LambdaCallRepository } from './lambdaCall/lambdaCall.repository';

import { lambdaApiClient } from '@domain/lib/lambdaClient';
import { LambdaCall } from './lambdaCall/lambdaCall.model';

export class LambdaService {
  constructor(private readonly lambdaCallRepository: LambdaCallRepository) {}

  async callLambdaFunction<K extends keyof LambdaPayloadMap>(
    lambdaFunction: K,
    lambdaPayload: LambdaPayloadMap[K]['request'],
    metadata?: Record<string, unknown>,
  ): Promise<LambdaCall> {
    const lambdaCall = LambdaCall.create(lambdaPayload, lambdaFunction, metadata);
    await this.lambdaCallRepository.save(lambdaCall);

    try {
      const response = await lambdaApiClient.request(lambdaFunction, lambdaPayload);
      lambdaCall.markAsSuccess(response || {});
    } catch (error) {
      lambdaCall.markAsError((error as Error).message);
    }
    await this.lambdaCallRepository.save(lambdaCall);

    return lambdaCall;
  }
}
