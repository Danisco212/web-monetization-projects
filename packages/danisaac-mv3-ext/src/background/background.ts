// lifecycle logging for service worker
const lifecycleLogs = () => {
  chrome.webNavigation.onBeforeNavigate.addListener(e => {
    console.log('on extension loaded', e)
  })

  chrome.webNavigation.onCommitted.addListener(e => {
    console.log('on commited')
  })

  chrome.webNavigation.onDOMContentLoaded.addListener(e => {
    console.log('on DOM completed')
  })

  chrome.webNavigation.onCompleted.addListener(e => {
    console.log('on completed')
  })
}

export const background = () => {
  // initializing the logs
  lifecycleLogs()

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // action can be performed here with the message and passed in the sendResponse
    // sample action
    const newMessage = {
      receivedMessage: message
    }
    // send newMessage back to content-script to perform action with it
    sendResponse(newMessage)
  })
}

background()
