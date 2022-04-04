const script = document.createElement('script')
script.src = chrome.runtime.getURL('injection.js')
document.documentElement.appendChild(script)

// clean it up afterwards
document.documentElement.removeChild(script)

window.addEventListener('load', function () {
  let metaTag = this.document.querySelector('meta[name="monetization"]').content
  if (metaTag) {
    this.chrome.runtime.sendMessage({ meta: metaTag }, function (respnse) {
      console.log(respnse)
    })
  }
})
