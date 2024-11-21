"use client"
import { FC, MouseEventHandler, ReactNode } from "react";
import { ThemeButton } from "./NextuiTheme";
import { useMinimizedState } from "@/helper";

export interface VerifyButtonProps {
  isLoading: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  content?: (clicked: () => void) => ReactNode;
}

const VerifyButton: FC<VerifyButtonProps> = (props) => {
  const [state, dispatch] = useMinimizedState({
    isClicked: false,
    isVerify: false
  })
  if(!state.isClicked && props.content) return props.content(()=>dispatch({isClicked: true}))
  else return (
    <ThemeButton 
      isLoading={props.isLoading} 
      isDisabled={props.isLoading || state.isVerify} 
      radius="full" 
      color={state.isVerify ? "secondary" : "warning"}
      onClick={(evt)=>{
        if(props.onClick) props.onClick(evt)

        dispatch({isVerify: true})
      }}
    >
      {state.isVerify ? "Under Verification" : "Verify Mission"}
    </ThemeButton>
  )
}

export default VerifyButton