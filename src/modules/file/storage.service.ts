import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { parse } from 'path';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucket: string;

  constructor(private configService: ConfigService) {
    console.log(configService.get('GOOGLE_PROJECT_ID'));

    this.storage = new Storage({
      projectId: configService.get('GOOGLE_PROJECT_ID'),
      credentials: {
        client_email: configService.get('GOOGLE_CLIENT_EMAIL'),
        private_key: configService
          .get('GOOGLE_PRIVATE_KEY')
          .split(String.raw`\n`)
          .join('\n'),
      },
    });

    this.bucket = configService.get('GOOGLE_STORAGE_MEDIA_BUCKET');
  }

  async uploadFile(file: Express.Multer.File) {
    const fileName = this.setFilename(file);

    try {
      await this.storage
        .bucket(this.bucket)
        .file(fileName)
        .save(file.buffer, { contentType: file.mimetype });
    } catch (err) {
      throw new Error(err);
    }

    return `${this.bucket}/${fileName}`;
  }

  private setFilename(uploadedFile: Express.Multer.File): string {
    const fileName = parse(uploadedFile.originalname);
    return `${fileName.name}-${Date.now()}${fileName.ext}`
      .replace(/^\.+/g, '')
      .replace(/^\/+/g, '')
      .replace(/\r|\n/g, '_');
  }
}
