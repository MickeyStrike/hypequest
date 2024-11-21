import { FC } from "react"
import DatePicker, { CalendarProps } from "react-multi-date-picker"

export interface CustomRangePicker extends CalendarProps {

}

const CustomRangePicker: FC<CustomRangePicker> = (props) => {
  return (
    <DatePicker 
      inputClass="bg-[#121212] rounded-full min-h-[40px] text-white text-center"
      range
      {...props}
    />
  )
}

export default CustomRangePicker