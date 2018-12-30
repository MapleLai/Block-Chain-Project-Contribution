// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import contributionArtifact from '../../build/contracts/Contribution.json'

// Contribution is our usable abstraction, which we'll use through the code below.
const Contribution = contract(contributionArtifact)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account

const App = {
  //App初始化
  start: function () {
    const self = this

    // Bootstrap the Contribution abstraction for Use.
    Contribution.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0]

      self.refreshMsg()
    })
  },

  //更新募捐信息
  refreshMsg: function () {
    const self = this

    let meta
    Contribution.deployed().then(function (instance) {
      meta = instance
      return meta.getTarget.call({ from: account })
    }).then(function (value) {
      const target = document.getElementById('target')
      target.innerHTML = "目标金额：" + value.toString()
      return meta.getFunds.call({ from: account })
    }).then(function (value) {
      const funds = document.getElementById('funds')
      funds.innerHTML = "已筹集数：" + value.toString()
      return meta.getParticipants.call({ from: account })
    }).then(function (value) {
      const participants = document.getElementById('participants')
      participants.innerHTML = "参与人次：" + value.toString()
      return meta.maxContribution.call({ from: account })
    }).then(function (value) {
      const max = document.getElementById('max')
      max.innerHTML = "最大捐款：" + value.toString()
    }).catch(function (e) {
      console.log(e)
      console.log('Error getting Message; see log.')
    })
  },

  //判断用户希望捐款还是设置目标金额，并调用相应的智能合约函数
  send: function () {
    const self = this

    const useraddress = document.getElementById('_useraddress').value
    const money = parseInt(document.getElementById('money').value)
    const _money = document.getElementById('money')
    const msg = document.getElementById('msg')
    const op1 = document.getElementById('op1')


    let meta
    Contribution.deployed().then(function (instance) {
      meta = instance
      if (op1.checked){
        return meta.contribute(money, { from: useraddress, gas: 4700000 })
      } else {
        return meta.setTarget(money, { from: useraddress })
      }
    }).then(function () {
      if (op1.checked){
        return meta.getPay.call({ from: account })
      } else {
        if (useraddress.toUpperCase() != account.toUpperCase()) {
          msg.innerHTML = "你没有权限进行此项操作"
        } else {
          msg.innerHTML = "你已成功设置目标金额为" + money.toString()
        }
      }
    }).then(function (value) {
      if (op1.checked){
        msg.innerHTML = "你已成功捐出" + value.toString()
      }
      msg.style.visibility = "visible"
    }).catch(function (e) {
      console.log(e)
      console.log('Error sending; see log.')
    })

    self.refreshMsg()
  },

  //选择捐款操作时更新UI信息
  change1: function (){
    const self = this

    const money = document.getElementById('money');
    const submit = document.getElementById('submit');
    const msg = document.getElementById('msg');
    money.value = ""
    money.placeholder = "请输入捐款金额"
    submit.innerHTML = "捐款";
    msg.style.visibility = "hidden";
  },

  //选择设置目标金额操作时更新UI信息
  change2: function (){
    const self = this

    const money = document.getElementById('money');
    const submit = document.getElementById('submit');
    const msg = document.getElementById('msg');
    money.value = ""
    money.placeholder = "请设置目标金额"
    submit.innerHTML = "设置";
    msg.style.visibility = "hidden";
  },

  //add()、back()、clr()是输入金额时屏幕显示数字的相关函数
  add: function (ch) {
    const self = this

    document.getElementById('money').value += ch;
    const msg = document.getElementById('msg');
    msg.style.visibility = "hidden";
  },

  back: function (){
    const self = this

    document.getElementById('money').value 
      = document.getElementById('money').value.substring(0, document.getElementById('money').value.length-1);
  },

  clr: function (){
    const self = this

    document.getElementById('money').value = "";
  }

}

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:7545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'))
  }

  App.start()
})