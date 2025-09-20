import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('global_settings')
export class GlobalSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column('text')
  value: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'string' })
  type: 'string' | 'number' | 'boolean' | 'json';

  @Column({ default: false })
  requires_restart: boolean;

  @Column({ default: 'system' })
  category: 'system' | 'security' | 'storage' | 'email' | 'backup' | 'performance';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}