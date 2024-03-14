import { CreateStockDto } from './dto/create-stock.dto'
import { Stock } from './stock.entity'

export abstract class StocksRepository {
    abstract findStockByTicker(ticker: string): Promise<Stock | null>
    abstract createStock(createStockDto: CreateStockDto): Promise<string>
    abstract getStockTypes(): Promise<string[]>
}