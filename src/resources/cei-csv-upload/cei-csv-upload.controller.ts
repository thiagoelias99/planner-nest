import { Controller, Post, UseInterceptors, UploadedFile, HttpCode, UseGuards, Req } from '@nestjs/common'
import { CeiCsvUploadService } from './cei-csv-upload.service'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileUploadDto } from './dto/file-upload.dto'
import { CsvItem, CsvItemCategoryEnum, CsvItemTypeEnum } from './entities/cei-csv-upload.entity'
import { AuthGuard, UserRequest } from '../../guards/auth.guard'

@Controller('cei_upload')
@ApiTags('CEI csv Upload')
export class CeiCsvUploadController {
  constructor(private readonly ceiCsvUploadService: CeiCsvUploadService) { }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a cei exported file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Ok',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            added: { type: 'number' },
            ignored: { type: 'number' },
            errors: { type: 'number' }
          }
        }
      }
    }
  })
  receive(@Req() req: UserRequest, @UploadedFile() file: Express.Multer.File) {
    const { id: userId } = req.user
    const fileContent = file.buffer.toString('utf8').split('\n')

    //Normalize the data from .csv
    const objects = fileContent.map((line) => {
      if (!line) return

      const lineData = line.split(';')
      const [day, month, year] = (lineData[1].split('/'))
      const [ticker, institution] = lineData[3].split(' - ')

      const item = new CsvItem({
        type: lineData[0] as CsvItemTypeEnum,
        date: new Date(Number(year), Number(month) - 1, Number(day), 12),
        category: lineData[2] as CsvItemCategoryEnum,
        ticker,
        institution,
        broker: lineData[4],
        quantity: Number(lineData[5].trim().replace('.', '').replace(',', '.').replace('R$', '')) || 0,
        price: Number(lineData[6].trim().replace('.', '').replace(',', '.').replace('R$', '')) || 0,
        grossValue: Number(lineData[7].trim().replace('.', '').replace(',', '.').replace('R$', '').replace('\r', '')) || 0
      })

      return item
    })

    return this.ceiCsvUploadService.addOrders(objects, userId)
  }
}
