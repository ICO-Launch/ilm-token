pragma solidity ^0.4.23;

import "@thetta/core/contracts/DaoBase.sol";
import "@thetta/core/contracts/DaoClient.sol";

import "./Proxy.sol";

contract ProxyOwnedByDAO is DaoClient {
  Proxy public proxy;

  bytes32 public constant TRANSFER_DELEGATION = keccak256("Proxy_TransferDelegation");
  bytes32 public constant TRANSFER_OWNERSHIP = keccak256("Proxy_TransferOwnership");

  constructor(DaoBase _daoBase, Proxy _proxy) DaoClient(_daoBase) {
    // Please don't forget to call _proxy.transferOwnership() to this contract immediately 
    // after ProxyOwnedByDAO_1 is instantiated
    proxy = _proxy; 
  }

// These methods now requires special custom permissions:
  function DAO_transferDelegation(address _newDelegation) public isCanDo(TRANSFER_DELEGATION) {
    proxy.transferDelegation(_newDelegation); 
  }

  function DAO_transferOwnership(address _newOwner) public isCanDo(TRANSFER_OWNERSHIP) {
    proxy.transferOwnership(_newOwner);
  }
}

