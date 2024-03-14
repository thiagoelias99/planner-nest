import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common'
import { CeiCsvUploadService } from './cei-csv-upload.service'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileUploadDto } from './dto/file-upload.dto'
import { CsvItem, CsvItemCategoryEnum, CsvItemTypeEnum } from './entities/cei-csv-upload.entity'

@Controller('cei_upload')
@ApiTags('CEI csv Upload')
export class CeiCsvUploadController {
  constructor(private readonly ceiCsvUploadService: CeiCsvUploadService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a cei exported file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    // description: 'List of cats',
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Ok',
  })
  receive(@UploadedFile() file: Express.Multer.File) {
    // const fileContent = file.buffer.toString('utf8').split('\n').slice(1, 3)
    const fileContent = file.buffer.toString('utf8').split('\n')
    const objects = fileContent.map((line) => {
      if (!line) return

      console.log(line)

      const lineData = line.split(';')
      const [day, month, year] = (lineData[1].split('/'))
      const [ticker, institution] = lineData[3].split(' - ')

      const item = new CsvItem({
        type: lineData[0] as CsvItemTypeEnum,
        date: new Date(Number(year), Number(month) - 1, Number(day)),
        category: lineData[2] as CsvItemCategoryEnum,
        ticker,
        institution,
        holder: lineData[4],
        quantity: Number(lineData[5]),
        price: Number(lineData[6].trim().replace(',', '.').replace('R$', '') || NaN),
        grossValue: Number(lineData[7].trim().replace(',', '.').replace('R$', '').replace('\r', '') || NaN)
      })

      return item
    })

    // console.log(objects.filter((item) => item?.category === CsvItemCategoryEnum.JCP))
    console.log(objects)

    return 'Ok ok'
  }
}
