import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ReactMarkdown from 'react-markdown';

export const MARKDOWN_THEME_LEGAL = 'legal';
export const MARKDOWN_THEME_GREYCLIFF = 'greycliff';

const Markdown = ({ source, theme, escapeHtml, onRef }) => {
  return (
    <div ref={onRef} className={classnames('Markdown', theme)}>
      <ReactMarkdown source={source} escapeHtml={escapeHtml} />
    </div>
  );
};

Markdown.propTypes = {
  source: PropTypes.string.isRequired,
  theme: PropTypes.oneOf([
    MARKDOWN_THEME_LEGAL,
    MARKDOWN_THEME_GREYCLIFF,
  ]),
  escapeHtml: PropTypes.bool,
  onRef: PropTypes.func,
};

Markdown.defaultProps = {
  theme: MARKDOWN_THEME_LEGAL,
};

export default Markdown;
