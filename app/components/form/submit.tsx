// @ts-nocheck
import { FormApi } from "@tanstack/react-form";

import { Button, ButtonProps } from "@/components/ui/button";

interface FormSubmitButtonProps<TFormData> extends Omit<ButtonProps, "form"> {
  form: FormApi<TFormData, any>;
}
export function FormSubmitButton<TFormData>({
  form,
  ...props
}: FormSubmitButtonProps<TFormData>) {
  return (
    <form.Subscribe
      selector={(state: any) => ({
        canSubmit: state.canSubmit,
      })}
      children={({ canSubmit }) => (
        <Button {...props} disabled={!canSubmit} type="submit">
          Save
        </Button>
      )}
    />
  );
}
