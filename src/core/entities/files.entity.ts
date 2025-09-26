import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { BaseEntity } from './base';
import { User } from './users.entity';

@Entity('files')
export class File extends BaseEntity {
  @Column({ name: 'url', nullable: false })
  @ApiProperty()
  url: string;

  @ApiProperty()
  @Column({ name: 'key', nullable: false })
  key: string;

  @Column({ name: 'name', nullable: true })
  @ApiProperty({ required: false })
  name?: string;

  @Column({ name: 'size', type: 'int', nullable: true })
  @ApiProperty({ required: false })
  size?: number;

  @ManyToOne(() => User, (user) => user.files, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  @ApiHideProperty()
  user?: User;
}
