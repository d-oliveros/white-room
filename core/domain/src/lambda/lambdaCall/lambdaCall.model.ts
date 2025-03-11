import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
import { Lambda } from '@namespace/lambda';
import { BadRequestError } from '@namespace/shared';
import { generateSnowflakeId } from '@domain/lib/snowflake';
import { LambdaCallStatus } from './lambdaCall.enums';

@Entity('lambda_calls')
export class LambdaCall {
  @PrimaryColumn('bigint')
  id!: string;

  @CreateDateColumn()
  startedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date | null = null;

  @Column({ type: 'integer', nullable: true })
  durationMs: number | null = null;

  @Column('jsonb')
  request!: Record<string, unknown>;

  @Column('jsonb', { nullable: true })
  response: Record<string, unknown> | null = null;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, unknown> | null = null;

  @Column({
    type: 'enum',
    enum: Lambda,
  })
  functionName!: Lambda;

  @Column({
    type: 'enum',
    enum: LambdaCallStatus,
    default: LambdaCallStatus.InProgress,
  })
  status!: LambdaCallStatus;

  static create(
    requestPayload: Record<string, unknown>,
    functionName: Lambda,
    metadata?: Record<string, unknown>,
  ): LambdaCall {
    const lambdaCall = new LambdaCall();
    lambdaCall.id = generateSnowflakeId();
    lambdaCall.request = requestPayload;
    lambdaCall.functionName = functionName;
    lambdaCall.metadata = metadata ?? null;
    lambdaCall.status = LambdaCallStatus.InProgress;
    return lambdaCall;
  }

  markAsSuccess(responsePayload: Record<string, unknown>): void {
    if (this.status !== LambdaCallStatus.InProgress) {
      throw new BadRequestError('LambdaCall is not in progress');
    }
    this.status = LambdaCallStatus.Success;
    this.response = responsePayload;
    this.finishedAt = new Date();
    this.durationMs = this.finishedAt.getTime() - this.startedAt.getTime();
  }

  markAsError(errorMessage: string): void {
    if (this.status !== LambdaCallStatus.InProgress) {
      throw new BadRequestError('LambdaCall is not in progress');
    }
    this.status = LambdaCallStatus.Error;
    this.response = { error: errorMessage };
    this.finishedAt = new Date();
    this.durationMs = this.finishedAt.getTime() - this.startedAt.getTime();
  }
}
