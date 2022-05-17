import React from 'react'

import { Message } from '../../background/background'
import { loginToCoil } from '../../background/payout/login'

import { CustomInput } from './CustomInput'

// pass username and password from main popup state (not using redux)
export function LoginForm() {
  // username and password to be saved in local storage
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  function changeEmail(e: any) {
    setEmail(e.target.value)
  }

  function changePassword(e: any) {
    setPassword(e.target.value)
  }

  function validateEmail(mail: string) {
    if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return true
    }
    return false
  }

  async function loginWithCoil() {
    setError('')
    // validate fields
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (password.length < 5) {
      setError('Please enter a valid password')
      return
    }

    setLoading(true)
    // login NOTE: there is no condition for a failed login attempt, use real credentials for ease :)
    const userAuth = await loginToCoil(console.log, true, {
      email: email,
      password: password
    })
    setLoading(false)
    console.log('The user authentication data', userAuth)

    // only works if login was successfull
    // testing local storage (not adviced to save token this way, but we testing so it fine :))
    chrome.storage.local.set({ btpToken: userAuth.btpToken }, function () {
      console.log('saved the btpToken to local storage')
      const message: Message = { data: '', monetizationTag: '' }
      message.data = 'logged in'
      chrome.runtime.sendMessage(message, async function (response: any) {
        console.log(response)
        window.close()
      })
    })
  }

  // using inline styles for simplicity to get results
  return (
    <div
      style={{
        padding: '10px 20px'
      }}
    >
      <h2>Login Form</h2>
      <CustomInput
        onChange={changeEmail}
        type='text'
        placeholder={'Enter coil email'}
        value={email}
      />
      <div style={{ height: 10 }} />
      <CustomInput
        onChange={changePassword}
        type='password'
        placeholder={'*******'}
        value={password}
      />
      {loading && <p>Loading...</p>}
      {error.length > 0 && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && (
        <button
          onClick={loginWithCoil}
          style={{
            width: 100
          }}
        >
          Login
        </button>
      )}
    </div>
  )
}
