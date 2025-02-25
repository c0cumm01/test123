// @ts-nocheck
import {
  FormApi,
  FormOptions,
  FormState,
  useForm as useFormInternal,
} from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";

export function useForm<TData>(opts?: FormOptions<TData, typeof zodValidator>) {
  return useFormInternal<TData, typeof zodValidator>({
    ...opts,
    validatorAdapter: zodValidator,
  });
}
export function FormShowIf<TFormData>({
  children,
  form,
  selector,
}: {
  children: React.ReactNode;
  form: FormApi<TFormData, any>;
  selector: (state: FormState<TFormData>) => boolean;
}) {
  return (
    <form.Subscribe selector={selector}>
      {(value) => (value ? children : null)}
    </form.Subscribe>
  );
}
