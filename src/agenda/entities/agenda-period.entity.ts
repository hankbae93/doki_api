import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AgendaPeriodType } from '../agenda.enum';

@Entity()
export class AgendaPeriod extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  startTime: Date;

  @Column({ type: 'date' })
  endTime: Date;

  @Column()
  type: AgendaPeriodType;
}
