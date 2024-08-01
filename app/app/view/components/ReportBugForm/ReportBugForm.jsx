import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';

import {
  createInitialValues,
  createFormValidationFn,
} from '#white-room/client/helpers/formikHelpers.js';

import postWithState from '#white-room/client/actions/postWithState.js';

import useDispatch from '#white-room/client/hooks/useDispatch.js';

import FormikField, {
  FIELD_THEME_ADOBE,
} from '#app/view/components/FormikField/FormikField.jsx';
import Text from '#app/view/components/Text/Text.jsx';
import Flex from '#app/view/components/Flex/Flex.jsx';
import Button, {
  BUTTON_THEME_ADOBE_GREY,
  BUTTON_THEME_ADOBE_BLUE,
} from '#app/view/components/Button/Button.jsx';

const formFields = [
  {
    id: 'message',
    type: 'long_text',
    title: 'Describe the bug here:',
    properties: {
      placeholder: 'Write here...',
    },
  },
];

const ReportBugForm = (props) => {
  const {
    userId,
    section,
    onSubmit,
    onClose,
  } = props;

  const dispatch = useDispatch();
  const [isBusy, setIsBusy] = useState(false);

  const _onSubmit = useCallback((_formValues) => {
    setIsBusy(true);
    dispatch(postWithState, {
      action: API_ACTION_BUG_REPORT,
      payload: {
        userId,
        section,
        ..._formValues,
      },
    })
      .then((bugReport) => {
        return onSubmit(bugReport);
      })
      .then(() => {
        setIsBusy(false);
      })
      .catch(() => {
        setIsBusy(false);
      });
  }, [userId, section, onSubmit, dispatch, setIsBusy]);

  return (
    <Formik
      enableReinitialize
      validate={createFormValidationFn(formFields)}
      initialValues={createInitialValues({
        formFields: formFields,
        defaultValues: {},
      })}
      onSubmit={_onSubmit}
      render={(formikBag) => {
        return (
          <div
            bgColor='white'
            borderRadius='24px'
            padding='28px 25px 30px'
          >
            <Form className='ReportBugForm'>
              <Text
                font='greycliff'
                weight='800'
                size='28'
                lineHeight='34px'
              >
                🐞 Log Product Bug
              </Text>
              {formFields.map((formField) => (
                <FormikField
                  key={formField.id}
                  formField={formField}
                  formikBag={formikBag}
                  theme={FIELD_THEME_ADOBE}
                />
              ))}
              <Flex marginTop='20px' gap='33px' justify='between'>
                {onClose && (
                  <div width='100%'>
                    <Button
                      onClick={onClose}
                      theme={BUTTON_THEME_ADOBE_GREY}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                <div width='100%'>
                  <Button
                    type='submit'
                    disabled={!formikBag.isValid || isBusy}
                    theme={BUTTON_THEME_ADOBE_BLUE}
                  >
                    Submit
                  </Button>
                </div>
              </Flex>
            </Form>
          </div>
        );
      }}
    />
  );
};

ReportBugForm.propTypes = {
  userId: PropTypes.number,
  section: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
};

export default ReportBugForm;
