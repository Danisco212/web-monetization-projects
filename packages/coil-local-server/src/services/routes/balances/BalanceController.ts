import { inject, injectable } from '@dier-makr/annotations'
import {
  BaseHttpController,
  controller,
  httpGet
} from 'inversify-express-utils'

import { BalanceService } from './BalanceService'

@controller('/balance')
export class BalanceController extends BaseHttpController {
  constructor(private balance: BalanceService) {
    super()
  }

  @httpGet('/')
  balances() {
    return `
        <p>
This is where the balances of the payment pointer will be tallied ${this.balance.getSimpleData()}
</p>  
        `
  }
}
