import { FC } from "react";

export interface UploadIconProps {
  width?: string;
  height?: string;
}

const UploadIcon: FC<UploadIconProps> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.width ?? "16"} height={props.height ?? "16"} viewBox="0 0 16 16" fill="none">
      <g clipPath="url(#clip0_5126_13560)">
      <path d="M6.19775 4.75823L7.64909 3.30689V10.9844C7.64909 11.1709 7.72317 11.3497 7.85503 11.4816C7.98689 11.6134 8.16574 11.6875 8.35222 11.6875C8.5387 11.6875 8.71754 11.6134 8.8494 11.4816C8.98126 11.3497 9.05534 11.1709 9.05534 10.9844V3.30689L10.5067 4.75823C10.5719 4.82381 10.6494 4.87588 10.7348 4.91145C10.8202 4.94702 10.9118 4.9654 11.0043 4.96552C11.0968 4.96565 11.1884 4.94752 11.2738 4.91218C11.3593 4.87684 11.437 4.82499 11.5024 4.75958C11.5678 4.69418 11.6197 4.61651 11.655 4.53103C11.6903 4.44555 11.7085 4.35394 11.7083 4.26144C11.7082 4.16895 11.6898 4.07738 11.6543 3.992C11.6187 3.90662 11.5666 3.82909 11.501 3.76386L8.84941 1.1122C8.78412 1.04691 8.70661 0.995113 8.6213 0.959776C8.53599 0.924438 8.44456 0.90625 8.35222 0.90625C8.25988 0.90625 8.16844 0.924438 8.08313 0.959776C7.99782 0.995113 7.92031 1.04691 7.85502 1.1122L5.20339 3.76386C5.13781 3.82909 5.08574 3.90662 5.05017 3.992C5.0146 4.07738 4.99622 4.16895 4.99609 4.26144C4.99597 4.35394 5.01409 4.44555 5.04943 4.53103C5.08477 4.61651 5.13663 4.69418 5.20203 4.75958C5.26744 4.82499 5.34511 4.87684 5.43059 4.91218C5.51607 4.94752 5.60768 4.96565 5.70018 4.96552C5.79267 4.9654 5.88423 4.94702 5.96962 4.91145C6.055 4.87588 6.13253 4.82381 6.19775 4.75823Z" fill="currentColor"/>
      <path d="M14.4453 7C14.2588 7 14.08 7.07408 13.9481 7.20594C13.8163 7.3378 13.7422 7.51664 13.7422 7.70312V13.0938H2.96094V7.70312C2.96094 7.51664 2.88686 7.3378 2.755 7.20594C2.62314 7.07408 2.44429 7 2.25781 7C2.07133 7 1.89249 7.07408 1.76063 7.20594C1.62877 7.3378 1.55469 7.51664 1.55469 7.70312V13.3281C1.55469 13.6389 1.67815 13.937 1.89792 14.1568C2.11769 14.3765 2.41576 14.5 2.72656 14.5H13.9766C14.2874 14.5 14.5854 14.3765 14.8052 14.1568C15.025 13.937 15.1484 13.6389 15.1484 13.3281V7.70312C15.1484 7.51664 15.0744 7.3378 14.9425 7.20594C14.8106 7.07408 14.6318 7 14.4453 7Z" fill="currentColor"/>
      </g>
      <defs>
      <clipPath id="clip0_5126_13560">
      <rect width="15" height="15" fill="currentColor" transform="translate(0.851562 0.203125)"/>
      </clipPath>
      </defs>
    </svg>
  )
}

export default UploadIcon