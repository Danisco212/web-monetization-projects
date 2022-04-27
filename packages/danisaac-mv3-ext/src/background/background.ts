// import { payout } from './payout/mv3-payout'

import { payout } from './payout/mv3-payout'

// global variable to hold the current lifecycle state of the worker
let currentState = 'init'

// lifecycle logging for service worker
const lifecycleLogs = () => {
  chrome.webNavigation.onBeforeNavigate.addListener(e => {
    console.log('on extension loaded', e)
    currentState = 'new load'
  })

  chrome.webNavigation.onCommitted.addListener(e => {
    console.log('on commited')
    currentState = 'commit'
  })

  chrome.webNavigation.onDOMContentLoaded.addListener(e => {
    console.log('on DOM completed')
    currentState = 'DOM completed'
  })

  chrome.webNavigation.onCompleted.addListener(e => {
    console.log('on completed')
    currentState = 'load complete'
  })

  chrome.runtime.onSuspend.addListener(() => {
    console.log('suspended')
    currentState = 'suspended'
  })
}

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

export const background = () => {
  // initializing the logs
  lifecycleLogs()

  let hasMonetization = false
  let monetizationTag = ''

  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      // if the message is login successful try to payout to site
      if (message !== 'logged in') {
        if (!message.meta.includes('monetization')) {
          hasMonetization = true
          monetizationTag = message.meta
        }
      }
      attemptPayout(hasMonetization, monetizationTag)
      return false
    }
  )
}
background()
