import { Injectable } from '@nestjs/common'
import { CreateStockDto } from './dto/create-stock.dto'
import { StocksRepository } from './stocks.repository'
import { Stock } from './stock.entity'

@Injectable()
export class StocksService {
  constructor(private readonly stockRepository: StocksRepository){}

  async findStockByTicker(ticker: string): Promise<Stock | null>{
    return this.stockRepository.findStockByTicker(ticker)
  }

  async createStock(createStockDto: CreateStockDto): Promise<string> {
    return this.stockRepository.createStock(createStockDto)
  }

  async getStockTypes(): Promise<string[]> {
    return this.stockRepository.getStockTypes()
  }
}
