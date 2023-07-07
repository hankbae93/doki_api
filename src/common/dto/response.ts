import { Status } from '../enum/status.enum';

export class Response {
  constructor(statusCode: Status, data?: any, message?: string) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }

  statusCode: number;
  data: any;
  message: string;
}
