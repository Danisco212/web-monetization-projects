import { lifecycleLogs } from './lifecycle'
import { payout } from './payout/mv3-payout'

function attemptPayout(hasMonetization: boolean, monetizationTag: string) {
  // check if there is a meta tag
  if (hasMonetization) {
    // payout to the site
    chrome.storage.local.get(['btpToken'], async function (result: any) {
      if (result.btpToken) {
        console.log('the btpToken is', result)
        await payout(monetizationTag, console.log, result.btpToken)
      } else {
        console.log('not logged into coil')
      }
    })
  } else {
    console.log('Not tag to payout')
  }
}

export interface Message {
  monetizationTag: string
  data: Record<string, unknown> | string | undefined
}

export const background = () => {
  // initializing the logs
  lifecycleLogs()

  let hasMonetization = false
  let monetizationTag = ''

  chrome.runtime.onMessage.addListener(
    async (message: Message, sender, sendResponse) => {
      // if the message is login successful try to payout to site
      if (message.data !== 'logged in') {
        if (!message.monetizationTag.includes('monetization')) {
          hasMonetization = true
          monetizationTag = message.monetizationTag
        }
      }
      attemptPayout(hasMonetization, monetizationTag)
      return false
    }
  )
}
background()
