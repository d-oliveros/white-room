import type { UserUpdateDto, UserCreateDto } from './user.schemas';
import type { DomainEvent } from '@domain/lib/EventBus';
import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { generateSnowflakeId } from '@domain/lib/snowflake';
import { UserRole, UserStatus } from './user.constants';
import { UserUpdateSchema } from './user.schemas';
import { UserCreatedEvent } from './user.events';

@Entity('users')
export class User {
  domainEvents: DomainEvent[] = [];

  @PrimaryColumn('bigint')
  id!: string;

  @Index()
  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Index({ unique: true })
  @Column()
  phone!: string;

  @Index({ unique: true })
  @Column()
  email!: string;

  @Column({ select: false })
  password?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
  })
  roles!: UserRole[];

  @Column({ default: false })
  shouldRefreshRoles!: boolean;

  @Column({
    type: 'enum',
    enum: UserStatus,
  })
  status!: UserStatus;

  @Column({ type: 'varchar', nullable: true })
  profilePictureUrl: string | null = null;

  static create(data: UserCreateDto) {
    const user = new User();
    user.id = generateSnowflakeId();
    user.roles = [UserRole.User];
    user.status = UserStatus.Active;
    user.shouldRefreshRoles = false;
    user.createdAt = new Date();
    Object.assign(user, data);
    user.domainEvents.push(
      new UserCreatedEvent({
        userId: user.id,
        firstName: user.firstName,
        email: user.email,
      }),
    );
    return user;
  }

  hasRole(role: UserRole): boolean {
    return this.roles.includes(role);
  }

  update(data: UserUpdateDto): void {
    const updatedUserFields = UserUpdateSchema.parse(data);
    Object.assign(this, updatedUserFields);
  }
}
