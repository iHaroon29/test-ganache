import fetchRequest from '../helpers/fetch.js'
import {
  dataValidation,
  captureData,
  processFormData,
} from '../helpers/formUtils.js'

const loginSubmitBtn = document.querySelector('#loginSubmitBtn')
const signupSubmitBtn = document.querySelector('#signupSubmitBtn')

const loginRequest = async () => {
  loginSubmitBtn.addEventListener('click', async (e) => {
    try {
      e.preventDefault()
      let headers = new Headers()
      headers.append('Content-Type', 'application/json')
      await dataValidation('loginForm')
      const formData = await captureData('loginForm')
      const options = {
        method: 'POST',
        body: await processFormData(formData),
        headers: headers,
        redirect: 'follow',
      }
      const resp = await fetchRequest({
        url: 'http://localhost:8000/auth/login',
        options,
      })
      const { auth, username, email, token, typeOfUser, _id } = resp
      if (!auth) throw new Error(resp.message)
      localStorage.setItem('authData', JSON.stringify(resp))
      if (typeOfUser === 'admin') {
        window.location.assign('http://127.0.0.1:5500/src/admindashboard.html')
      } else {
        window.location.assign('http://127.0.0.1:5500/src/dashboard.html')
      }
    } catch (e) {
      alert(e.message)
    }
  })
}

const signupRequest = async () => {
  signupSubmitBtn.addEventListener('click', async (e) => {
    try {
      e.preventDefault()
      let headers = new Headers()
      headers.append('Content-Type', 'application/json')
      await dataValidation('signupForm')
      const formData = await captureData('signupForm')
      const options = {
        method: 'POST',
        body: await processFormData(formData),
        headers: headers,
        redirect: 'follow',
      }
      const resp = await fetchRequest({
        url: 'http://localhost:8000/auth/signup',
        options,
      })
      const { auth, result, token } = resp
      const { username, email, typeOfUser, _id } = result
      if (!auth) throw new Error(resp.message)
      localStorage.setItem(
        'authData',
        JSON.stringify({ auth, username, email, typeOfUser, _id, token })
      )
      window.location.assign('http://127.0.0.1:5500/src/dashboard.html')
    } catch (e) {
      alert(e.message)
    }
  })
}

const slider = async () => {
  let flag = true
  const loginToggler = document.querySelector('#loginToggler')
  const signupToggler = document.querySelector('#signupToggler')
  const signupForm = document.querySelector('.signup-form-holder')
  const loginForm = document.querySelector('.login-form-holder')
  if (!flag) {
    signupForm.style.display = 'block'
  } else {
    loginForm.style.display = 'block'
  }

  signupToggler.addEventListener('click', (e) => {
    if (flag) {
      signupForm.style.display = 'block'
      loginForm.style.display = 'none'
      flag = false
    }
  })

  loginToggler.addEventListener('click', (e) => {
    if (!flag) {
      loginForm.style.display = 'block'
      signupForm.style.display = 'none'
      flag = true
    }
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  await slider()
  await loginRequest()
  await signupRequest()
})
