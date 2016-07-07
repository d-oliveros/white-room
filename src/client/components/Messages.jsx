import React from 'react';

/**
 * Renders a messages list. The messages can be either success, error, of info.
 */
export default class Messages extends React.Component {
  render() {
    const { type, messages } = getMessages(this.props.messages);

    return (
      <div role='alert' className={`callout ${type}`}>
        {messages.map((message, index) => <div key={index}>{message.msg}</div>)}
      </div>
    );
  }
}

/**
 * Gets the messages type and the messages array to be rendered.
 * @param  {Object} data The messages object.
 * @return {Object}      Object containing the messages type and messages list.
 */
function getMessages(data) {
  for (const msgType of ['success', 'error', 'info']) {
    if (data[msgType]) return { type: msgType, messages: data[msgType] };
  }

  return { type: null, messages: [] };
}
