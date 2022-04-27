import React from 'react'
import ReactDom from 'react-dom'

import { LoginForm } from './components/LoginForm'

function LogoutView() {
  function removeTokenFromStorage() {
    chrome.storage.local.clear(function () {
      console.log('removed all data')
      window.close()
    })
  }
  return (
    <div
      style={{
        width: 200,
        height: 150,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <h3>Already Logged in...</h3>
      <button style={{ width: 100 }} onClick={removeTokenFromStorage}>
        Logout
      </button>
    </div>
  )
}

export function main(): void {
  const rootElement = document.getElementById('root')

  chrome.storage.local.get(['btpToken'], async function (result: any) {
    if (result.btpToken) {
      ReactDom.render(<LogoutView />, rootElement)
    } else {
      ReactDom.render(<LoginForm />, rootElement)
    }
  })
}

main()
