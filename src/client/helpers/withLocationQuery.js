import React, { Component } from 'react';
import { withRouter } from 'react-router';

import parseQueryString from '#common/util/parseQueryString.js';
import configureDecoratedComponent from '#client/helpers/configureDecoratedComponent.js';

export default function withLocationQueryDecorator(ComponentToDecorate) {
  @withRouter
  class WithLocationQuery extends Component {
    render() {
      const { location } = this.props;
      const locationQuery = parseQueryString(location.search);

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
