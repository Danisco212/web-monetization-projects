export const background = () => {
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
