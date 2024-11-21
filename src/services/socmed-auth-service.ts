import { SocmedAuthParams, TelegramAuthRequest } from "@/types/service-types"
import useFrontendInstance from "./instance"
import { objectUrlEncoder } from "@/helper"
import { useRouter } from "next/navigation"
import CONSTANT from "@/Constant"
import { RawAxiosRequestHeaders } from "axios"

const useSocmedAuthService = () => {
  const router = useRouter()
  const url = CONSTANT.BASE_URL + "account/auth"
  const instance = useFrontendInstance("account/auth")

  return {
    /** callback: `${session.redirect_url_twitter}?status=${result.status}message=${result.message}` */
    twitterAuth: (params: SocmedAuthParams) => {
      const redirectURL = new URL(url + "/twitter")
      Object.entries(objectUrlEncoder(params, true)).forEach(([label,value]) => redirectURL.searchParams.set(label, value))
      
      router.push(redirectURL.href)
    },
    discordAuth: (params: SocmedAuthParams) => {
      const redirectURL = new URL(url + "/discord")
      Object.entries(objectUrlEncoder(params, true)).forEach(([label,value]) => redirectURL.searchParams.set(label, value))
      
      router.push(redirectURL.href)
    },
    telegramAuth: (payload: TUser, headers?: RawAxiosRequestHeaders) => instance.post("/telegram", payload, {headers})
  }
}

export default useSocmedAuthService