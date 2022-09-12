var Vote = artifacts.require('./vote.sol')
module.exports = function (deployer) {
  deployer.deploy(Vote)
}
