import { FC } from "react"

export interface TwitterXIconProps {
  width?: string;
  height?: string;
}

const TwitterXIcon: FC<TwitterXIconProps> = (props) => {
  return (
    <svg width={props.width ?? "22"} height={props.height ?? "19"} viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.5" d="M0.794797 19L8.51671 10.5775L0.53125 0H7.10674L12.1273 6.62241L18.2284 0H20.7453L13.2605 8.13347L21.47 19H14.8814L9.64996 12.0885L3.31167 19H0.794797ZM15.7511 17.5678H18.4392L6.25021 1.43223H3.54886L15.7511 17.5678Z" fill="currentColor"/>
    </svg>
  )
}

export default TwitterXIcon