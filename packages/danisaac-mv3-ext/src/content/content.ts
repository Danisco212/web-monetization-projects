import { Message } from '../background/background'

export const contentScript = () => {
  const script = document.createElement('script')

  // getting the injection script through absolute URL
  script.src = chrome.runtime.getURL('/static/injection.js')
  document.documentElement.appendChild(script)

  // clean it up afterwards
  document.documentElement.removeChild(script)

  window.addEventListener('load', async function () {
    const metaTag = this.document.querySelector('meta[name="monetization"]')
    const message: Message = {
      monetizationTag: '',
      data: ''
    }
    if (metaTag) {
      message.monetizationTag = metaTag.getAttribute('content') ?? ''
      chrome.runtime.sendMessage(message, async function (response: any) {
        console.log(response)
        // await payout(response.receivedMessage.meta, console.log)
      })
    } else {
      chrome.runtime.sendMessage(message, function (response: any) {
        console.log(response)
      })
    }
  })
}

contentScript()
