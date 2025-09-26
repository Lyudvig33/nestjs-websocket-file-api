import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from './base';
import { User } from './users.entity';

@Entity('user_refresh_tokens')
export class UserRefreshToken extends BaseEntity {
  @Column({ name: 'refresh_token', type: 'text' })
  @ApiProperty()
  refreshToken: string;

  @Column({ name: 'is_revoked', type: 'boolean', default: false })
  @ApiProperty()
  isRevoked: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty()
  user: User;
}
