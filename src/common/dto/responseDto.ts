import { EStatusCode } from '../enum/status.enum';

export class ResponseDto {
  constructor(statusCode: EStatusCode, data?: any, message?: string) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }

  statusCode: number;
  data: any;
  message: string;
}
