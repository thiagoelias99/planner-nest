export class CreateStockOrderDto {
  constructor(data) {
    Object.assign(this, data)
  }

  userId: string
  orders: Order[]
}

interface Order {
  stockTicker: string
  companyName: string
  orderType: 'BUY' | 'SELL'
  quantity: number
  price: number
  date: Date
}