import React, { Component } from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/fp/get.js';

class FormikErrorMessage extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    formikBag: PropTypes.object.isRequired,
  };

  render() {
    const { formikBag, id } = this.props;
    const formError = lodashGet(id, formikBag.errors);
    const wasTouched = lodashGet(id, formikBag.touched);

    if (!formError || !wasTouched) {
      return null;
    }

    return (
      <span className='formMessage error'>
        {formError}
      </span>
    );
  }
}

export default FormikErrorMessage;
