import type {
  SubmitHandler,
  UseFormProps,
  FieldValues,
  UseFormReturn,
  WatchObserver,
} from 'react-hook-form';
import type { FormFieldType } from '@web/components/ui/FormField/FormField';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormFieldGroup from '@web/components/ui/FormFieldGroup/FormFieldGroup';
import Alert from '@web/components/ui/Alert/Alert';
import Button from '@web/components/ui/Button/Button';

export interface FormProps<TFieldValues extends FieldValues = FieldValues> {
  onSubmit?: SubmitHandler<TFieldValues>;
  defaultValues?: UseFormProps<TFieldValues>['defaultValues'];
  mode?: UseFormProps<TFieldValues>['mode'];
  formFields?: FormFieldType[] | ((context: UseFormReturn<TFieldValues>) => FormFieldType[]);
  footer?: (formContext: UseFormReturn<TFieldValues>) => React.ReactNode;
  isLoading?: boolean;
  error?: string;
  children?: React.ReactNode;
  watch?: WatchObserver<TFieldValues>;
  submitText?: string;
  hideDefaultSubmit?: boolean;
  enableEnterKeyNavigation?: boolean;
}

const Form = <TFieldValues extends FieldValues = FieldValues>({
  onSubmit,
  defaultValues,
  mode = 'onBlur',
  formFields,
  footer,
  watch,
  children,
  isLoading,
  error,
  submitText = 'Submit',
  hideDefaultSubmit = false,
  enableEnterKeyNavigation = true,
}: FormProps<TFieldValues>) => {
  const [submissionError, setSubmissionError] = useState<Error | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const context = useForm({
    defaultValues,
    mode,
  });

  if (watch) {
    context.watch(watch);
  }

  const handleSubmit = useCallback(
    async (data: TFieldValues) => {
      setSubmissionError(null);
      if (onSubmit) {
        try {
          await onSubmit(data);
        } catch (error) {
          setSubmissionError(error as Error);
        }
      }
    },
    [onSubmit],
  );

  // Handle Enter key press to navigate between fields or submit the form
  useEffect(() => {
    if (!enableEnterKeyNavigation) return;

    const handleEnterKeyPress = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;

      // Don't interfere with textarea elements where Enter should create a new line
      if (event.target instanceof HTMLTextAreaElement) return;

      // Don't interfere with button elements where Enter should trigger the button
      if (event.target instanceof HTMLButtonElement) return;

      // Check if the target is part of a react-select component (used by address autocomplete)
      const target = event.target as HTMLElement;
      const isReactSelect = target.closest('.css-b62m3t-container') !== null; // This is the class react-select uses
      if (isReactSelect) return;

      // Check if the event is already handled
      if (event.defaultPrevented) return;

      // Prevent default form submission
      event.preventDefault();

      const inputTarget = event.target as HTMLInputElement;
      if (!inputTarget || !inputTarget.id) return;

      // Get all visible input fields in the form
      const visibleFields = Array.from(
        formRef.current?.querySelectorAll(
          'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])' +
            ':not([type="submit"]):not([type="button"]):not([disabled]), select:not([disabled])',
        ) || [],
      );

      // Find the current field's index
      const currentIndex = visibleFields.findIndex((field) => field.id === inputTarget.id);

      // If this is the last field, submit the form
      if (currentIndex === visibleFields.length - 1) {
        context.handleSubmit(handleSubmit)();
      } else if (currentIndex >= 0 && currentIndex < visibleFields.length - 1) {
        // Otherwise, focus the next field
        (visibleFields[currentIndex + 1] as HTMLElement).focus();
      }
    };

    const formElement = formRef.current;
    if (formElement) {
      formElement.addEventListener('keydown', handleEnterKeyPress);
    }

    return () => {
      if (formElement) {
        formElement.removeEventListener('keydown', handleEnterKeyPress);
      }
    };
  }, [enableEnterKeyNavigation, context, handleSubmit]);

  const formIsLoading = context.formState.isSubmitting || isLoading;
  const formError = submissionError?.message || error || null;

  const resolvedFormFields = typeof formFields === 'function' ? formFields(context) : formFields;

  return (
    <FormProvider {...context}>
      <form ref={formRef} onSubmit={context.handleSubmit(handleSubmit)}>
        {children}
        {resolvedFormFields && (
          <FormFieldGroup formFields={resolvedFormFields}>
            {onSubmit && !hideDefaultSubmit && (
              <div>
                <Button
                  type="submit"
                  disabled={formIsLoading || !context.formState.isValid}
                  isProcessing={formIsLoading}
                  className="w-full"
                >
                  {formIsLoading ? 'Please wait...' : submitText}
                </Button>
              </div>
            )}
            {footer && <div>{footer(context)}</div>}
            {formError && <Alert message={formError} />}
          </FormFieldGroup>
        )}
      </form>
    </FormProvider>
  );
};

export default Form;
