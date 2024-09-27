const goOnline = () => {
  // disable offline mode, otherwise we will break our tests :)
  cy.log('**go online**')
    .then(() => {
      // https://chromedevtools.github.io/devtools-protocol/1-3/Network/#method-emulateNetworkConditions
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Network.emulateNetworkConditions',
        params: {
          offline: false,
          latency: -1,
          downloadThroughput: -1,
          uploadThroughput: -1,
        },
      });
    })
    .then(() => {
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Network.disable',
      });
    });
};

const goOffline = () => {
  cy.log('**go offline**')
    .then(() => {
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Network.enable',
      });
    })
    .then(() => {
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Network.emulateNetworkConditions',
        params: {
          offline: true,
          latency: -1,
          downloadThroughput: -1,
          uploadThroughput: -1,
        },
      });
    });
};

const assertOnline = () => {
  return cy.wrap(window).its('navigator.onLine').should('be.true');
};

const assertOffline = () => {
  return cy.wrap(window).its('navigator.onLine').should('be.false');
};

const waitForServiceWorker = () => {
  return cy.window().then((win) => {
    return new Promise((resolve) => {
      if (win.navigator.serviceWorker) {
        if (win.navigator.serviceWorker.controller) {
          resolve();
          cy.log('Service worker activated');
        } else {
          win.navigator.serviceWorker.oncontrollerchange = () => {
            resolve();
            cy.log('Service worker activated');
          };
        }
      } else {
        cy.log('Service workers not supported');
        resolve(); // Service workers not supported
      }
    });
  });
};

const markerCoordinates = {
  x: 412,
  y: 349,
};

const updatedComment = 'This is an updated comment';

context('Offline mode functionality', { browser: '!firefox' }, () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('div#map').find('canvas').should('exist');
    goOnline();
  });

  afterEach(() => {
    cy.log('End of test');
    goOnline();
  });

  it('should allow the user to update details in the popup and save changes when offline', () => {
    waitForServiceWorker().then(() => {
      assertOnline();
      goOffline();
      assertOffline();


      cy.get('div#map').find('canvas').should('exist');

      // Check if the appropriate message is displayed
      cy.contains('You are currently offline.').should('be.visible');

      cy.get('canvas').click(markerCoordinates.x, markerCoordinates.y);
      cy.get('#popup').should('be.visible');
      cy.get('input[data-cy="comment-input"]').clear().type(updatedComment);
      cy.get('[data-cy="status-checkbox"]').click();
      cy.screenshot('update details offline');
      
      cy.get('button[data-cy="save-button"]').click();
      
      cy.get('canvas').click(markerCoordinates.x, markerCoordinates.y);
      cy.get('input[data-cy="comment-input"]').should(
        'have.value',
        updatedComment
      );
      cy.get('[data-cy="status-checkbox"]').should('not.be.checked');


      cy.get('[data-cy="popup-close"]').click();
    });
  });
});
