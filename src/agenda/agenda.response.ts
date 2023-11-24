
import {Transform} from "class-transformer";
import {toNumber} from "../common/utils/format-data";

export class GetCurrentCandidateAgendaList {
    agendaId: number
    agendaCandidateId: number
    title: string
    @Transform(({value}) => toNumber(value))
    voteCount: number
}