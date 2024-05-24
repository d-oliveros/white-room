import { API_ACTION_EXPERIMENT_ACTIVE_VARIANTS_UPDATE } from 'api/actionTypes';
import experimentsConfig from '../../config/experiments';

function isApiResponse(res) {
  return !!(res && res.body && 'success' in res.body && 'result' in res.body);
}

Cypress.Commands.add('apiRequest', ({ action, payload }) => {
  return cy.request({
    method: 'POST',
    url: `api/v1/${action}`,
    body: payload,
  }).then((res) => {
    if (isApiResponse(res) && !res.body.success) {
      console.log(res.body); // eslint-disable-line no-console
      const error = new Error(
        `[${action}] Unsuccessful API response: ` +
        (res.body.result.message
          ? res.body.result.message
          : JSON.stringify(res.body))
      );
      error.name = 'CypressUnsuccessfulApiResponse';
      error.details = {
        action: action,
        payload: payload,
        responseBody: res.body,
      };
      throw error;
    }
    return res;
  });
});

Cypress.Commands.add('setExperimentVariants', (experimentActiveVariants) => {
  Cypress.log({
    name: 'setting experimentActiveVariants',
    message: experimentActiveVariants,
  });

  const currentExperimentActiveVariants = Object.keys(experimentsConfig).reduce((memo, experimentName) => {
    return {
      ...memo,
      [experimentName]: experimentsConfig[experimentName][0],
    };
  }, {});

  const newExperimentActiveVariants = {
    ...currentExperimentActiveVariants,
    ...experimentActiveVariants,
  };

  return cy.apiRequest({
    action: API_ACTION_EXPERIMENT_ACTIVE_VARIANTS_UPDATE,
    payload: {
      experimentActiveVariants: newExperimentActiveVariants,
    },
  });
});

Cypress.Commands.add('assertRoute', (route) => {
  return cy.url().should('equal', `${window.location.origin}${route}`);
});

Cypress.Commands.add('iframe', (iframeSelector, elSelector) => {
  return cy
    .get(`iframe${iframeSelector || ''}`, { timeout: 10000 })
    .should(($iframe) => {
      expect($iframe.contents().find(elSelector || 'body')).to.exist;
    })
    .then(($iframe) => {
      return cy.wrap($iframe.contents().find('body'));
    });
});

Cypress.Commands.add('execSafe', (command) => {
  return cy.exec(command, {
    failOnNonZeroExit: false,
  });
});
