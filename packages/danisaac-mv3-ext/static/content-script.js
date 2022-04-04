const script = document.createElement('script')
script.src = chrome.runtime.getURL('injection.js')
document.documentElement.appendChild(script)

// clean it up afterwards
document.documentElement.removeChild(script)
