import React, { Component } from 'react';
import { withRouter } from 'react-router';
import queryString from 'query-string';

import configureDecoratedComponent from 'client/helpers/configureDecoratedComponent';

export default function withLocationQueryDecorator(ComponentToDecorate) {
  @withRouter
  class WithLocationQuery extends Component {
    render() {
      const { location } = this.props;
      const locationQuery = queryString.parse(location.search);

      return (
        <ComponentToDecorate
          {...this.props}
          locationQuery={locationQuery || null}
        />
      );
    }
  }

  configureDecoratedComponent({
    DecoratedComponent: WithLocationQuery,
    OriginalComponent: ComponentToDecorate,
  });

  return WithLocationQuery;
}
