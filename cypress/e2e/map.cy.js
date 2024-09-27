const markerCoordinates = {
  x: 412,
  y: 349
};

const updatedComment = 'This is an updated comment';

context('Basic Map Functionality', () => {

  beforeEach(() => {
    cy.visit('/');
    cy.get('div#map').find('canvas').should('exist');
  });

  it('should load the map and canvas', () => {
    cy.get('div#map').find('canvas').should('exist');
  });

  it('should open and close the popup when the close button is clicked', () => {
    cy.get('canvas').click(markerCoordinates.x, markerCoordinates.y);
    cy.get('#popup').should('be.visible'); 
    cy.get('[data-cy="popup-close"]').click();
    cy.get('#popup').should('not.be.visible');
  });

  it('shloud close the popup if clicked outside of popup', () => {
    cy.get('canvas').click(markerCoordinates.x, markerCoordinates.y);
    cy.get('#popup').should('be.visible'); 
    cy.get('canvas').click(100, 100);
    cy.get('#popup').should('not.be.visible');
  });

  it('should allow the user to update details in the popup and save changes', () => {
    cy.get('canvas').click(markerCoordinates.x, markerCoordinates.y);
    cy.get('#popup').should('be.visible'); 
    cy.get('input[data-cy="comment-input"]').clear().type(updatedComment);
    cy.get('[data-cy="status-checkbox"]').click();
    cy.get('button[data-cy="save-button"]').click();

    cy.get('canvas').click(markerCoordinates.x, markerCoordinates.y);
    cy.get('#popup').should('be.visible'); 
    cy.get('input[data-cy="comment-input"]').should('have.value', updatedComment);
    cy.get('[data-cy="status-checkbox"]').should('not.be.checked');

    cy.screenshot('update details');

    cy.get('[data-cy="popup-close"]').click();
  });

});
