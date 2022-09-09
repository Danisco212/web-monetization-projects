import { inject, injectable } from '@dier-makr/annotations'
import {
  BaseHttpController,
  controller,
  httpGet
} from 'inversify-express-utils'

import { BalancesService } from './BalancesService'

@controller('/balances')
export class BalancesController extends BaseHttpController {
  constructor(private balance: BalancesService) {
    super()
  }

  private printAllData = () => {
    const keys = Object.keys(this.balance.getBalances())
    const allAmounts: Array<{ pointer: string; amount: number }> = []
    keys.forEach(key => {
      const pointerAmount = {
        pointer: key,
        amount: this.balance.getBalances()[key]
      }
      allAmounts.push(pointerAmount)
    })
    return allAmounts
  }

  @httpGet('/')
  balances() {
    return this.printAllData()
  }
  //   balances() {
  //     return `
  //     <html>
  //     <body>
  //     <script type="application/javascript">
  //     setInterval(() => {
  //       window.location.reload()
  //     }, 1000)
  // </script>
  //         <p>
  // ${this.printAllData()}
  // </p>
  // </body>
  // </html>
  //         `
  //   }
}
