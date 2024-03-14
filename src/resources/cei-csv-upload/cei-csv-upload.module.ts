import { Module } from '@nestjs/common';
import { CeiCsvUploadService } from './cei-csv-upload.service';
import { CeiCsvUploadController } from './cei-csv-upload.controller';

@Module({
  controllers: [CeiCsvUploadController],
  providers: [CeiCsvUploadService],
})
export class CeiCsvUploadModule {}
