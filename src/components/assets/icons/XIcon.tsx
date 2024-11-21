import { FC } from "react"

export interface XIconProps {
  width?: string;
  height?: string;
}

const XIcon: FC<XIconProps> = (props) => {
  return (
    <svg width={props.width ?? "26"} height={props.height ?? "26"} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="13" r="13" fill="black"/>
      <path d="M6.63715 19.3662L11.6858 13.8437L6.46484 6.9082H10.764L14.0465 11.2504L18.0354 6.9082H19.681L14.7874 12.2412L20.1548 19.3662H15.8471L12.4268 14.8344L8.28271 19.3662H6.63715ZM16.4157 18.4271H18.1733L10.204 7.84729H8.43779L16.4157 18.4271Z" fill="white"/>
    </svg>
  )
}

export default XIcon