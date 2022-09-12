import fetchData from '../helpers/fetch.js'
import {
  dataValidation,
  captureData,
  processFormData,
} from '../helpers/formUtils.js'

const overviewSectionBtn = document.getElementById('overviewSectionBtn')
const addCandidateSectionBtn = document.getElementById('addCandidateSectionBtn')
const addVoterSectionBtn = document.getElementById('addVoterSectionBtn')
const addVoterBtn = document.getElementById('addVoterBtn')
const electionResultsBody = document.querySelector('.election-results-body')
const electionResultsSectionBtn = document.getElementById(
  'electionResultsSectionBtn'
)
const changeElectionStateSectionBtn = document.getElementById(
  'changeElectionStateSectionBtn'
)
const updateElectionStateBtn = document.getElementById('updateElectionStateBtn')
const logoutBtn = document.getElementById('logoutBtn')
const overviewBody = document.querySelector('.overview-body')
const addVoterBody = document.querySelector('.add-voter-body')
const voterAddressWalletForm = document.querySelector(
  '.voter-wallet-address-form'
)
const voterRegisBody = document.querySelector('.voter-registration-body')
const addCandidateBody = document.querySelector('.add-candidate-body')
const changeElectionStateBody = document.querySelector(
  '.change-election-state-body'
)
const addCandidateFormBtn = document.getElementById('addCandidateFormBtn')
let childrenDashboard = [...document.querySelector('.dashboard-main').children]
const phase = ['Registration', 'Voting', 'Complete']

const reloader = () => {
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

const renderDummyData = async (value) => {
  try {
    const phaseDataHolder = document.createElement('div')
    phaseDataHolder.classList.add('phase-data-holder')
    if (value === 'Registration') {
      phaseDataHolder.innerHTML = `
      <h2>Currently in ${value}!! Please try once voting phase has ended.</h2>
      `
    } else {
      phaseDataHolder.innerHTML = `
      <div><h2>Voting phase has ended!!</h2></div>
      `
    }
    electionResultsBody.appendChild(phaseDataHolder)
  } catch (e) {
    console.log(e.message)
  }
}

const renderResultData = async () => {
  try {
    const contract = await App.contracts.Vote.deployed()
    const result = await contract.contestantsCount.call()
    let b = document.createElement('div')
    let totalVoteCount = 0
    b.classList.add('election-result-holder')
    for (var i = 1; i <= result; i++) {
      let data = await contract.contestants(i)
      totalVoteCount += +data[2]
      let c = document.createElement('div')
      c.classList.add('candidate-details')
      c.innerHTML = `<div class="img-holder">
                <img src="./Assets/dummy_600x600_ffffff_cccccc.png" alt="candidate-img" />
              </div>
              <div class="text-holder">
              <p>Name: ${data[1]}</p>
              <p>Vote Count: ${data[2]}</p>
                <p>Age: ${data[4]}</p>
                <p>Party: ${data[5]}</p>
                <p>Qualification: ${data[3]}</p>
              </div>`
      b.appendChild(c)
    }
    const totalCountHolder = document.createElement('div')
    totalCountHolder.classList.add('total-count-holder')
    totalCountHolder.innerHTML = `<p>Total Vote Count: ${totalVoteCount}</p>`
    electionResultsBody.append(b)
    electionResultsBody.append(totalCountHolder)
  } catch (e) {
    console.log(e.message)
  }
}

const dataCleanUp = async (tagName) => {
  const childrenArray = [...tagName.children]
  if (childrenArray.length === 0) return
  childrenArray.forEach((node) => {
    tagName.removeChild(node)
  })
}

const voterDataRender = async (data) => {
  try {
    const voterWalletAddressHolder = document.createElement('div')
    voterWalletAddressHolder.classList.add('voter-wallet-address-holder')
    voterWalletAddressHolder.innerHTML = `
      <p for="userWalletAdress">${data}</p>
                <input
                  type="checkbox"
                  name="addToNetwork"
                  id="userWalletAdressAccept"
                  checked="false"
                  value=${data}
                />
    `
    return voterWalletAddressHolder
  } catch (e) {
    console.log(e.message)
  }
}
const voterDataFetcher = async ({ url, method, body }) => {
  try {
    await dataCleanUp(voterAddressWalletForm)
    const authData = JSON.parse(localStorage.getItem('authData'))
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${authData.token}`)
    headers.append('Content-Type', 'application/json')
    const authResp = await fetchData({
      url: 'http://localhost:8000/auth/token',
      options: {
        method: 'GET',
        headers: headers,
        redirect: 'follow',
      },
    })
    if (!authResp.validity) throw new Error(authResp.message)
    const { result } = await fetchData({
      url: url,
      options: {
        method: method,
        body,
        headers,
      },
    })
    result.forEach(async (node) => {
      if (!node.addedToNetwork) {
        voterAddressWalletForm.appendChild(
          await voterDataRender(node.walletAddress)
        )
      }
    })
  } catch (e) {
    console.log(e.message)
  }
}

addCandidateFormBtn.addEventListener('click', async (e) => {
  try {
    e.preventDefault()
    await dataValidation('addCandidateForm')
    const capturedData = await captureData('addCandidateForm')
    const formData = await processFormData(capturedData)
    const jsonFormat = JSON.parse(formData)
    const a = await App.addCandidate(jsonFormat)
    await renderContestants()
  } catch (e) {
    console.log(e.message)
  }
})

addVoterBtn.addEventListener('click', async (e) => {
  try {
    let formData = []
    e.preventDefault()
    const authData = JSON.parse(localStorage.getItem('authData'))
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${authData.token}`)
    headers.append('Content-Type', 'application/json')
    // await dataValidation('voterWalletAddressForm')
    ;[...voterWalletAddressForm.children].forEach((node) => {
      ;[...node.children].forEach((node) => {
        if (node.tagName === 'INPUT' && node.checked === true) {
          formData.push(node.value)
        }
      })
    })
    const authResp = await fetchData({
      url: 'http://localhost:8000/auth/token',
      options: {
        method: 'GET',
        headers: headers,
        redirect: 'follow',
      },
    })
    if (!authResp.validity) throw new Error(authResp.message)
    formData.forEach(async (node) => {
      await App.registerVoter(node)
    })
    const aadharResp = await fetchData({
      url: 'http://localhost:8001/aadhar/update',
      options: {
        method: 'PUT',
        headers,
        body: JSON.stringify({ walletAddress: formData }),
        redirect: 'follow',
      },
    })
    await voterDataFetcher({
      url: 'http://localhost:8001/aadhar/?addedToNetwork=false',
      method: 'GET',
    })
  } catch (e) {
    console.log(e.message)
  }
})

const renderContestants = async () => {
  try {
    let element = await App.renderContestant()
    const a = [...addCandidateBody.children]
    a.forEach((node) => {
      if (node.classList.contains('added-candidates-holder')) {
        addCandidateBody.removeChild(node)
      }
    })
    addCandidateBody.appendChild(element)
  } catch (e) {
    console.log(e.message)
  }
}

updateElectionStateBtn.addEventListener('click', async (e) => {
  try {
    let state = await App.getState()
    console.log(state)
    state++
    const result = await App.changeState(state)
    await App.renderPhase()
    console.log(result)
  } catch (e) {
    console.log(e.message)
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

overviewSectionBtn.addEventListener('click', (e) => {
  overviewBody.attributes.getNamedItem('flag').value = 'true'
  addCandidateBody.attributes.getNamedItem('flag').value = 'false'
  addVoterBody.attributes.getNamedItem('flag').value = 'false'
  changeElectionStateBody.attributes.getNamedItem('flag').value = 'false'
  electionResultsBody.attributes.getNamedItem('flag').value = 'false'
  reloader()
})
addCandidateSectionBtn.addEventListener('click', async (e) => {
  overviewBody.attributes.getNamedItem('flag').value = 'false'
  addCandidateBody.attributes.getNamedItem('flag').value = 'true'
  addVoterBody.attributes.getNamedItem('flag').value = 'false'
  changeElectionStateBody.attributes.getNamedItem('flag').value = 'false'
  electionResultsBody.attributes.getNamedItem('flag').value = 'false'
  await renderContestants()
  reloader()
})
electionResultsSectionBtn.addEventListener('click', async (e) => {
  electionResultsBody.innerHTML = ''
  overviewBody.attributes.getNamedItem('flag').value = 'false'
  addVoterBody.attributes.getNamedItem('flag').value = 'false'
  addCandidateBody.attributes.getNamedItem('flag').value = 'false'
  changeElectionStateBody.attributes.getNamedItem('flag').value = 'false'
  electionResultsBody.attributes.getNamedItem('flag').value = 'true'
  let currentPhase = phase[await App.getState()]
  if ('Complete' === 'Complete') {
    await renderResultData()
  } else {
    await renderDummyData(currentPhase)
  }
  reloader()
})

addVoterSectionBtn.addEventListener('click', async (e) => {
  overviewBody.attributes.getNamedItem('flag').value = 'false'
  addCandidateBody.attributes.getNamedItem('flag').value = 'false'
  addVoterBody.attributes.getNamedItem('flag').value = 'true'
  changeElectionStateBody.attributes.getNamedItem('flag').value = 'false'
  electionResultsBody.attributes.getNamedItem('flag').value = 'false'
  await voterDataFetcher({
    url: 'http://localhost:8001/aadhar/?addedToNetwork=false',
    method: 'GET',
  })
  reloader()
})

changeElectionStateSectionBtn.addEventListener('click', async (e) => {
  overviewBody.attributes.getNamedItem('flag').value = 'false'
  addVoterBody.attributes.getNamedItem('flag').value = 'false'
  addCandidateBody.attributes.getNamedItem('flag').value = 'false'
  changeElectionStateBody.attributes.getNamedItem('flag').value = 'true'
  electionResultsBody.attributes.getNamedItem('flag').value = 'false'
  await App.renderPhase()
  reloader()
})

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Locked and loaded')
  reloader()
})
