import { FieldApi } from "@tanstack/react-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FieldInfo } from "./basic-form-field";

export function BasicInput(props: {
  field: FieldApi<any, any, any, any>;
  label: string;
  type: "ZodString" | "ZodNumber" | "ZodBoolean" | "Select";
  selectOptions?: string[];
}) {
  switch (props.type) {
    case "ZodNumber":
      return (
        <>
          <label htmlFor={props.field.name}>{props.label}:</label>
          <input
            className="text-input"
            id={props.field.name}
            name={props.field.name}
            type="number"
            value={props.field.state.value}
            onBlur={props.field.handleBlur}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              props.field.handleChange(isNaN(value) ? undefined : value);
            }}
          />
          <FieldInfo field={props.field} />
        </>
      );
    case "ZodBoolean":
      return (
        <div className="flex flex-row items-center space-x-2">
          <label htmlFor={props.field.name}>{props.label}:</label>
          <Checkbox
            id={props.field.name}
            name={props.field.name}
            checked={props.field.state.value}
            onBlur={props.field.handleBlur}
            onCheckedChange={(checked) => props.field.handleChange(checked)}
          />
        </div>
      );
    case "Select":
      return (
        <>
          <label htmlFor={props.field.name}>{props.label}:</label>
          <Select
            value={props.field.state.value || ""}
            onValueChange={(v) => {
              props.field.handleChange(v);
            }}
          >
            <SelectTrigger onBlur={props.field.handleBlur}>
              <SelectValue>{props.field.state.value}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {props.selectOptions?.map((item: any, index: number) => (
                <SelectItem value={item} key={index}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldInfo field={props.field} />
        </>
      );
    default:
      return (
        <>
          <label htmlFor={props.field.name}>{props.label}:</label>
          <input
            className="text-input"
            id={props.field.name}
            name={props.field.name}
            value={props.field.state.value}
            onBlur={props.field.handleBlur}
            onChange={(e) => props.field.handleChange(e.target.value)}
          />
          <FieldInfo field={props.field} />
        </>
      );
  }
}
