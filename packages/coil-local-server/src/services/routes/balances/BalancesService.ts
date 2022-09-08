import { inject, injectable } from 'inversify'

@injectable()
export class BalancesService {
  constructor(private balances: Record<string, any> = {}) {
    this.balances = balances
  }

  logBalance(data: Record<string, any>) {
    this.balances[data.paymentPointer] = data.amount
  }

  public getBalances = () => {
    return this.balances
  }
}
