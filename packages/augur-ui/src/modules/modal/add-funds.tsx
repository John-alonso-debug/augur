import React, { useState } from 'react';
import {
  ExternalLinkButton,
  PrimaryButton,
  CloseButton,
  BackButton,
} from 'modules/common/buttons';
import {
  AccountAddressDisplay,
  FundsHelp,
} from 'modules/modal/common';
import { RadioTwoLineBarGroup, TextInput } from 'modules/common/form';
import classNames from 'classnames';
import ReactTooltip from 'react-tooltip';
import { toChecksumAddress } from 'ethereumjs-util';
import {
  ACCOUNT_TYPES,
  DAI,
  REP,
  ADD_FUNDS_SWAP,
  ADD_FUNDS_COINBASE,
  ADD_FUNDS_CREDIT_CARD,
  ADD_FUNDS_TRANSFER,
} from 'modules/common/constants';
import { LoginAccount } from 'modules/types';
import TooltipStyles from 'modules/common/tooltip.styles.less';
import Styles from 'modules/modal/modal.styles.less';
import { helpIcon } from 'modules/common/icons';
import noop from 'utils/noop';
import { Swap } from 'modules/swap/components';

interface AddFundsProps {
  closeAction: Function;
  autoSelect?: boolean;
  fundType: string;
  loginAccount: LoginAccount;
  ETH_RATE: number;
  REP_RATE: number;
}

export const generateDaiTooltip = (
  tipText = 'Augur requires deposits in DAI ($), a currency pegged 1 to 1 to the US Dollar.'
) => {
  return (
    <span className={Styles.AddFundsToolTip}>
      <label
        className={classNames(TooltipStyles.TooltipHint)}
        data-tip
        data-for='tooltip--confirm'
      >
        {helpIcon}
      </label>
      <ReactTooltip
        id='tooltip--confirm'
        className={TooltipStyles.Tooltip}
        effect='solid'
        place='top'
        type='light'
      >
        <p>{tipText}</p>
      </ReactTooltip>
    </span>
  );
};

export const AddFunds = ({
  closeAction,
  autoSelect = false,
  fundType = DAI,
  loginAccount,
  ETH_RATE,
  REP_RATE,
}: AddFundsProps) => {
  const address = loginAccount.address
  const accountMeta = loginAccount.meta;
  let autoSelection = ADD_FUNDS_COINBASE;

  if (autoSelect) {
    if (
      [ACCOUNT_TYPES.TORUS, ACCOUNT_TYPES.PORTIS].includes(
        accountMeta.accountType
      ) &&
      fundType !== REP
    ) {
      autoSelection = ADD_FUNDS_CREDIT_CARD;
    } else if (
      fundType === REP
    ) {
      autoSelection = ADD_FUNDS_SWAP;
    }
  }

  const [selectedOption, setSelectedOption] = useState(autoSelect ? autoSelection : null);
  const fundTypeLabel = fundType === DAI ? 'Dai ($)' : 'REP';

  const FUND_OTPIONS = [
    {
      header: 'Swap',
      description: `Swap funds in your account for ${fundTypeLabel}`,
      value: ADD_FUNDS_SWAP,
    },
    {
      header: 'Credit/debit card',
      description: 'Add Funds instantly using a credit/debit card',
      value: ADD_FUNDS_CREDIT_CARD,
    },
    {
      header: 'Coinbase',
      description: 'Send funds from a Coinbase account',
      value: ADD_FUNDS_COINBASE,
    },
    {
      header: 'Transfer',
      description: 'Send funds to your Augur account address',
      value: ADD_FUNDS_TRANSFER,
    },
  ];

  const addFundsOptions = [FUND_OTPIONS[2], FUND_OTPIONS[3]];

  if (
    fundType !== REP &&
    (accountMeta.accountType === ACCOUNT_TYPES.TORUS ||
      accountMeta.accountType === ACCOUNT_TYPES.PORTIS)
  ) {
    addFundsOptions.unshift(FUND_OTPIONS[1]);
  }

  if (
    fundType === REP
  ) {
    addFundsOptions.unshift(FUND_OTPIONS[0]);
  }

  return (
    <div
      onClick={event => event.stopPropagation()}
      className={classNames(Styles.AddFunds, {
        [Styles.ShowSelected]: selectedOption,
        [Styles.hideOnMobile]: autoSelect,
        [Styles.hideOnDesktop]: !autoSelect,
      })}
    >
      <div>
        <div>
          <CloseButton action={() => closeAction()} />
        </div>
        <div>
          <h1>{fundType === REP ? 'Get REP' : 'Add Funds'}</h1>
          <h2>Choose a method</h2>
          <RadioTwoLineBarGroup
            radioButtons={addFundsOptions}
            defaultSelected={selectedOption}
            hideRadioButton
            onChange={value => {
              setSelectedOption(() => value && value.toString());
            }}
          />
          <FundsHelp fundType={fundType} />
        </div>
      </div>
      <div>
        <div>
          <BackButton action={() => setSelectedOption(() => null)} />
          <CloseButton action={() => closeAction()} />
        </div>
        <div
          className={
            selectedOption === ADD_FUNDS_TRANSFER
              ? Styles.AddFundsTransfer
              : Styles.AddFundsCreditDebitCoinbase
          }
        >
          {selectedOption === ADD_FUNDS_SWAP && (
            <>
              <h1>Swap</h1>
              <h2>Swap a currency for {fundTypeLabel}</h2>

              <Swap
                balances={loginAccount.balances}
                toToken={REP}
                fromToken={DAI}
                ETH_RATE={ETH_RATE}
                REP_RATE={REP_RATE}
              />
            </>
          )}

          {selectedOption === ADD_FUNDS_CREDIT_CARD && (
            <>
              <h1>Credit/debit card</h1>
              {accountMeta.accountType === ACCOUNT_TYPES.PORTIS && (
                <h2>
                  Add up to $250 worth of {fundTypeLabel} {generateDaiTooltip()} instantly
                </h2>
              )}
              {accountMeta.accountType === ACCOUNT_TYPES.TORUS && (
                <h2>Add {fundTypeLabel} {generateDaiTooltip()} instantly</h2>
              )}

              <h3>Amount</h3>
              <TextInput
                placeholder='0'
                onChange={noop}
                innerLabel={'USD'}
              />

              {accountMeta.accountType === ACCOUNT_TYPES.PORTIS && (
                <a href='https://wallet.portis.io/buy/' target='_blank'>
                  <PrimaryButton
                    action={() => null}
                    text={`Buy with ${accountMeta.accountType}`}
                  />
                </a>
              )}
              {accountMeta.accountType === ACCOUNT_TYPES.TORUS && (
                <PrimaryButton
                  action={() => accountMeta.openWallet('topup')}
                  text={`Buy with ${accountMeta.accountType}`}
                />
              )}
              <h4>
                Buy Dai ($) with our secure payments partner, {accountMeta.accountType}. Funds will appear in your Augur account when payment finalizes.
              </h4>
            </>
          )}
          {selectedOption === ADD_FUNDS_COINBASE && (
            <>
              <h1>Coinbase</h1>
              <h2>
                Add up to $25,000 worth of {fundType === DAI ? <>{fundTypeLabel} {generateDaiTooltip()}</> : fundType} using
                a Coinbase account
              </h2>
              <ol>
                <li>
                  Login to your account at{' '}
                  <a href='https://www.coinbase.com' target='blank'>
                    www.coinbase.com
                  </a>
                </li>
                <li>Buy the cryptocurrency {fundTypeLabel}</li>
                <li>Send the {fundTypeLabel} to your augur account address</li>
              </ol>
              <h3>Augur account address</h3>
              <AccountAddressDisplay copyable address={toChecksumAddress(address)} />
              <ExternalLinkButton URL='https://docs.augur.net/' label={'Learn about your address'} />
            </>
          )}
          {selectedOption === ADD_FUNDS_TRANSFER && (
            <>
              <h1>Transfer</h1>
              <h2>
                Send funds to your Augur account address
              </h2>
              <ol>
                <li>
                  Buy{' '}
                  {fundType === DAI ? (
                    <>
                      {fundTypeLabel} {generateDaiTooltip()}
                    </>
                  ) : (
                    fundTypeLabel
                  )}{' '}
                   using an app or exchange (see our list of <a target='blank' href='https://docs.augur.net/'>popular ways to buy {fundTypeLabel})</a>
                </li>
                <li>Transfer the {fundTypeLabel} to your Augur account address</li>
              </ol>
              <h3>Augur account address</h3>
              <AccountAddressDisplay copyable address={toChecksumAddress(address)} />
              <ExternalLinkButton URL='https://docs.augur.net/' label={'Learn about your address'} />
            </>
          )}
        </div>
        <FundsHelp fundType={fundType} />
        <div>
          <button onClick={() => closeAction()}>Done</button>
        </div>
      </div>
    </div>
  );
};
