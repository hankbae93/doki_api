import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AgendaCandidate } from './agenda-candidate.entity';

@Entity()
export class AgendaCandidateVote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.agendaCandidateVotes)
  user: User;

  @ManyToOne(
    () => AgendaCandidate,
    (agendaCandidate) => agendaCandidate.agendaCandidateVotes,
  )
  agendaCandidate: AgendaCandidate;
}
