"use client"
import { FC, PropsWithChildren } from "react"
import { NextUIProvider } from '@nextui-org/react'
import CustomModalProvider from "./modal"

const Provider: FC<PropsWithChildren> = ({children}) => {
  return (
    <NextUIProvider>
      <CustomModalProvider>
        {children}
      </CustomModalProvider>
    </NextUIProvider>
  )
}

export default Provider