import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { AppStatusProvider } from 'modules/app/store/app-status';
import MainErrorBoundary from 'modules/app/components/main-error-boundary';
import { parseLocation } from 'modules/routes/helpers/parse-query';
import { WindowApp } from 'modules/types';
import { PendingOrdersProvider } from 'modules/app/store/pending-orders';
import { setHTMLTheme } from 'modules/app/store/app-status-hooks';
console.log(`
  *******************************************
              DEBUGGING INFO
  *******************************************
  BUILD INFORMATION

    branch            -- ${process.env.CURRENT_BRANCH}
    commit            -- ${process.env.CURRENT_COMMITHASH}
                      -- https://github.com/AugurProject/augur/commit/${process.env.CURRENT_COMMITHASH}
    network           -- ${process.env.ETHEREUM_NETWORK}
  -------------------------------------------
  ATTACHED PROPERTIES

    app element       -- window.app
    state data        -- window.state
  -------------------------------------------
  Configuration

  ${JSON.stringify(process.env.CONFIGURATION, null, 2)}
  *******************************************
`);
window.stores = {};
function render(Root) {
  ReactDOM.render(
    <AppStatusProvider>
      <PendingOrdersProvider>
        <HashRouter hashType="hashbang">
          <MainErrorBoundary>
            <Root />
          </MainErrorBoundary>
        </HashRouter>
      </PendingOrdersProvider>
    </AppStatusProvider>,
    document.getElementById('app')
  );
}

handleRender();

function handleRender() {
  const locationParsed = parseLocation(window?.location?.href || '');
  if (locationParsed.t) {
    setHTMLTheme(locationParsed.t.toUpperCase());
  }
  const UpdatedRoot = require('modules/app/components/app').default;

  // NOTE --  These are attached for convenience when built for development or debug
  if (process.env.NODE_ENV === 'development') {
    (window as WindowApp).app = UpdatedRoot;
  }

  render(UpdatedRoot);
}
