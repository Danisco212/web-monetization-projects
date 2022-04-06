const script = document.createElement('script')
script.src = chrome.runtime.getURL('injection.js')
document.documentElement.appendChild(script)

// clean it up afterwards
document.documentElement.removeChild(script)

window.addEventListener('load', function () {
  let metaTag = this.document.querySelector('meta[name="monetization"]')
  if (metaTag) {
    this.chrome.runtime.sendMessage(
      { meta: metaTag.content },
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
