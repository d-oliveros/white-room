import type { DataSource } from 'typeorm';
import { Repository } from 'typeorm';
import { LambdaCall } from './lambdaCall.model';

export class LambdaCallRepository extends Repository<LambdaCall> {
  constructor(dataSource: DataSource) {
    super(LambdaCall, dataSource.createEntityManager());
  }
}
