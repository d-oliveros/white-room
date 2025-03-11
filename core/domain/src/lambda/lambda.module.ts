import type { DataSource } from 'typeorm';
import { LambdaService } from './lambda.service';
import { LambdaCallRepository } from './lambdaCall/lambdaCall.repository';

/**
 * LambdaModule manages the dependencies and lifecycle of lambda-related domain services.
 * It provides access to lambda services while encapsulating their implementation details.
 */
export class LambdaModule {
  public readonly lambdaService: LambdaService;
  private readonly lambdaCallRepository: LambdaCallRepository;

  constructor(dataSource: DataSource) {
    this.lambdaCallRepository = new LambdaCallRepository(dataSource);
    this.lambdaService = new LambdaService(this.lambdaCallRepository);
  }
}
