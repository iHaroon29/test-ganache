import fetchData from '../helpers/fetch.js'
import {
  dataValidation,
  captureData,
  processFormData,
} from '../helpers/formUtils.js'

const overviewBtn = document.getElementById('overviewBtn')
const castBtn = document.getElementById('castBtn')
const logoutBtn = document.getElementById('logoutBtn')
const overviewBody = document.querySelector('.overview-body')
const castVoteBody = document.querySelector('.cast-vote-body')
const voterRegistrationBody = document.querySelector('.voter-registration-body')

const popupHolder = document.querySelector('.popup-holder')
let childrenDashboard = [...document.querySelector('.dashboard-main').children]
const voterRegisViewBtn = document.getElementById('voterRegisViewBtn')
const voterRegisBtn = document.getElementById('voterRegisBtn')
const phase = ['Registration', 'Voting', 'Complete']

const reloader = async () => {
  childrenDashboard.forEach((node) => {
    if (node.attributes.getNamedItem('flag').value === 'true') {
      node.classList.remove('hide')
      node.classList.add('show')
    } else {
      node.classList.add('hide')
      node.classList.remove('show')
    }
  })
}

const voteVerfication = async (address) => {
  try {
    console.log(address)
    let resp = await App.getVoter(address)
    console.log(resp)
    if (resp[2] && !resp[0]) {
      return true
    }
    return false
  } catch (e) {
    console.log(e.message)
  }
}

const renderContestant = async () => {
  try {
    let a = await App.renderContestant()
    castVoteBody.appendChild(a)
  } catch (e) {
    console.log(e.message)
  }
}

const renderVotingData = async () => {
  try {
    const voteFormHolder = document.createElement('div')
    const contract = await App.contracts.Vote.deployed()
    const result = await contract.contestantsCount.call()

    voteFormHolder.classList.add('.vote-form-holder')
    voteFormHolder.innerHTML = `
                <form action="#" id="voteForm">
              <select name="contestantId" id="voteFormSelect"></select>
              <button type="submit" class="form-submit-btn" id="voteSubmitBtn">
                Submit
              </button>
            </form>`
    castVoteBody.appendChild(voteFormHolder)
    for (var i = 1; i <= result; i++) {
      let option = document.createElement('option')
      option.value = i
      option.innerHTML = i
      document.getElementById('voteFormSelect').appendChild(option)
    }
    const voteSubmitBtn = document.getElementById('voteSubmitBtn')
    voteSubmitBtn.addEventListener('click', async (e) => {
      try {
        e.preventDefault()
        await dataValidation('voteForm')
        const walletAddress = App.accounts[0]
        let a = await voteVerfication(walletAddress)
        if (!a)
          throw new Error(
            'Voter not Registered or has already Voted!! Contact Admin'
          )
        const formData = await captureData('voteForm')
        const test = await processFormData(formData)
        const jsonForm = JSON.parse(test)
        console.log(jsonForm.contestantId)
        const result = await App.castVote(jsonForm.contestantId)
        console.log(result)
      } catch (e) {
        console.log(e.message)
      }
    })
  } catch (e) {
    console.log(e.message)
  }
}

const renderDummyData = async (value) => {
  try {
    const phaseDataHolder = document.createElement('div')
    phaseDataHolder.classList.add('phase-data-holder')
    if (value === 'Registration') {
      phaseDataHolder.innerHTML = `
      <div><h2>Currently in ${value}!! Please try once voting phase has begun.</h2></div>
      `
    } else {
      phaseDataHolder.innerHTML = `
      <div><h2>Voting phase has ended!!</h2></div>
      `
    }
    castVoteBody.appendChild(phaseDataHolder)
  } catch (e) {
    console.log(e.message)
  }
}

// const popupRender = async (data) => {
//   const popup = document.createElement('div')
//   popup.innerHTML = `<p>${data}</p>`

//   popupHolder.appendChild(popup)
//   popupHolder.classList.add('test')
//   setTimeout(() => {
//     popupHolder.classList.remove('test')
//     popupHolder.removeChild(popup)
//   }, 5000)
// }

overviewBtn.addEventListener('click', async (e) => {
  overviewBody.attributes.getNamedItem('flag').value = 'true'
  castVoteBody.attributes.getNamedItem('flag').value = 'false'
  voterRegistrationBody.attributes.getNamedItem('flag').value = 'false'
  await reloader()
})

castBtn.addEventListener('click', async (e) => {
  overviewBody.attributes.getNamedItem('flag').value = 'false'
  castVoteBody.attributes.getNamedItem('flag').value = 'true'
  voterRegistrationBody.attributes.getNamedItem('flag').value = 'false'
  castVoteBody.innerHTML = ''
  let currentPhase = phase[await App.getState()]
  // currentPhase = 'Voting'
  if (currentPhase === 'Voting') {
    await renderContestant()
    await renderVotingData()
  } else {
    await renderDummyData(currentPhase)
  }
  await reloader()
})

voterRegisViewBtn.addEventListener('click', async (e) => {
  overviewBody.attributes.getNamedItem('flag').value = 'false'
  castVoteBody.attributes.getNamedItem('flag').value = 'false'
  voterRegistrationBody.attributes.getNamedItem('flag').value = 'true'
  await reloader()
})

voterRegisBtn.addEventListener('click', async (e) => {
  try {
    e.preventDefault()
    const authData = JSON.parse(localStorage.getItem('authData'))
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${authData.token}`)
    headers.append('Content-Type', 'application/json')
    await dataValidation('voterRegisForm')
    const formData = await captureData('voterRegisForm')
    const a = await processFormData(formData)
    var verificationRes
    const authResp = await fetchData({
      url: 'http://localhost:8000/auth/token',
      options: {
        method: 'GET',
        headers: headers,
        redirect: 'follow',
      },
    })
    if (!authResp.validity) throw new Error(authResp.message)
    const { aadharNumber } = JSON.parse(a)
    const aadharResp = await fetchData({
      url: `http://localhost:8001/aadhar/?email=${authData.email}`,
      options: {
        method: 'GET',
        headers: headers,
        redirect: 'follow',
      },
    })
    if (aadharResp.result.length !== 0) {
      verificationRes = await fetchData({
        url: `http://localhost:8000/auth/hash?data=${aadharNumber}&hashedData=${aadharResp.result[0].aadharNumber}`,
        options: {
          method: 'GET',
          headers: headers,
          redirect: 'follow',
        },
      })
      if (
        verificationRes.result ||
        authData.email === aadharResp.result[0].email
      )
        throw new Error(`User exists, Please continue!`)
    }
    if (!aadharResp.result) throw new Error(aadharResp.message)
    let postData = JSON.parse(a)
    postData.email = authData.email
    postData.username = authData.username
    const aadharSaveResp = await fetchData({
      url: `http://localhost:8001/aadhar/new`,
      options: {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(postData),
        redirect: 'follow',
      },
    })
    alert(aadharSaveResp.message)
  } catch (e) {
    alert(e.message)
  }
})

logoutBtn.addEventListener('click', async (e) => {
  try {
    const authData = JSON.parse(localStorage.getItem('authData'))
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${authData.token}`)
    const options = {
      method: 'GET',
      headers: headers,
    }
    const resp = await fetchData({
      url: 'http://localhost:8000/auth/logout',
      options,
    })
    window.location.assign(`http://127.0.0.1:5500/src/${resp.redirect}`)
  } catch (e) {
    console.log(e.message)
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Locked and loaded')
  await reloader()
})
