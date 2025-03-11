import type { FormFieldType } from '@web/components/ui/FormField/FormField';
import FormField from '@web/components/ui/FormField/FormField';

interface FormFieldGroupProps {
  formFields: FormFieldType[];
  children?: React.ReactNode;
}

const FormFieldGroup = ({ formFields, children }: FormFieldGroupProps) => {
  return (
    <div className="flex flex-col gap-2">
      {formFields.map((formField) => (
        <FormField key={formField.id} formField={formField} />
      ))}
      {children}
    </div>
  );
};

export default FormFieldGroup;
