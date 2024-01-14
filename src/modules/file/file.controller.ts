import { Controller, Get, Param, Res } from '@nestjs/common';
import { CloudStorageService } from './cloud-storage.service';

@Controller('files')
export class FileController {
  constructor(private storageService: CloudStorageService) {}

  @Get('/:path')
  getStaticFile(@Param('path') path: string, @Res() res) {
    res.sendFile(path, { root: './files' });
  }

  // @Post('/test')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     limits: {
  //       files: 1,
  //       fileSize: 1024 * 1024,
  //     },
  //   }),
  // )
  // async d(@UploadedFile() file: Express.Multer.File) {
  //   const result = await this.storageService.save(file);
  //   console.log(result);
  //   return result;
  // }
}
