"use client"
import { NotFoundIcon } from "@/components/assets/icons";
import { InnerWrapper, OuterWrapper } from "@/components/reusables";
import { ThemeButton } from "@/components/reusables/NextuiTheme";
import { useGlobalContext } from "@/providers/stores";
import { NextPage } from "next";
import { DM_Sans } from "@next/font/google"
import NextLink from "next/link"

const dmSans400 = DM_Sans({weight: "400", subsets: ["latin"]})
const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})

const NotFoundPage: NextPage = () => {
  const { state: { isLight } } = useGlobalContext()
  return (
    <OuterWrapper>
      <InnerWrapper className="flex flex-col items-center justify-center py-10 gap-8">
        <NotFoundIcon />
        <h2 className={`transition-all ${dmSans700.className} text-4xl ${isLight ? "text-black" : "text-white"}`}>Page Not Found!</h2>
        <h3 className={`text-center text-[#888A95] text-base lg:text-2xl ${dmSans400.className}`}>We&apos;ve noticed you lost your way...not to worry though!<br />Let&apos;s us help you find your next opportunity</h3>
        <NextLink href="/">
          <ThemeButton color="secondary">BACK TO HOME</ThemeButton>
        </NextLink>
      </InnerWrapper>
    </OuterWrapper>
  )
}

export default NotFoundPage