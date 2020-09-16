#!/usr/bin/env python

from eth_tester.exceptions import TransactionFailed
from pytest import raises, fixture as pytest_fixture
from utils import nullAddress, PrintGasUsed


ATTO = 10 ** 18
INVALID = 0
NO = 1
YES = 2

def test_amm(contractsFixture, market, cash):
    if not contractsFixture.paraAugur:
        return

    shareToken = contractsFixture.getShareToken()

    fee = 3 # 3/1000

    # Create factory
    cloneableAMM = contractsFixture.upload('../src/contracts/para/AMMExchange.sol')
    factory = contractsFixture.upload('../src/contracts/para/AMMFactory.sol', constructorArgs=[cloneableAMM.address, fee])

    # Create AMM
    ammAddress = factory.addAMM(market.address, shareToken.address)
    amm = contractsFixture.applySignature("AMMExchange", ammAddress)

    # Add liquidity
    cash.faucet(100000 * ATTO)
    cash.approve(amm.address, 10 ** 48)

    assert cash.balanceOf(contractsFixture.accounts[0]) == 100000 * ATTO

    amm.addLiquidity(100 * ATTO)

    assert cash.balanceOf(contractsFixture.accounts[0]) == 0
    assert cash.balanceOf(amm.address) == 0
    # user did not get any shares themselves: they go to the AMM
    assert shareToken.balanceOfMarketOutcome(market.address, INVALID, contractsFixture.accounts[0]) == 0
    assert shareToken.balanceOfMarketOutcome(market.address, YES, contractsFixture.accounts[0]) == 0
    assert shareToken.balanceOfMarketOutcome(market.address, NO, contractsFixture.accounts[0]) == 0
    # AMM has 100 of each share
    assert shareToken.balanceOfMarketOutcome(market.address, INVALID, amm.address) == 100 * ATTO
    assert shareToken.balanceOfMarketOutcome(market.address, YES, amm.address) == 100 * ATTO
    assert shareToken.balanceOfMarketOutcome(market.address, NO, amm.address) == 100 * ATTO

    amm.removeLiquidity(10 * ATTO)

    assert cash.balanceOf(contractsFixture.accounts[0]) == 0  # user did not receive cash, just shares
    assert cash.balanceOf(amm.address) == 0  # shares are just passed along to user; no cash suddenly appears

    # user receives 10 of each share
    assert shareToken.balanceOfMarketOutcome(market.address, INVALID, contractsFixture.accounts[0]) == 10 * ATTO
    assert shareToken.balanceOfMarketOutcome(market.address, YES, contractsFixture.accounts[0]) == 10 * ATTO
    assert shareToken.balanceOfMarketOutcome(market.address, NO, contractsFixture.accounts[0]) == 10 * ATTO
    # AMM still has 90 of each share
    assert shareToken.balanceOfMarketOutcome(market.address, INVALID, amm.address) == 90 * ATTO
    assert shareToken.balanceOfMarketOutcome(market.address, YES, amm.address) == 90 * ATTO
    assert shareToken.balanceOfMarketOutcome(market.address, NO, amm.address) == 90 * ATTO

    # Enter position

#     amm.enterPosition(1e18, True, 1000e18)

    # Exit position


# TODO tests
# 1. Two users add and remove liquidity, without trading occuring.
# 2. Two users add liquidity, then other users trade, then the users remove liquidity.
#    The worry is that our reward function doesn't work quite right so users won't get back what they put in.
# 3. User adds liqudity. Then there's trading. Then another user adds liquidity. They should get the right number of LP tokens.
#    And when the users remove liquidity, they get the number of shares and cash that makes sense.
# 4. Users swap and enter and exit positions.
# 5. The sqrt functions for safemath int and uint work as expected. Alex wrote them but there just aren't any tests yet.
