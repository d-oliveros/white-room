import React, { type ReactNode } from 'react';
import { useForm, FormProvider, type UseFormReturn } from 'react-hook-form';
import { action } from '@storybook/addon-actions';

interface StorybookFormProviderProps {
  children: ReactNode;
}

export const StorybookFormProvider = ({ children }: StorybookFormProviderProps) => {
  const methods: UseFormReturn = useForm();
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(action('[React Hooks Form] Submit'))}>{children}</form>
    </FormProvider>
  );
};
