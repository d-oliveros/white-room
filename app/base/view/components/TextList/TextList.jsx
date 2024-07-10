import React from 'react';
import PropTypes from 'prop-types';

import Text from '#base/view/components/Text/Text.jsx';
import Flex from '#base/view/components/Flex/Flex.jsx';

function TextList({
  textList,
  ordered,
  fontSize,
  lineHeight,
  font,
  weight,
}) {
  const listProps = {
    className: 'TextList',
  };
  const textProps = {
    fontSize,
    lineHeight,
    font,
    weight,
  };

  if (ordered) {
    return (
      <ol {...listProps}>
        {textList.map((text, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={index}>
            <Text {...textProps}>
              <Flex>
                <span className='number'>{`${index + 1}. `}</span>
                <span>{text}</span>
              </Flex>
            </Text>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul {...listProps}>
      {textList.map((text) => (
        <li key={text}>
          <Text {...textProps}>{`${text}`}</Text>
        </li>
      ))}
    </ul>
  );
}

const inlineStyleProp = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

TextList.propTypes = {
  textList: PropTypes.array.isRequired,
  ordered: PropTypes.bool,
  fontSize: inlineStyleProp,
  lineHeight: inlineStyleProp,
  font: inlineStyleProp,
  weight: inlineStyleProp,
};

export default TextList;
