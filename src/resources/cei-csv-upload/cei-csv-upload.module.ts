import { Module } from '@nestjs/common'
import { CeiCsvUploadService } from './cei-csv-upload.service'
import { CeiCsvUploadController } from './cei-csv-upload.controller'
import { StocksModule } from '../stocks/stocks.module'

@Module({
  imports: [StocksModule],
  controllers: [CeiCsvUploadController],
  providers: [CeiCsvUploadService],
})
export class CeiCsvUploadModule {}
