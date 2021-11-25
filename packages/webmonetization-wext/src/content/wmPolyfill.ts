const createBindingCode = (...events: string[]) => {
  return events
    .map(
      e =>
        `document.monetization.addEventListener('${e}', ` +
        `(e) => console.log(
           '%c Web-Monetization %s event:  %s',
           'color: aqua; background-color: black',
           e.type,
           JSON.stringify(e.detail)) )
          `
    )
    .join(';')
}

const basicEventsLoggingCode = createBindingCode(
  'monetizationstart',
  'monetizationstop',
  'monetizationpending'
)

// This can be quite noisy so only enable when localStorage.WM_DEBUG_PROGRESS
// is set.
const progressLoggingCode = createBindingCode('monetizationprogress')

// TODO: would be nicer to hotrod the webpack script and implement this
// in typescript somehow
// See: https://webpack.js.org/guides/asset-modules/
// language=JavaScript
export const wmPolyFillMinimal = `
  // Block scope everything so nothing is defined on window
  {
    const selector = 'link[rel="monetization"]'

    // navigator.monetization only ever lives in the main page context, so
    // we are fine to create these custom events in that main context too.
    class MonetizationEvent extends Event {
      #detail = null

      constructor(detail) {
        super('monetization')
        this.#detail = detail
        Object.assign(this, detail)
      }

      get [Symbol.toStringTag]() {
        return 'MonetizationEvent'
      }

      toJSON() {
        return this.#detail
      }
    }

    // TODO: is this justifiable as long as it's not exported to the window
    // namespace, causing pollution problems ?
    // How do we know there will never be any fields on this ?
    class MonetizationStateChangeEvent extends Event {
      constructor() {
        super('statechange')
      }

      get [Symbol.toStringTag]() {
        return 'MonetizationStateChangeEvent'
      }
    }

    class Monetization extends EventTarget {
      state = 'idle'
      #monetizationlistener = null
      #statechangelistener = null

      addEventListener(type, callback, options) {
        super.addEventListener(type, callback, options)
      }

      get onmonetization() {
        return this.#monetizationlistener
      }

      set onmonetization(callback) {
        if (callback === null && this.#monetizationlistener) {
          this.removeEventListener('monetization', this.#monetizationlistener)
          this.#monetizationlistener = null
        } else {
          this.addEventListener('monetization', callback)
          this.#monetizationlistener = callback
        }
      }

      get onstatechange() {
        return this.#statechangelistener
      }

      set onstatechange(callback) {
        if (callback === null && this.#statechangelistener) {
          this.removeEventListener('statechange', this.#statechangelistener)
          this.#statechangelistener = null
        } else {
          this.addEventListener('statechange', callback)
          this.#statechangelistener = callback
        }
      }

      get [Symbol.toStringTag]() {
        return 'Monetization'
      }

      toJSON() {
        const json = { state: this.state }
        if (Monetization.prototype.hasOwnProperty('pointer')) {
          json['pointer'] = this.pointer
        }
        return json
      }
    }

    // TODO: url as per the event
    if (localStorage.WM_POINTER_PROPERTY) {
      Object.defineProperty(Monetization.prototype, 'pointer', {
          get() {
            const link = document.querySelector(selector)
            if (link && link.hasAttribute('href')) {
              return link.getAttribute('href')
            }
            return null
          },

          set(val) {
            // NOTE: document.title will edit an existing <title> tag, and
            // append a <title> if none exist
            if (val === null) {
              const existing = document.querySelector(selector)
              if (existing) {
                existing.remove()
              }
            } else if (typeof val !== 'string') {
              throw new Error('pointer must be https:// url string')
            } else {
              let existing = document.querySelector(selector)
              if (!existing) {
                const newLink = document.createElement('link')
                // The monetization tag observer likely needs these all in
                // good shape, hence the separate code blocks depending on
                // whether we have an existing link or not.
                newLink.setAttribute('rel', 'monetization')
                newLink.setAttribute('href', val)
                // TODO: this could be null
                document.head.appendChild(newLink)
              } else {
                existing.setAttribute('href', val)
              }
            }
          }
        }
      )
    }

    const monetization = navigator.monetization = new Monetization()

    document.monetization = new EventTarget()
    document.monetization.state = 'stopped'

    document.addEventListener('monetization-v1', function(event) {
      const { type, detail } = event.detail
      if (type === 'monetizationstatechange') {
        // document.monetization
        document.monetization.state = detail.state

        // navigator.monetization
        const oldState = navigator.monetization.state

        let newState
        // TODO: when exactly is interactive ???
        if (detail.state === 'started') {
          newState = 'interactive'
        }
        // if (detail.state === 'pending') {
        //   newState = 'interactive'
        // }
        if (detail.state === 'stopped') {
          newState = 'idle'
        }
        if (newState && (newState !== oldState)) {
          monetization.state = newState
          monetization.dispatchEvent(new MonetizationStateChangeEvent())
        }
      } else {
        document.monetization.dispatchEvent(
          new CustomEvent(type, {
            detail: detail
          }))
        if (type === 'monetizationprogress') {
          const toNew = {...detail}
          // paymentPointer is renamed to url
          toNew.url = toNew.paymentPointer
          delete toNew.paymentPointer
          monetization.dispatchEvent(
            new MonetizationEvent(toNew))
        }
      }
    })

    // Exports to global namespace
    // TODO: what do we explicitly want to export here?
    window.MonetizationEvent = MonetizationEvent
    window.Monetization = Monetization

  }
`

// language=JavaScript
export const wmPolyfill = `
  ${wmPolyFillMinimal}

  if (localStorage.WM_DEBUG) {
    ${basicEventsLoggingCode}
    navigator.monetization.addEventListener('statechange', (e) => {
      console.log(
        '%c Web-Monetization-2 statechange event: %s %o',
        'color: aqua; background-color: black', navigator.monetization.state, e)
    })
  }

  // <REPLACEMENT_PLACEHOLDER />

  if (localStorage.WM_DEBUG_PROGRESS) {
      /*${progressLoggingCode}*/
    navigator.monetization.addEventListener('monetization', (e) => {
      console.log(
        '%c Web-Monetization-2 monetization event: %o',
        'color: aqua; background-color: black', e)
    })
  }
`

export const includePolyFillMessage = `
Unable to inject \`document.monetization\` polyfill!
Include the polyfill in your page:
<script type="application/javascript">${wmPolyFillMinimal}</script>
`
