pragma solidity 0.5.15;

import 'ROOT/libraries/CloneFactory2.sol';
import 'ROOT/para/interfaces/IParaShareToken.sol';
import 'ROOT/para/AMMExchange.sol';
import 'ROOT/reporting/IMarket.sol';

contract AMMFactory {
    // market -> para -> amm
    AMMExchange internal proxyToClone;

    constructor(address _proxyToClone) public {
        proxyToClone = AMMExchange(_proxyToClone);
    }

    function addAMM(IMarket _market, IParaShareToken _para, uint256 _fee) external returns (AMMExchange) {
        address _amm = AMMExchange(createClone2(address(proxyToClone), salt(_market, _para)));
        _amm.initialize(_market, _para, _fee);
        return _amm;
    }

    function getAMM(IMarket _market, IParaShareToken _para) external view returns (AMMExchange) {
        return AMMExchange(uint160(uint256(keccak256(abi.encodePacked(
                bytes1(0xff), // standard for CREATE2
                address(this), // creator address is this factory contract
                salt(_market, _para), // proxies for a specific nexus only vary by their tokenId so just that works as the salt
                keccak256(abi.encodePacked(type(AMMExchange).creationCode)) // bytecode of proxy
            )))));
    }

    function salt(address _market, address _para) pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(_market, _para)));
    }
}
