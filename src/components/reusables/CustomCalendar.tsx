import { useGlobalContext } from "@/providers/stores"
import DatePicker, { DateObject, DatePickerProps, Value } from "react-multi-date-picker"
import { InitFormikConfig, checkIsInvalidForm, errorMessagesHandler } from "./NextuiTheme";
import { Fragment } from "react";

export interface CustomCalendar extends DatePickerProps {
  placeholder?: string;
  value?: Value;
  onChange?: (date: DateObject | DateObject[] | null, options: {
    validatedValue: string | string[];
    input: HTMLElement;
    isTyping: boolean;
  }) => false | void
}

const CustomCalendar = <T extends object>({inputClass, value, onChange, formik, ...props}: InitFormikConfig<CustomCalendar, T>) => {
  const { state } = useGlobalContext()
  return (
    <Fragment>
      <DatePicker
        numberOfMonths={2}
        inputClass={`${state.isLight ? "bg-transparent" : "bg-[#121212]"} transition-all rounded-md min-h-[40px] text-white text-center border-2 border-gray hover:border-gray-400 w-full ${inputClass ?? ""}`}
        range
        placeholder={props.placeholder}
        value={formik ? formik.config.values[formik.name] as Value : value}
        onChange={formik ? (v) => {formik.config.setFieldValue(formik.name.toString(), v)} : onChange}
        {...props}
      />
      {(checkIsInvalidForm(formik) && errorMessagesHandler(formik)) && <div className="text-danger text-[0.75rem]">{errorMessagesHandler(formik)}</div>}
    </Fragment>
  )
}

export default CustomCalendar