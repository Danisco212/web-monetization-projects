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

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // action can be performed here with the message and passed in the sendResponse
    // sample action
    const newMessage = {
      receivedMessage: message,
      state: currentState
    }
    // send newMessage back to content-script to perform action with it
    sendResponse(newMessage)
    return true
  })
}

background()
