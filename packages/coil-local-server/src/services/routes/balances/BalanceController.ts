import { inject, injectable } from '@dier-makr/annotations'
import {
  BaseHttpController,
  controller,
  httpGet
} from 'inversify-express-utils'

import { BalanceService } from './BalanceService'

@controller('/balances')
export class BalanceController extends BaseHttpController {
  constructor(private balance: BalanceService) {
    super()
  }

  @httpGet('/')
  balances() {
    return `
        <p>
Payment pointer: ${
      this.balance.getSimpleData()['pointer']
    } has an amount of: $ ${this.balance.getSimpleData()['amount']}
</p>  
        `
  }
}
