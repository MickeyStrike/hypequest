import { IAvatarSetRequest, IEmailSetRequest, IEmailVerifyRequest, INameSetRequest } from "@/types/service-types"
import useFrontendInstance from "./instance"
import { RawAxiosRequestHeaders } from "axios"

const useProfileService = () => {
  const instance = useFrontendInstance("account/profile")

  return {
    setAvatar: (payload: IAvatarSetRequest, headers?: RawAxiosRequestHeaders) => instance.postForm<ResponseAPI<null>>("/avatar/set", payload, {headers}),
    setName: (payload: INameSetRequest, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<null>>("/name/set", payload, {headers}),
    setEmail: (payload: IEmailSetRequest, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<null>>("/email/set", payload, {headers}),
    verifiedEmail: (payload: IEmailVerifyRequest, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<null>>("/email/verified", payload, {headers}),
  }
}

export default useProfileService