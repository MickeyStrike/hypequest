import { FC } from "react";

export interface MinusIconProps {
  width?: string;
  height?: string;
}

const MinusIcon: FC<MinusIconProps> = (props) => {
  return (
    <svg width={props.width ?? "20"} height={props.height ?? "21"} viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.5" clipPath="url(#clip0_5796_33602)">
      <path d="M10 0.5C4.48645 0.5 0 4.98566 0 10.5C0 16.0143 4.48645 20.5 10 20.5C15.5143 20.5 20 16.0143 20 10.5C20 4.98566 15.5136 0.5 10 0.5ZM10 18.9508C5.34004 18.9508 1.54918 15.16 1.54918 10.5C1.54918 5.84004 5.34004 2.04918 10 2.04918C14.66 2.04918 18.4508 5.84004 18.4508 10.5C18.4508 15.16 14.66 18.9508 10 18.9508Z" fill="currentColor"/>
      <path d="M13.8721 9.65625H6.12617C5.69859 9.65625 5.35156 10.0033 5.35156 10.4309C5.35156 10.8584 5.69859 11.2055 6.12617 11.2055H13.8721C14.2997 11.2055 14.6467 10.8584 14.6467 10.4309C14.6467 10.0033 14.2997 9.65625 13.8721 9.65625Z" fill="currentColor"/>
      </g>
      <defs>
      <clipPath id="clip0_5796_33602">
      <rect width="20" height="20" fill="white" transform="translate(0 0.5)"/>
      </clipPath>
      </defs>
    </svg>
  )
}

export default MinusIcon