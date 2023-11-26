import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ResponseDto } from '../common/dto/responseDto';
import { EStatusCode } from '../common/enum/status.enum';
import { EErrorMessage, EResponseMessage } from '../common/enum/message.enum';
import { AgendaPeriodType } from './agenda.enum';
import { VoteAgendaDto } from './dto/vote-agenda.dto';
import { AgendaRepository } from './repository/agenda.repository';
import { AgendaPeriodRepository } from './repository/agenda-period.repository';
import { AgendaCandidateRepository } from './repository/agenda-candidate.repository';
import { AgendaOptionRepository } from './repository/agenda-option.repository';
import { AgendaCandidateVoteRepository } from './repository/agenda-candidate-vote.repository';
import { AgendaVoteRepository } from './repository/agenda-vote.repository';
import { validTime } from '../utils/valid.utils';
import { MILLISECONDS_A_DAY } from '../common/constants/time';

@Injectable()
export class AgendaService {
  constructor(
    private readonly agendaRepository: AgendaRepository,
    private readonly agendaPeriodRepository: AgendaPeriodRepository,
    private readonly agendaCandidateRepository: AgendaCandidateRepository,
    private readonly agendaOptionRepository: AgendaOptionRepository,
    private readonly agendaCandidateVoteRepository: AgendaCandidateVoteRepository,
    private readonly agendaVoteRepository: AgendaVoteRepository,
    private dataSource: DataSource,
  ) {}

  async getCurrentAgendaPeriod() {
    const period = await this.agendaPeriodRepository.findCurrentPeriod();

    return new ResponseDto(EStatusCode.OK, period, EResponseMessage.SUCCESS);
  }

  async createPeriod() {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + MILLISECONDS_A_DAY);
    const currentPeriod = await this.agendaPeriodRepository.findCurrentPeriod();
    if (
      currentPeriod &&
      startTime.getTime() < currentPeriod.endTime.getTime()
    ) {
      throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
    }
    function getType(type: AgendaPeriodType) {
      switch (type) {
        case AgendaPeriodType.READY:
          return AgendaPeriodType.CANDIDATE;
        case AgendaPeriodType.CANDIDATE:
          return AgendaPeriodType.VOTE;
        case AgendaPeriodType.VOTE:
          return AgendaPeriodType.READY;
        default:
          return AgendaPeriodType.READY;
      }
    }

    const period = await this.agendaPeriodRepository.save({
      startTime,
      endTime,
      type: getType(currentPeriod?.type),
    });

    return new ResponseDto(
      EStatusCode.CREATED,
      period,
      EResponseMessage.SUCCESS,
    );
  }

  async getAgendaList() {
    const agendaList = await this.agendaRepository.findAgendaList();

    const result = agendaList.map((agenda) => {
      return {
        ...agenda,
        agendaOptions: agenda.agendaOptions.map((option) => ({
          ...option,
          optionId: option.id,
        })),
      };
    });

    return new ResponseDto(EStatusCode.OK, result, EResponseMessage.SUCCESS);
  }

  async getCurrentCandidateAgendaList() {
    const currentPeriod = await this.agendaPeriodRepository.findCurrentPeriod();
    const agendaCandidateList =
      await this.agendaCandidateRepository.findNominatingAgendaList(
        currentPeriod.id,
      );

    return new ResponseDto(
      EStatusCode.OK,
      {
        period: currentPeriod,
        list: agendaCandidateList,
      },
      EResponseMessage.SUCCESS,
    );
  }

  async createAgenda(createAgendaDto: CreateAgendaDto, user: User) {
    const { title, options } = createAgendaDto;
    const currentPeriod = await this.agendaPeriodRepository.findCurrentPeriod();
    if (currentPeriod.type !== AgendaPeriodType.READY) {
      throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newAgenda = await this.agendaRepository.saveRecord(
        title,
        user,
        queryRunner.manager,
      );
      const agendaOptions = await this.agendaOptionRepository.saveRecords(
        options,
        newAgenda,
        queryRunner.manager,
      );

      const newOptions = agendaOptions.map((option) => ({
        id: option.id,
        content: option.content,
      }));
      await queryRunner.commitTransaction();

      return new ResponseDto(
        EStatusCode.CREATED,
        {
          agendaId: newAgenda.id,
          title: newAgenda.title,
          options: newOptions,
        },
        EResponseMessage.SUCCESS,
      );
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async candidateAgenda(agendaId: number, user: User) {
    const currentPeriod = await this.agendaPeriodRepository.findCurrentPeriod();

    if (currentPeriod.type !== AgendaPeriodType.CANDIDATE) {
      throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
    }

    const agendaCandidate =
      await this.agendaCandidateRepository.findNominatingAgenda(
        agendaId,
        currentPeriod.id,
      );

    if (agendaCandidate) {
      const nominateVote =
        await this.agendaCandidateVoteRepository.findOneByAgendaCandidate(
          agendaCandidate.id,
          user.id,
        );

      if (nominateVote) {
        await this.agendaCandidateVoteRepository.remove(nominateVote);
        return new ResponseDto(EStatusCode.OK, null, EResponseMessage.CANCEL);
      } else {
        await this.agendaCandidateVoteRepository.save({
          agendaCandidate: agendaCandidate,
          user,
        });

        return new ResponseDto(
          EStatusCode.OK,
          null,
          EResponseMessage.NOMINATED_SUCCESS,
        );
      }
    } else {
      const agenda = await this.agendaRepository.findAgendaById(agendaId);
      const agendaCandidate =
        await this.agendaCandidateRepository.findCandidateAgendaById(agendaId);

      if (agendaCandidate) {
        await this.agendaCandidateRepository.updateAgendaPeriod(
          agendaCandidate.id,
          currentPeriod,
        );
      } else {
        const newNominateAgenda =
          await this.agendaCandidateRepository.saveRecord(
            agenda,
            currentPeriod,
          );

        await this.agendaCandidateVoteRepository.insertRecord(
          user,
          newNominateAgenda,
        );
      }
    }

    return new ResponseDto(
      EStatusCode.OK,
      null,
      EResponseMessage.NOMINATED_SUCCESS,
    );
  }

  async getWinnerAgendaListByPeriod(periodId: number) {
    const period = await this.agendaPeriodRepository.findPeriodById(periodId);

    if (!period) {
      throw new NotFoundException(EErrorMessage.NOT_FOUND);
    }

    const winners =
      await this.agendaCandidateRepository.findWinnerAgendaListByPeriod(
        periodId,
      );

    return new ResponseDto(EStatusCode.OK, winners, EResponseMessage.SUCCESS);
  }

  async nominateAgenda() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const currentPeriod = await this.agendaPeriodRepository.findCurrentPeriod(
      queryRunner.manager,
    );

    if (!currentPeriod) {
      throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
    }

    const candidates = await this.agendaCandidateRepository.findTopAgendaList(
      currentPeriod.id,
      queryRunner.manager,
    );

    const winner = candidates.shift();

    try {
      await this.agendaCandidateRepository.updateNominated(
        winner.agendaCandidateId,
        queryRunner.manager,
      );

      if (candidates.length > 0) {
        await this.agendaCandidateRepository.updatePriority(
          candidates.map((candidate) => candidate.agendaCandidateId),
          queryRunner.manager,
        );
      }

      await queryRunner.commitTransaction();

      return new ResponseDto(
        EStatusCode.OK,
        {
          winner,
          list: candidates,
        },
        EResponseMessage.SUCCESS,
      );
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      return new ResponseDto(EStatusCode.SERVER_ERROR, null, 'retry');
    } finally {
      await queryRunner.release();
    }
  }

  async getAgendaForVote() {
    const [currentPeriod, prevPeriod] =
      await this.agendaPeriodRepository.findLatestPeriod();

    const { agendaCandidateId, title, options, nominateCount } =
      await this.agendaCandidateRepository.findCandidateAgenda(prevPeriod.id);

    if (!agendaCandidateId) {
      throw new NotFoundException(EErrorMessage.NOT_FOUND);
    }

    return new ResponseDto(
      EStatusCode.OK,
      {
        currentPeriod,
        agendaCandidateId,
        title,
        nominateCount,
        options,
      },
      EResponseMessage.SUCCESS,
    );
  }

  async voteAgenda(
    agendaCandidateId: number,
    voteAgendaDto: VoteAgendaDto,
    user: User,
  ) {
    const { optionId } = voteAgendaDto;
    const agendaCandidate =
      await this.agendaCandidateRepository.findCandidateAgendaById(
        agendaCandidateId,
      );

    const agendaOptions =
      await this.agendaOptionRepository.findAgendaOptionList(
        agendaCandidate.agenda.id,
      );
    const votedOption = agendaOptions.find((item) => item.id === optionId);

    if (!votedOption) {
      throw new NotFoundException(EErrorMessage.NOT_FOUND);
    }

    const vote = await this.agendaVoteRepository.findAgendaVote(
      agendaCandidateId,
      user.id,
    );

    if (vote) {
      await this.agendaVoteRepository.remove(vote);
      return new ResponseDto(EStatusCode.OK, null, EResponseMessage.CANCEL);
    }

    await this.agendaVoteRepository.insertRecord(
      agendaCandidate.agenda,
      agendaCandidate,
      votedOption,
      user,
    );

    return new ResponseDto(EStatusCode.OK, null, EResponseMessage.SUCCESS);
  }

  async winAgendaVoteThisWeek() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;

    try {
      const [currentPeriod, prevPeriod] =
        await this.agendaPeriodRepository.findLatestPeriod(manager);

      if (!validTime(currentPeriod.endTime)) {
        throw new ForbiddenException(EErrorMessage.NOT_TIME_YET);
      }

      const currentAgenda =
        await this.agendaCandidateRepository.findVotingAgenda(
          prevPeriod.id,
          manager,
        );

      const agendaVotes = await this.agendaVoteRepository.findAgendaVoteList(
        currentAgenda.id,
        manager,
      );

      await this.agendaOptionRepository.updateWin(
        +agendaVotes[0].optionId,
        manager,
      );
      await this.agendaRepository.updateComplete(+currentAgenda.agenda.id);
      await queryRunner.commitTransaction();

      return new ResponseDto(
        EStatusCode.OK,
        agendaVotes[0],
        EResponseMessage.SUCCESS,
      );
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      return new ResponseDto(EStatusCode.SERVER_ERROR, null, 'retry');
    } finally {
      await queryRunner.release();
    }
  }
}
