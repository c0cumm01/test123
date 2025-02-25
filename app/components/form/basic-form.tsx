// @ts-nocheck
import { useForm } from "@tanstack/react-form";
import { UseMutationResult } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { toast } from "sonner";
import { z } from "zod";

import { BasicInput } from "./basic-input";
import { FormSubmitButton } from "./submit";

export default function BasicForm<
  TFormData extends Record<string, unknown>,
  TSchema extends z.ZodObject<{
    [K in keyof TFormData]: z.ZodTypeAny;
  }>,
>(props: {
  data: TFormData;
  mutation: UseMutationResult<any, unknown, any, unknown>;
  schema: TSchema;
  title: string;
  fieldSelectArrayMap?: {
    [key: string]: string[];
  };
  successFunction?: () => void;
}) {
  const schemaShape = props.schema.shape;
  const form = useForm({
    defaultValues: props.data,
    onSubmit: async ({ value }) => {
      try {
        console.log("submitting");
        await props.mutation.mutateAsync(value);
        if (props.successFunction) {
          props.successFunction();
        }
      } catch (e) {
        console.log(e);
        toast.error("An error occurred");
      }
    },
    validatorAdapter: zodValidator,
    validators: {
      onChange: props.schema,
    },
  });
  return (
    <div>
      <h1>{props.title}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div className="flex flex-col space-y-2">
          {Object.keys(schemaShape).map((key, index) => {
            let fieldType = schemaShape[key]._def.innerType
              ? schemaShape[key]._def.innerType._def.typeName
              : schemaShape[key]._def.typeName;
            const selectOptions = props.fieldSelectArrayMap?.[key];
            if (selectOptions) {
              fieldType = "Select";
            }
            return (
              <form.Field
                key={key + index}
                // @ts-ignore
                name={key as keyof TSchema}
                validators={{
                  onChange: schemaShape[key],
                  onChangeAsyncDebounceMs: 500,
                  onChangeAsync: schemaShape[key],
                }}
                children={(field) => {
                  return (
                    <BasicInput
                      field={field}
                      label={key}
                      type={fieldType}
                      selectOptions={selectOptions}
                    />
                  );
                }}
              />
            );
          })}
        </div>

        <FormSubmitButton form={form} />
      </form>
    </div>
  );
}
