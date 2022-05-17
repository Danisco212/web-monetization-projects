// global variable to hold the current lifecycle state of the worker
let currentState = 'init'

// lifecycle logging for service worker
export function lifecycleLogs() {
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
