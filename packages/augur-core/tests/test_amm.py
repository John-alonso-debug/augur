#!/usr/bin/env python

from eth_tester.exceptions import TransactionFailed
from pytest import raises, fixture as pytest_fixture
from utils import nullAddress, PrintGasUsed


def test_amm(contractsFixture, market, cash):
    if not contractsFixture.paraAugur:
        return

    shareToken = contractsFixture.getShareToken()

    # Create factory
    cloneableAMM = contractsFixture.upload('../src/contracts/para/AMMExchange.sol')
    factory = contractsFixture.upload('../src/contracts/para/AMMFactory.sol', constructorArgs=[cloneableAMM.address])

    # Create AMM
    fee = 3 # 3/1000
    ammAddress = factory.addAMM(market.address, shareToken.address, fee)
    amm = contractsFixture.applySignature("AMMExchange", ammAddress)

    print("MARINA", market.getNumTicks())

    # Add liquidity
    cash.faucet(100000e18)
    cash.approve(amm.address, 1e48)
    amm.addLiquidity(100e18) # this dies at 100e18 but succeeds at 99e18
#     amm.removeLiquidity(50e18)

    # Enter position

#     amm.enterPosition(1e18, True, 1000e18)

    # Exit position
