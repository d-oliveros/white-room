import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Prompt } from 'react-router-dom';
import { Formik, Form } from 'formik';
import lodashPick from 'lodash/fp/pick.js';
import lodashFindIndex from 'lodash/findIndex';
import ReactAppContext from '#client/core/ReactAppContext.js';
import classNames from 'classnames';

import {
  getHelpCardTitle,
} from '#common/helpCardHelpers';

import {
  createInitialValues,
  createFormValidationFn,
  createFormServerValidationFn,
  validateFormField,
  scrollToFormField,
} from '#client/helpers/formikHelpers.js';

import log from '#client/lib/log.js';

import Box from '#client/components/Box/Box.js';
import PartnerPageV2, { PARTNER_PAGE_V2_FONT_SIZE_SMALL } from '#client/components/PartnerPageV2/PartnerPageV2';
import RouteLeavingGuard from '#client/components/RouteLeavingGuard/RouteLeavingGuard.js';
import ErrorMessage from '#client/components/ErrorMessage/ErrorMessage.js';
import HelpCardSection from '#client/components/HelpCardSection/HelpCardSection.js';
import BuyerSideAgentFormBody from '#client/components/BuyerSideAgentFormPage/BuyerSideAgentFormBody.js';

export const MULTI_STEP_FORM_THEME_DEFAULT = 'MULTI_STEP_FORM_THEME_DEFAULT';
export const MULTI_STEP_FORM_THEME_PARTNER_PAGE = 'MULTI_STEP_FORM_THEME_PARTNER_PAGE';
export const MULTI_STEP_FORM_THEME_HOUSEHOLD_BUYER_SIDE_AGENT_PAGE = 'MULTI_STEP_FORM_THEME_HOUSEHOLD_BUYER_SIDE_AGENT_PAGE'; // eslint-disable-line max-len

const debug = log.debug('client:MultiStepForm');

class MultiStepForm extends Component {
  static contextType = ReactAppContext;

  constructor(props) {
    super(props);

    this.state = {
      step: props.defaultStep || 0,
      editingStep: null,
      isValidating: false,
    };

    this._onNext = this._onNext.bind(this);
  }

  componentDidMount() {
    if (process.browser) {
      global.addEventListener('beforeunload', this._onBeforeUnload, true);
    }
  }

  componentWillUnmount() {
    if (process.browser) {
      global.removeEventListener('beforeunload', this._onBeforeUnload, true);
    }
  }

  _onBeforeUnload = (event) => {
    const {
      confirmLeave,
    } = this.props;

    if (confirmLeave && this.formik?.getFormikBag().dirty) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  _scrollToTop = () => {
    if (process.browser) {
      global.scrollTo(0, 0);
    }
  }

  _getStepConfig = (formikBag, targetStepId) => {
    const {
      getFormSteps,
      getFormFields,
    } = this.props;
    const {
      step,
    } = this.state;

    const formSteps = getFormSteps(formikBag);
    const formFields = getFormFields(formikBag);

    const stepDefinitionIndex = targetStepId
      ? lodashFindIndex(formSteps, (step) => step.id === targetStepId)
      : step;
    const stepDefinition = formSteps[stepDefinitionIndex];
    const stepFormFields = formFields.filter(({ id }) => {
      return stepDefinition.fieldIds.includes(id);
    });

    return {
      stepDefinition,
      stepDefinitionIndex,
      formSteps,
      formFields,
      stepFormFields,
    };
  };

  _isLastStep = (formikBag) => {
    const {
      formSteps,
    } = this._getStepConfig(formikBag);

    return (this.state.step === formSteps.length - 1);
  }

  _isValid = (formikBag) => {
    const {
      stepFormFields,
    } = this._getStepConfig(formikBag);

    const isValid = stepFormFields.every((formField) => {
      const errors = validateFormField({
        validations: formField.validations,
        value: formikBag.values[formField.id],
        values: formikBag.values,
      });
      return !errors;
    });

    return isValid;
  }

  _goToNextStep = () => {
    const formikBag = this.formik.getFormikBag();
    const isLastStep = this._isLastStep(formikBag);

    const {
      step,
      editingStep,
    } = this.state;
    const {
      submitOnNext,
    } = this.props;
    const {
      formSteps,
    } = this._getStepConfig(formikBag);

    if (editingStep) {
      this.setState({
        step: lodashFindIndex(
          formSteps,
          (step) => step.id === editingStep.sourceStepId
        ),
        editingStep: null,
      }, this._onStepChange);
      this._scrollToTop();
    }
    else if (isLastStep) {
      // Already submitted
      if (submitOnNext) {
        return;
      }
      formikBag.handleSubmit();
    }
    else {
      this.setState({
        step: step + 1,
      }, this._onStepChange);
      this._scrollToTop();
    }
  };

  async _onNext() {
    try {
      const formikBag = this.formik.getFormikBag();
      const areFieldsValid = this._isValid(formikBag);
      const { validateOnClickNext, submitOnNext } = this.props;
      const {
        stepFormFields,
        stepDefinition: { serverValidations },
      } = this._getStepConfig(formikBag);

      this.setState({ isValidating: true });

      if (validateOnClickNext) {
        if (!areFieldsValid) {
          const formErrors = createFormValidationFn(
            stepFormFields.filter(({ type }) => type !== 'hidden')
          )(formikBag.values);

          const formFielIdsWithErrors = Object.keys(formErrors);

          if (formFielIdsWithErrors.length) {
            formFielIdsWithErrors.forEach((formFieldId) => {
              formikBag.setFieldTouched(formFieldId, true, true);
            });
            scrollToFormField({
              formFieldId: formFielIdsWithErrors[0],
            });
            this.setState({ isValidating: false });
            return;
          }
        }

        if (serverValidations) {
          const { apiClient, tree } = this.context;

          const serverValidationErrors = await createFormServerValidationFn({
            serverValidations,
            apiClient,
            state: tree,
          })(formikBag.values);

          const serverValidationsWithErrors = Object.keys(serverValidationErrors);
          if (serverValidationsWithErrors.length) {
            for (const validationName in serverValidationErrors) {
              if (validationName) {
                const { fieldIdError, error } = serverValidationErrors[
                  validationName
                ];
                formikBag.setFieldError(fieldIdError, error);
                formikBag.setFieldTouched(fieldIdError, true, false);
              }
            }
            const firstValidationFailed = serverValidationsWithErrors[0];
            const { fieldIdError } = serverValidationErrors[
              firstValidationFailed
            ];

            scrollToFormField({
              formFieldId: fieldIdError,
            });
            this.setState({ isValidating: false });
            return;
          }
        }
      }

      this.setState({ isValidating: false });

      if (submitOnNext) {
        formikBag.handleSubmit();
      }
      else {
        this._goToNextStep();
      }
    }
    catch (error) {
      log.error(error);
    }
  }

  _onSubmit = (formValues) => {
    const formikBag = this.formik.getFormikBag();

    const {
      onSubmit,
    } = this.props;
    const {
      stepDefinition,
    } = this._getStepConfig(formikBag);

    debug('onSubmit', formValues, {
      stepDefinition,
    });

    onSubmit(formValues, {
      stepDefinition,
      formikBag,
      goToNextStep: this._goToNextStep,
    });
  }

  _onStepChange = () => {
    const formikBag = this.formik.getFormikBag();

    const {
      onStepChange,
    } = this.props;
    const {
      stepDefinition,
      stepFormFields,
    } = this._getStepConfig(formikBag);

    const touchedFields = stepFormFields.reduce((memo, formField) => {
      return {
        ...memo,
        [formField.id]: false,
      };
    }, {});
    formikBag.setTouched(touchedFields);

    if (onStepChange) {
      onStepChange({ stepDefinition });
    }
  }

  render() {
    const {
      defaultStep,
      defaultValues,
      getFormFields,
      onBack,
      confirmLeave,
      isBusy,
      submitErrorMessage,
      dispatch,
      partner,
      validateOnChange,
      validateOnClickNext,
      helpCards,
      canGoBackFromInitialStep,
      formClassNames,
    } = this.props;
    const {
      step,
      editingStep,
    } = this.state;

    const isInitialStep = (
      !editingStep
      && step === (defaultStep || 0)
    );

    return (
      <Formik
        ref={(formik) => {
          this.formik = formik;
        }}
        initialValues={createInitialValues({
          formFields: getFormFields({ values: defaultValues || {} }),
          defaultValues: defaultValues,
        })}
        validate={(values) => {
          const { stepFormFields } = this._getStepConfig({ values });
          return createFormValidationFn(stepFormFields)(values);
        }}
        validateOnChange={validateOnChange}
        onSubmit={this._onSubmit}
      >
        {(formikBag) => {
          const {
            formSteps,
            stepFormFields,
            stepDefinition,
          } = this._getStepConfig(formikBag);

          const isLastStep = this._isLastStep(formikBag);
          const isValid = this._isValid(formikBag);
          const showHelpsCards = helpCards && helpCards.length > 0 && stepDefinition.ui.showHelpCards;

          const _onForceNext = () => {
            this.setState({
              step: step + 1,
              editingStep: null,
            }, this._onStepChange);
            this._scrollToTop();
          };

          const _onBack = () => {
            if (editingStep) {
              for (const fieldId of Object.keys(editingStep.targetStepInitialValues)) {
                formikBag.setFieldValue(fieldId, editingStep.targetStepInitialValues[fieldId]);
              }
              this.setState({
                step: formSteps.length - 1,
                editingStep: null,
              }, this._onStepChange);
              this._scrollToTop();
            }
            else if (isInitialStep && !(canGoBackFromInitialStep && step > 0)) {
              onBack();
            }
            else {
              this.setState({
                step: step - 1,
              }, this._onStepChange);
              this._scrollToTop();
            }
            return false;
          };

          const _onEditStep = (targetStepId) => {
            const targetStepConfig = this._getStepConfig(formikBag, targetStepId);
            this.setState({
              step: targetStepConfig.stepDefinitionIndex,
              editingStep: {
                sourceStepId: stepDefinition.id,
                targetStep: targetStepConfig.stepDefinitionIndex,
                targetStepInitialValues: lodashPick(
                  targetStepConfig.stepDefinition.fieldIds,
                  formikBag.values,
                ),
              },
            }, this._onStepChange);
            this._scrollToTop();
          };

          const theme = stepDefinition.ui?.theme || MULTI_STEP_FORM_THEME_DEFAULT;
          const CurrentStep = stepDefinition.component;
          const currentStepDOM = (
            <CurrentStep
              formikBag={formikBag}
              formFields={stepFormFields}
              step={step}
              totalSteps={formSteps.length}
              onNext={this._onNext}
              onForceNext={_onForceNext}
              onBack={_onBack}
              onEditStep={_onEditStep}
              partner={partner}
              stepDefinitionUI={stepDefinition.ui}
            />
          );

          let formDOM;
          switch (theme) {
            case MULTI_STEP_FORM_THEME_DEFAULT: {
              formDOM = currentStepDOM;
              break;
            }
            case MULTI_STEP_FORM_THEME_HOUSEHOLD_BUYER_SIDE_AGENT_PAGE: {
              const Control = stepDefinition.ui.controlComponent;

              formDOM = (
                <BuyerSideAgentFormBody
                  onBack={_onBack}
                  apiState={{
                    inProgress: isBusy,
                  }}
                >
                  {currentStepDOM}
                  {Control && (
                    <Control
                      isBusy={isBusy}
                      legend={stepDefinition.ui.legend && stepDefinition.ui.legend({
                        onForceNext: _onForceNext,
                      })}
                      noStaticFooter={stepDefinition.ui.noStaticFooter}
                    />
                  )}
                </BuyerSideAgentFormBody>
              );
              break;
            }
            case MULTI_STEP_FORM_THEME_PARTNER_PAGE: {
              const Control = stepDefinition.ui.controlComponent;
              const Footer = stepDefinition.ui.footerComponent;
              formDOM = (
                <PartnerPageV2
                  onBack={stepDefinition.ui.hideBackButton ? null : _onBack}
                  navbarTitle={stepDefinition.ui.navbarTitle}
                  pageHeader={stepDefinition.ui.pageHeader}
                  pageSubtitle={stepDefinition.ui.pageIntroText}
                  headerSize={PARTNER_PAGE_V2_FONT_SIZE_SMALL}
                  progressBarPercent={!stepDefinition.ui.hideProgressBar
                    ? ((step + 1) / formSteps.length) * 100
                    : null
                  }
                  progressBarText={!stepDefinition.ui.hideProgressBar
                    ? typeof stepDefinition.ui.progressBarText === 'string'
                      ? stepDefinition.ui.progressBarText
                      : `Step ${step + 1} of ${formSteps.length}`
                    : null
                  }
                >
                  {currentStepDOM}
                  {submitErrorMessage && isLastStep && (
                    <Box paddingTop='20px'>
                      <ErrorMessage>
                        {submitErrorMessage}
                      </ErrorMessage>
                    </Box>
                  )}
                  {Footer && (
                    <Footer />
                  )}
                  {Control && (
                    <Control
                      buttonText={editingStep
                        ? 'Save'
                        : isBusy
                          ? 'Please wait...'
                          : stepDefinition.ui.controlButtonText
                      }
                      buttonTheme={stepDefinition.ui.controlButtonTheme || undefined}
                      onBack={_onBack}
                      onNext={this._onNext}
                      isBusy={isBusy}
                      footerText={stepDefinition.ui.controlFooterText}
                      disabled={isBusy || this.state.isValidating || (!isValid && !validateOnClickNext)}
                      isValid={isValid}
                      editingStep={editingStep}
                    />
                  )}
                  {showHelpsCards && (
                    <Box marginTop='80px'>
                      <HelpCardSection
                        helpCards={helpCards}
                        title={getHelpCardTitle({ partner })}
                      />
                    </Box>
                  )}
                </PartnerPageV2>
              );
              break;
            }
            default: {
              const error = new Error(`Theme "${stepDefinition.theme} not supported.`);
              error.name = 'MultiStepFormThemeNotSupportedError';
              error.details = { ...stepDefinition };
              throw error;
            }
          }

          debug(`Rendering step ${step}`, {
            formikBag,
            formSteps,
            stepFormFields,
            stepDefinition,
          });

          return (
            <>
              <Form className={classNames('form', formClassNames)}>
                {formDOM}
              </Form>
              <Prompt
                when={!isInitialStep && confirmLeave && formikBag.submitCount === 0}
                message={_onBack}
              />
              <RouteLeavingGuard
                when={isInitialStep && confirmLeave && formikBag.dirty}
                dispatch={dispatch}
              />
            </>
          );
        }}
      </Formik>
    );
  }
}

MultiStepForm.propTypes = {
  defaultValues: PropTypes.object,
  defaultStep: PropTypes.number,
  getFormSteps: PropTypes.func.isRequired,
  getFormFields: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  confirmLeave: PropTypes.bool.isRequired,
  validateOnChange: PropTypes.bool,
  validateOnClickNext: PropTypes.bool,
  canGoBackFromInitialStep: PropTypes.bool,
  submitOnNext: PropTypes.bool,
  onStepChange: PropTypes.func,
  isBusy: PropTypes.bool,
  submitErrorMessage: PropTypes.string,
  partner: PropTypes.object,
  formClassNames: PropTypes.string,
};

MultiStepForm.defaultProps = {
  validateOnChange: true,
};

export default React.forwardRef((props, ref) => (
  <MultiStepForm
    ref={ref}
    {...props}
  />
));
