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

export const background = () => {
  // initializing the logs
  lifecycleLogs()

  let connection: any = null

  chrome.tabs.onActivated.addListener(async function (activeInfo: any) {
    if (connection) {
      console.log(connection)
      connection.end()
    }
  })

  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      // action can be performed here with the message and passed in the sendResponse
      // sample action
      const newMessage = {
        receivedMessage: message,
        state: currentState,
        management: chrome.management.getSelf
      }
      if (!message.meta.includes('monetization')) {
        connection = await payout(message.meta, console.log)
      }
      // send newMessage back to content-script to perform action with it
      sendResponse(newMessage)
      return false
    }
  )
}
background()
