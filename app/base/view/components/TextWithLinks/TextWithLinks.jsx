import React, { Component } from 'react';
import PropTypes from 'prop-types';

import lodashUniq from 'lodash/uniq.js';
import lodashOrderBy from 'lodash/orderBy.js';

import escapeHtml from '#white-room/util/escapeHtml.js';
import matchUrls from '#white-room/util/matchUrls.js';
import withHttpProtocol from '#white-room/util/withHttpProtocol.js';

export default class TextWithLinks extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    style: PropTypes.object,
  }

  render() {
    const { text, style } = this.props;
    const safeText = escapeHtml(text);
    const matches = lodashOrderBy(lodashUniq(matchUrls(safeText)), 'length');
    let result = safeText;

    matches.forEach((match) => {
      const output = `<a class="inline-blue-link" href="${withHttpProtocol(match)}" ` +
        `target="_blank">${match}</a>`;
      result = result.replaceAll(match, output);
    });

    return (
      <div
        style={style}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: result }}
      />
    );
  }
}
