import { FC } from "react";

export interface BurgerIconProps {
  width?: string;
  height?: string;
}

const BurgerIcon: FC<BurgerIconProps> = (props) => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 1024 1024"
      height={props.height ?? "1.5rem"}
      width={props.width ?? "1.5rem"}
      xmlns="http://www.w3.org/2000/svg">
        <path d="M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0 624H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0-312H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z"></path>
    </svg>
  )
}

export default BurgerIcon