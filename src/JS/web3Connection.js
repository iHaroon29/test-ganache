var phaseEnum = 0 // for changing phases of voting
App = {
  web3Provider: null,
  contracts: {},
  accounts: [],

  init: async function () {
    return await App.initWeb3()
  },

  initWeb3: async function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum
      try {
        const data = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        App.updateAccounts(data)
        ethereum.autoRefreshOnNetworkChange = false
        window.ethereum.on('accountsChanged', App.updateAccounts)
      } catch (error) {
        console.error('User denied account access')
      }
    } else if (window.web3) {
      App.web3Provider = window.web3.currentProvider
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(
        'HTTP://127.0.0.1:7545'
      )
    }
    web3 = new Web3(App.web3Provider)
    return App.initContract()
  },

  initContract: async function () {
    try {
      const jsonVote = await fetch('../../build/contracts/Vote.json')
      let a = await jsonVote.json()
      App.contracts.Vote = TruffleContract(a)
      await App.contracts.Vote.setProvider(web3.currentProvider)
    } catch (e) {
      console.log(e.message)
    }
  },
  renderPhase: async function () {
    try {
      const phase = ['Registration', 'Voting', 'Complete']
      document.querySelector(
        '.phase-data-holder'
      ).innerHTML = `            <h2>Current State of Election</h2>
            <p>${phase[await App.getState()]}</p>
                                    `
    } catch (e) {
      console.log(e.message)
    }
  },
  renderContestant: async function () {
    try {
      const addedCandidatesHolder = document.createElement('div')
      addedCandidatesHolder.classList.add('added-candidates-holder')
      const contract = await App.contracts.Vote.deployed()
      const contestantCount = await contract.contestantsCount.call()
      if (contestantCount === 0) {
        return
      }
      for (var i = 1; i <= contestantCount; i++) {
        let data = await contract.contestants(i)
        const test = document.createElement('div')
        test.classList.add('added-candidate')
        test.innerHTML = `
        <div class="img-holder">
                <img src="./Assets/dummy_600x600_ffffff_cccccc.png" alt="candidate-img" />
              </div>
              <div class="text-holder">
                <p>Name: ${data[1]}</p>
                <p>Age: ${data[4]}</p>
                <p>Party: ${data[5]}</p>
                <p>Qualification: ${data[3]}</p>
              </div>
        `
        addedCandidatesHolder.appendChild(test)
      }
      return addedCandidatesHolder
    } catch (e) {
      console.log(e.message)
    }
  },
  updateAccounts: async function (accounts) {
    const firstUpdate = !(App.accounts && App.accounts[0])
    App.accounts = accounts || (await App.web3.eth.getAccounts())
    return App.accounts
  },
  // ------------- voting code -------------
  castVote: async function (id) {
    try {
      const a = await App.contracts.Vote.deployed()
      console.log(id)
      const result = await a.vote(id, { from: App.accounts[0] })
      return result
    } catch (e) {
      console.log(e.message)
    }
  },
  getVoter: async function (value) {
    try {
      const contract = await App.contracts.Vote.deployed()
      const result = await contract.voters.call(value)
      return result
    } catch (e) {
      console.log(e.message)
    }
  },
  getState: async function () {
    try {
      const contract = await App.contracts.Vote.deployed()
      return await contract.state.call()
    } catch (e) {
      console.log(e.message)
    }
  },
  // ------------- adding candidate code -------------
  addCandidate: async function (data) {
    try {
      const { name, age, party, qualification } = data
      console.log(name, age, party, qualification)
      const contract = await App.contracts.Vote.deployed()
      const result = await contract.addContestant(
        name,
        party,
        +age,
        qualification,
        { from: App.accounts[0] }
      )
      return result
    } catch (e) {
      console.log(e.message)
    }
  },
  getAdmin: async function () {
    const a = await App.contracts.Vote.deployed()
    const b = await a.getAdmin()
    console.log(b)
  },
  // ------------- changing phase code -------------
  changeState: async function (state) {
    try {
      const contract = await App.contracts.Vote.deployed()
      const result = await contract.changeState(state, {
        from: App.accounts[0],
      })
      return result
    } catch (e) {
      console.log(e.message)
    }
  },

  getCandidates: async function (value) {
    try {
      const contract = await App.contracts.Vote.deployed()
      const result = await contract.getCandidates(value)
      return result
    } catch (e) {
      console.log(e.message)
    }
  },

  // ------------- registering voter code -------------
  registerVoter: async function (value) {
    try {
      console.log(value)
      const contract = await App.contracts.Vote.deployed()
      const result = await contract.voterRegisteration(value, {
        from: App.accounts[0],
      })
      console.log(result)
    } catch (e) {
      console.log(e.message)
    }
  },
}

document.addEventListener('DOMContentLoaded', async (e) => {
  await App.init()
})
