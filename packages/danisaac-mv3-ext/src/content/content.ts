import { payout } from '../background/payout/mv3-payout'

export const contentScript = () => {
  const script = document.createElement('script')

  // getting the injection script through absolute URL
  script.src = chrome.runtime.getURL('/static/injection.js')
  document.documentElement.appendChild(script)

  // clean it up afterwards
  document.documentElement.removeChild(script)

  window.addEventListener('load', async function () {
    const metaTag = this.document.querySelector('meta[name="monetization"]')
    if (metaTag) {
      this.chrome.runtime.sendMessage(
        { meta: metaTag.getAttribute('content') },
        async function (response) {
          console.log(response)
          await payout(response.receivedMessage.meta, console.log)
        }
      )
    } else {
      this.chrome.runtime.sendMessage(
        { meta: 'there is no monetization tag' },
        function (response) {
          console.log(response)
        }
      )
    }
  })
}

contentScript()
