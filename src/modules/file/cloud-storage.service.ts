import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { parse } from 'path';

@Injectable()
export class CloudStorageService {
  private storage: Storage;
  private bucket: string;

  constructor(private configService: ConfigService) {
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

  async save(file: Express.Multer.File) {
    const fileName = this.setFilename(file);

    try {
      await this.storage
        .bucket(this.bucket)
        .file(fileName)
        .save(file.buffer, { contentType: file.mimetype });
    } catch (err) {
      throw new Error('upload image failed');
    }

    return `https://storage.googleapis.com/${this.bucket}/${fileName}`;
  }

  private setFilename(uploadedFile: Express.Multer.File): string {
    const fileName = parse(uploadedFile.originalname);
    return `${fileName.name}-${Date.now()}${fileName.ext}`
      .replace(/^\.+/g, '')
      .replace(/^\/+/g, '')
      .replace(/\r|\n/g, '_');
  }
}
