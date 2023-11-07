import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
  async getAmazingFile(path: string) {
    // file serving?
    console.log(path);
  }
}
