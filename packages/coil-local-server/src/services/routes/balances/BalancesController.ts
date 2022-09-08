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
    const allAmounts: Array<any> = []
    keys.forEach(key => {
      const pointerAmount =
        'Payment pointer: ' +
        key +
        ' - Amount:' +
        this.balance.getBalances()[key] +
        '<br>'
      allAmounts.push(pointerAmount)
    })
    return allAmounts
  }

  @httpGet('/')
  balances() {
    return `
    <html>
    <body>
    <script type="application/javascript">
    setInterval(() => {
      // print data
      ${this.printAllData()}
      window.location.reload()
    }, 1000)
</script>
        <p>
${this.printAllData()}
</p> 
</body>
</html> 
        `
  }
}
