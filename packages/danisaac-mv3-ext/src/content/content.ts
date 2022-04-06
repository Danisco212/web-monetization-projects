export const contentScript = () => {
  const script = document.createElement('script')

  // getting the injection script through absolute URL
  script.src = chrome.runtime.getURL('/static/injection.js')
  document.documentElement.appendChild(script)

  // clean it up afterwards
  document.documentElement.removeChild(script)

  window.addEventListener('load', function () {
    const metaTag = this.document.querySelector('meta[name="monetization"]')
    if (metaTag) {
      this.chrome.runtime.sendMessage(
        { meta: metaTag.textContent },
        function (respnse) {
          console.log(respnse)
        }
      )
    } else {
      this.chrome.runtime.sendMessage(
        { meta: 'there is no monetization tag' },
        function (respnse) {
          console.log(respnse)
        }
      )
    }
  })
}

contentScript()
