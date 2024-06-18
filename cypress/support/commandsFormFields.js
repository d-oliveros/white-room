Cypress.Commands.add('getFormField', (formFieldId, formFieldType) => {
  switch (formFieldType) {
    case 'select': {
      return cy.get(`#field-${formFieldId} > .value > select`);
    }
    case 'autocomplete': {
      return cy.get(`#field-${formFieldId} > .value > .react-autosuggest__container > input`)
        .then(($input) => {
          return cy.wrap($input);
        });
    }
    default: {
      return cy.get(`#field-${formFieldId} > .value > input`);
    }
  }
});

Cypress.Commands.add('setMultipleChoiceFormField', (formFieldId, value) => {
  return cy.get(`#field-${formFieldId} > .value > .bulletGrid .choice`)
    .contains(value)
    .click();
});

Cypress.Commands.add('setYesNoFormField', (formFieldId, value) => {
  return cy.get(`#field-${formFieldId} > .value > .bulletGrid .choice`)
    .contains(value)
    .click();
});

Cypress.Commands.add('clickSimpleCheckboxFormField', (formFieldId) => {
  return cy.get(`#field-${formFieldId}`)
    .click();
});
