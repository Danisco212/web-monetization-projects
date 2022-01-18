import { EventEmitter } from 'events'

import { GraphQlClient } from '@coil/client'
import { inject, injectable } from 'inversify'

import { LocalStorageProxy } from '../../types/storage'
import * as tokens from '../../types/tokens'
import { formatTipSettings } from '../util/formatters'
import { TipSent } from '../../types/commands'
import { notNullOrUndef } from '../../util/nullables'
import { IUserPaymentMethod } from '../../types/user'

import { logger, Logger } from './utils'
import { Stream } from './Stream'
import { BackgroundFramesService } from './BackgroundFramesService'

@injectable()
export class TippingService extends EventEmitter {
  constructor(
    @inject(tokens.LocalStorageProxy)
    private store: LocalStorageProxy,
    private client: GraphQlClient,
    @logger('TippingService')
    private log: Logger,
    private framesService: BackgroundFramesService
  ) {
    super()
  }

  async updateTipSettings(token: string): Promise<string | null> {
    /* 
      updateTipSettings is responsible for fetching the data needed for the tipping views -> tipSettings 
      after it fetches the data it then formats the values to make it easier for the views to consume
    */

    const resp = await this.client.tipSettings(token)

    this.log('updateTippingSettings', resp)
    if (resp.data?.whoami && resp.data?.minTipLimit) {
      // destructuring response values and setting defaults
      const {
        whoami,
        minTipLimit: { minTipLimit = 1 },
        getUserTipCredit,
        tippingBetaFeatureFlag,
        extensionNewUiFeatureFlag
      } = resp.data ?? {}
      const { tipping: { lastTippedAmount = 0, limitRemaining = 0 } = {} } =
        whoami ?? {}
      // tipCredit will return null for users who have no tip credits -> destructuring doesn't work on null values
      const tipCreditBalanceCents =
        getUserTipCredit == null ? 0 : getUserTipCredit?.balance ?? 0

      // need to know if the user has a credit card in order to calculate the maximum allowable tip
      // getting the payment methods out of the user object in the store
      const { paymentMethods = [] as Array<IUserPaymentMethod> } =
        this.store.user ?? {}
      const hasCreditCard =
        paymentMethods.findIndex((paymentMethod: IUserPaymentMethod) => {
          return paymentMethod.type === 'stripe'
        }) > -1

      // need to know if the site is monetized in order to calculate the maximum allowable tip
      // a non monetized site should default to $0
      const siteIsMonetized = this.store.monetized
        ? this.store.monetized
        : false

      // format the tip settings
      const formattedTipSettings = await formatTipSettings(
        siteIsMonetized,
        tippingBetaFeatureFlag,
        hasCreditCard,
        Number(limitRemaining),
        Number(lastTippedAmount),
        Number(minTipLimit),
        Number(tipCreditBalanceCents)
      )

      // update user object on local storage
      if (this.store.user) {
        this.store.user = {
          ...this.store.user,
          tippingBetaFeatureFlag,
          extensionNewUiFeatureFlag,
          tipSettings: { ...formattedTipSettings }
        }
      }

      return token
    } else {
      return null
    }
  }

  async sendTip(
    tabId: number,
    streamId: string,
    stream: Stream,
    token: string | null
  ): Promise<TipSent> {
    if (!streamId) {
      this.log('can not find top frame for tabId=%d', tabId)
      throw new Error(`Can not find top frame for tabId ${tabId}`)
    }

    if (!stream || !token) {
      this.log(
        'sendTip: no stream | token. !!stream !!token ',
        !!stream,
        !!token
      )
      throw new Error('Either one or both of stream and token were undefined')
    }

    const receiver = stream.getPaymentPointer()
    const { assetCode, assetScale, exchangeRate } = stream.getAssetDetails()
    const amount = Math.floor(1e9 * exchangeRate).toString() // 1 USD, assetScale = 9

    this.log(`sendTip: sending tip to ${receiver}`)
    const result = await this.client.query({
      query: `
        mutation sendTip($receiver: String!) {
          sendTip(receiver: $receiver) {
            success
          }
        }
      `,
      token,
      variables: {
        receiver
      }
    })
    this.log(`sendTip: sent tip to ${receiver}`, result)
    return {
      command: 'tip',
      data: {
        paymentPointer: receiver,
        amount,
        assetCode,
        assetScale
      }
    }
  }

  public async tipPreview(
    tip: number,
    token: string
  ): Promise<{
    success: boolean
    message?: string
    creditCardCharge?: string
    tipCreditCharge?: string
  }> {
    if (!token) {
      this.log('tipPreview: token. !!token ', !!token)
      throw new Error('Token was undefined')
    }

    // Set tip amount
    const CENTS = 100
    const tipAmountCents = Math.floor(tip * CENTS).toString()

    try {
      this.log('tipPreview: requesting tip preview')

      const result = await this.client.tipPreview(token, tipAmountCents)

      return {
        success: true,
        creditCardCharge: result.charges.creditCardCharge,
        tipCreditCharge: result.charges.tipCreditCharge
      }
    } catch (e) {
      this.log(`tipPreview: error. msg=${e.message}`)
      throw new Error(e.message)
    }
  }

  public async tip(
    tip: number,
    tabId: number,
    stream: Stream,
    token: string
  ): Promise<{ code: string; message: string; success: boolean }> {
    if (!stream) {
      this.log('can not find top frame for tabId=%d', tabId)
      throw new Error('Stream was undefined')
    }

    if (!token) {
      this.log('tip: no token. !!token', !!token)
      throw new Error('Token was undefined')
    }

    const receiver = stream.getPaymentPointer()

    // Set tip amount
    const CENTS = 100
    const tipAmountCents = Math.floor(tip * CENTS).toString()

    // Set active tab url
    const frameId = 0
    const frame = notNullOrUndef(
      this.framesService.getFrame({ frameId, tabId })
    )
    const activeTabUrl = frame.href

    try {
      this.log(`tip: sending tip to ${receiver}`)

      const result = await this.client.tip(token, {
        tipAmountCents,
        destination: receiver,
        origin: activeTabUrl
      })

      this.log(`tip: sent tip to ${receiver}`, result)
      return result
    } catch (e) {
      this.log(`tip: error. msg=${e.message}`)
      console.warn(`tip: error. msg=${e.message}`)
      throw new Error(e.message)
    }
  }
}