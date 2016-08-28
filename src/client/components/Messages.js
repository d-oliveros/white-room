import React from 'react';

/**
 * Gets the messages type and the messages array to be rendered.
 *
 * @param  {Object} data The messages object.
 * @return {Object}      Object containing the messages type and messages list.
 */
const formatMessages = (data) => {
  for (const msgType of ['success', 'error', 'info']) {
    if (data[msgType]) return { type: msgType, messages: data[msgType] };
  }

  return { type: null, messages: [] };
};

/**
 * Renders a messages list. The messages can be either success, error, of info.
 */
const Messages = (props) => {
  const { type, messages } = formatMessages(props.messages);

  return (
    <div role='alert' className={`callout ${type}`}>
      {messages.map((message, index) => <div key={index}>{message.msg}</div>)}
    </div>
  );
};

export default Messages;
