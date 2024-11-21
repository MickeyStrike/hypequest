import { FC } from "react";

export interface PencilIconProps {
  width?: string;
  height?: string;
}

const PencilIcon: FC<PencilIconProps> = (props) => {
  return (
    <svg width={props.width ?? "10"} height={props.height ?? "11"} viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_4718_21464)">
      <path d="M6.17554 2.17969L0.673399 7.68223C0.645718 7.70999 0.62573 7.74504 0.616212 7.78272L0.00635232 10.2306C-0.0118903 10.3042 0.00976291 10.3826 0.0635391 10.4364C0.104228 10.4771 0.15967 10.4996 0.216381 10.4996C0.233751 10.4996 0.251518 10.4975 0.268809 10.4931L2.71666 9.88316C2.75481 9.87364 2.78947 9.85374 2.81715 9.82605L8.31977 4.32391L6.17554 2.17969Z" fill="currentColor"/>
      <path d="M9.68346 1.42911L9.07098 0.816629C8.66163 0.40728 7.94818 0.407676 7.53931 0.816629L6.78906 1.56688L8.93321 3.71102L9.68346 2.96077C9.88793 2.75638 10.0006 2.48432 10.0006 2.19498C10.0006 1.90564 9.88793 1.63358 9.68346 1.42911Z" fill="currentColor"/>
      </g>
      <defs>
      <clipPath id="clip0_4718_21464">
      <rect width="10" height="10" fill="currentColor" transform="translate(0 0.5)"/>
      </clipPath>
      </defs>
    </svg>
  )
}

export default PencilIcon