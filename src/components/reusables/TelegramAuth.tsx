"use client"

import { FC, useRef, useEffect, CSSProperties } from "react"

export interface TelegramAuthProps {
  onAuthCallback: (user: TUser) => void;
  botName: string;
  buttonSize?: "small" | "medium" | "large";
  cornerRadius?: number;
  requestAccess?: boolean;
  usePic?: boolean;
  redirectUrl?: string;
  lang?: string;
  className?: string;
  style?: CSSProperties;
}

const TelegramAuth: FC<TelegramAuthProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    window.onTelegramAuth = (user: TUser) => props.onAuthCallback(user)

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-onauth', "onTelegramAuth(user)")
    script.setAttribute('data-telegram-login', props.botName)
    script.setAttribute('data-size', props.buttonSize ?? "medium")
    if(props.cornerRadius) script.setAttribute('data-radius', String(props.cornerRadius))
    script.setAttribute('data-userpic', String(props.usePic))
    if(props.lang) script.setAttribute('data-lang', props.lang)
    if(props.redirectUrl) script.setAttribute('data-auth-url', props.redirectUrl)
    if(props.requestAccess) script.setAttribute('data-request-access', "write")

    ref.current?.appendChild(script)
  }, [])

  return <div ref={ref} className={props.className} style={props.style} />
}

export default TelegramAuth