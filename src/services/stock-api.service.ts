import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

export interface AlphaAPIResponse {
  'Global Quote': GlobalQuote
}

export interface GlobalQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': Date;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

@Injectable()
export class StockApiService {
  constructor(private configService: ConfigService) { }

  async updateStock(ticker: string): Promise<GlobalQuote> {
    const apiKey = this.configService.get<string>('ALPHA_VANTAGE_API_KEY')
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}.SAO&apikey=${apiKey}`
    const { data } = await axios.get<AlphaAPIResponse>(url)

    return data['Global Quote']
  }
}