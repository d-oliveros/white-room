import React, { Component } from 'react';
import { StripeProvider, injectStripe, Elements } from 'react-stripe-elements';

import configureDecoratedComponent from 'client/helpers/configureDecoratedComponent';
import withJsScript from 'client/helpers/withJsScript';
import branch from 'client/core/branch';

export default function withStripeDecorator(ComponentToDecorate) {
  const ComponentToDecorateWithStripe = injectStripe(ComponentToDecorate);

  @withJsScript({
    preventRender: true,
    scriptUrl: (
      'https://js.stripe.com/v3/'
    ),
  })
  @branch({
    STRIPE_API_KEY: ['env', 'STRIPE_API_KEY'],
  })
  class withStripe extends Component {
    render() {
      const { STRIPE_API_KEY } = this.props;

      if (!STRIPE_API_KEY) {
        return (
          <div>
            Sorry, Stripe is not enabled in this environment.
          </div>
        );
      }

      return (
        <StripeProvider stripe={null} apiKey={STRIPE_API_KEY}>
          <Elements>
            <ComponentToDecorateWithStripe {...this.props} />
          </Elements>
        </StripeProvider>
      );
    }
  }

  configureDecoratedComponent({
    DecoratedComponent: withStripe,
    OriginalComponent: ComponentToDecorate,
  });

  return withStripe;
}
