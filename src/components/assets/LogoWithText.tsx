"use client"
import { FC } from "react"
import { LogoOnly } from "."
import { DM_Sans } from "@next/font/google"
import { useGlobalContext } from "@/providers/stores"
import NextLink from "next/link"

const logoFont = DM_Sans({weight: "700", subsets: ["latin"]})

const LogoWithText: FC = () => {
  const { state } = useGlobalContext()
  return (
    <NextLink href="/" className="flex items-center gap-1 cursor-pointer">
      <LogoOnly />
      <span className={`${logoFont.className} text-3xl ${state.isLight ? 'text-black-900' : 'text-white'}`}>HypeQuest</span>
    </NextLink>
  )
}

export default LogoWithText