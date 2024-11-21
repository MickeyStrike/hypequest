import { FC } from "react";

export interface YoutubeIconProps {
  width?: string;
  height?: string;
}

const YoutubeIcon: FC<YoutubeIconProps> = (props) => {
  return (
    <svg height={props.height ?? "512"} width={props.width ?? "512"} viewBox="0 0 152 152" xmlns="http://www.w3.org/2000/svg"><g id="Layer_2" data-name="Layer 2"><g id="Color" fill="currentColor"><g id="_02.YouTube" data-name="02.YouTube"><path d="m65.46 88.26 21.08-12.23-21.08-12.29z"/><path d="m76 0a76 76 0 1 0 76 76 76 76 0 0 0 -76-76zm40 89.45a15.13 15.13 0 0 1 -15.13 15.14h-49.74a15.13 15.13 0 0 1 -15.13-15.14v-26.9a15.13 15.13 0 0 1 15.13-15.14h49.74a15.13 15.13 0 0 1 15.13 15.14z"/></g></g></g></svg>
  )
}

export default YoutubeIcon