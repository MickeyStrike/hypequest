import { SocmedAdminAuthParams } from "@/types/service-types"
import { objectUrlEncoder } from "@/helper"
import { useRouter } from "next/navigation"
import CONSTANT from "@/Constant"

const useSocmedAdminAuthService = () => {
  const router = useRouter()
  const url = CONSTANT.BASE_URL + "admin/account/auth"

  return {
    /** callback: `${session.redirect_url_twitter}?status=${result.status}message=${result.message}` */
    twitterAuth: (params: SocmedAdminAuthParams) => {
      const redirectURL = new URL(url + "/twitter")
      Object.entries(objectUrlEncoder(params, true)).forEach(([label,value]) => redirectURL.searchParams.set(label, value))
      
      router.push(redirectURL.href)
    },
    discordAuth: (params: SocmedAdminAuthParams) => {
      const redirectURL = new URL(url + "/discord")
      Object.entries(objectUrlEncoder(params, true)).forEach(([label,value]) => redirectURL.searchParams.set(label, value))
      
      router.push(redirectURL.href)
    },
    discordBotAuth: (params: SocmedAdminAuthParams) => {
      const redirectURL = new URL(url + "/discord/bot")
      Object.entries(objectUrlEncoder(params, true)).forEach(([label,value]) => redirectURL.searchParams.set(label, value))
      
      router.push(redirectURL.href)
    },
    telegramAuth: () => `https://t.me/${CONSTANT.TELEGRAM_BOT}?startgroup=true`
  }
}

export default useSocmedAdminAuthService