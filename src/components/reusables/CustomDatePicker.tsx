import { useGlobalContext } from "@/providers/stores"
import DatePicker, { CalendarProps, Value } from "react-multi-date-picker"
import { InitFormikConfig, checkIsInvalidForm, errorMessagesHandler } from "./NextuiTheme"
import { Fragment } from "react"

export interface CustomDatePicker extends CalendarProps {
  placeholder?: string
}

const CustomDatePicker = <T extends object>({formik, value, onChange, ...props}: InitFormikConfig<CustomDatePicker, T>) => {
  const { state } = useGlobalContext()
  return (
    <Fragment>
      <DatePicker 
        inputClass={`rounded-md w-full min-h-[40px] text-white text-left pl-2 ${state.isLight ? "" : "dark"}`}
        value={formik ? formik.config.values[formik.name] as Value : value}
        onChange={formik ? (v) => {formik.config.setFieldValue(formik.name.toString(), v)} : onChange}
        {...props}
      />
      {(checkIsInvalidForm(formik) && errorMessagesHandler(formik)) && <div className="text-danger text-[0.75rem]">{errorMessagesHandler(formik)}</div>}
    </Fragment>
  )
}

export default CustomDatePicker