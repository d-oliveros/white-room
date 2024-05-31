import React, { Component } from 'react';
import { formatPhoneNumber } from '#common/formatters';

class SmsSendingIndicator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSmsSent: false,
    };
    this._unmounting = false;
  }

  componentDidMount() {
    this.renderSmsSent();
  }

  renderSmsSent() {
    setTimeout(() => {
      if (!this._unmounting) {
        this.setState({
          showSmsSent: true,
        });
      }
    }, 2000);
  }

  render() {
    const { phone } = this.props;
    const { showSmsSent } = this.state;

    return (
      <div className='stepContainer'>
        <div className='modal success'>
          {showSmsSent
            ? (
              <div className='contentContainer'>
                <div className='smsSent' />
                <div className='textContainer'>
                  <span className='headline'>
                    Sent you the code!
                  </span>
                </div>
              </div>
            ) : (
              <div className='contentContainer'>
                <div className='smsSending' />
                <div className='textContainer'>
                  <span className='headline'>
                    Sending SMS to
                    <br />
                    {formatPhoneNumber(phone)}
                  </span>
                </div>
              </div>
            )}
        </div>
      </div>
    );
  }
}

export default SmsSendingIndicator;
