export class CsvItem {
  public type: CsvItemTypeEnum
  public date: Date
  public category: CsvItemCategoryEnum
  public ticker: string
  public institution: string
  public holder: string
  public quantity: number
  public price: number
  public grossValue: number

  constructor(data: CsvItem) {
    Object.assign(this, data)
  }
}

export enum CsvItemTypeEnum {
  CREDIT = 'Credito',
  DEBIT = 'Debito'
}

export enum CsvItemCategoryEnum {
  JCP = 'Juros Sobre Capital Próprio',
  DIVIDEND = 'Dividendo',
  LIQUIDATION = 'Transferência - Liquidação',
  INCOME = 'Rendimento'
}
