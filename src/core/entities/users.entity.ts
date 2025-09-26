import { Column, Entity, OneToMany } from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from './base';
import { File } from './files.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'name' })
  @ApiProperty()
  name: string;

  @Column({ name: 'email', unique: true, nullable: false })
  @ApiProperty()
  email: string;

  @Column({ name: 'password', nullable: true })
  @ApiHideProperty()
  @Exclude()
  password: string;

  @OneToMany(() => File, (file) => file.user, {
    nullable: true,
    cascade: true,
  })
  @ApiHideProperty()
  @Exclude()
  files: File[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty()
  isActive: boolean;

  @Column({ name: 'profile_picture_url', nullable: true })
  @ApiProperty({ required: false })
  profilePictureUrl?: string;
}
