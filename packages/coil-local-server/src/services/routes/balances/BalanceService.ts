import { inject, injectable } from 'inversify'
import { TLogger } from 'packages/coil-local-server/src/di/tokens'
import { Logger } from 'packages/coil-local-server/src/utils/logger'

@injectable()
export class BalanceService {
  constructor(private balances: Record<string, any> = {}) {
    this.balances = balances
  }

  addData(data: Record<string, any>) {
    this.balances = data
  }

  public getSimpleData = () => {
    return this.balances
  }
}
