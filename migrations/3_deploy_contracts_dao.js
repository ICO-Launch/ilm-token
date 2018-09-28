var migrateLibs = require('@thetta/core/scripts/migrateLibs');

module.exports = function (deployer, network, accounts) {
     let additionalContracts = [ "./ProxyOwnedByDAO"];

     return migrateLibs(artifacts, additionalContracts, deployer, network, accounts);
};
