const Proxy = artifacts.require('./Proxy.sol');
const ProxyOwnedByDAO = artifacts.require('./ProxyOwnedByDAO.sol');
const Controller = artifacts.require('./Controller.sol');

const { assertRevert } = require('./helpers/assertThrow')

// Thetta
var DaoBase = artifacts.require('./DaoBase');
var StdDaoToken = artifacts.require('./StdDaoToken');
var DaoStorage = artifacts.require('./DaoStorage');

contract('ProxyOwnedByDAO', (accounts) => {
  let proxy;
  let proxyDao;
  let token;
  let controller;

  beforeEach(async () => {
    proxy = await Proxy.new();

    controller = await Controller.new();
    token = Controller.at(proxy.address);
  });

  describe('proxy + proxyDAO with no permissions', async() => {
    beforeEach(async () => {
      // Create new proxyDao
      let t = await StdDaoToken.new("StdToken","STDT",18, true, true, 1000000000);
      let store = await DaoStorage.new([t.address]);
      let daoBase = await DaoBase.new(store.address);
      proxyDao = await ProxyOwnedByDAO.new(daoBase.address, proxy.address);
      await t.transferOwnership(daoBase.address);
      await store.transferOwnership(daoBase.address);

      // finish initialization of DAOBase
      await daoBase.renounceOwnership();

      // initialize token contract
      await token.initialize(controller.address, 400000000);

      // transfer ownership to proxyDao
      await proxy.transferOwnership(proxyDao.address);
      assert.equal(await proxy.owner(), proxyDao.address);
    });

    it('should not allow to transfer ownership directly', async() => {
      return assertRevert(async () => {
        await proxy.transferOwnership(accounts[1]);
      });
      assert.notEqual(await proxy.owner(), accounts[1]);
    });

    it('should not allow to transfer ownership through the proxyDAO', async() => {
      return assertRevert(async () => {
        await proxyDao.DAO_transferOwnership(accounts[1]);
      });
      assert.notEqual(await proxy.owner(), accounts[1]);
    });
  });

  describe('proxy + proxyDAO with permissions', async() => {
    beforeEach(async () => {
      // Create new proxyDao
      let t = await StdDaoToken.new("StdToken","STDT",18, true, true, 1000000000);
      let store = await DaoStorage.new([t.address]);
      let daoBase = await DaoBase.new(store.address);
      proxyDao = await ProxyOwnedByDAO.new(daoBase.address, proxy.address);
      await t.transferOwnership(daoBase.address);
      await store.transferOwnership(daoBase.address);

      // set permissions
      await daoBase.addGroupMember("Employees", accounts[0]);

      const transferDelegationPerm = await proxyDao.TRANSFER_DELEGATION();
      const transferOwnershipPerm = await proxyDao.TRANSFER_OWNERSHIP();
      // NOTE: we can use votings here instead!
      await daoBase.allowActionByAnyMemberOfGroup(transferDelegationPerm, "Employees");
      await daoBase.allowActionByAnyMemberOfGroup(transferOwnershipPerm, "Employees");

      // finish initialization of DAOBase
      await daoBase.renounceOwnership();

      // initialize token contract
      await token.initialize(controller.address, 400000000);

      // transfer ownership to proxyDao
      await proxy.transferOwnership(proxyDao.address);
      assert.equal(await proxy.owner(), proxyDao.address);
    });

    it('should not allow to transfer ownership directly', async() => {
      return assertRevert(async () => {
        await proxy.transferOwnership(accounts[1]);
      });
      assert.notEqual(await proxy.owner(), accounts[1]);
    });

    it('should allow to transfer ownership through the proxyDAO!', async() => {
      await proxyDao.DAO_transferOwnership(accounts[1]);
      assert.equal(await proxy.owner(), accounts[1]);
    });
  });

});
