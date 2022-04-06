chrome.runtime.onMessage.addListener((message, sender, response) => {
  response(message)
  return true
})

chrome.webNavigation.onBeforeNavigate.addListener(e => {
  chrome.tabs.executeScript(e.tabId, {}, e => {
    console.log('on extension loaded', e)
  })
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
