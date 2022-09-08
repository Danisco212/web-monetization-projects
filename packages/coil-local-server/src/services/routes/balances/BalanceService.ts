import { inject, injectable } from 'inversify'

@injectable()
export class BalanceService {
  // constructor (
  //     private balance: String
  //     ) {
  //     this.balance = balance
  // }

  public getSimpleData = () => {
    return 'nothing here is important'
  }
}
