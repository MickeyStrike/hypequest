import { IGetProfile, LoginPayload, LoginResponse } from "@/types/service-types"
import useFrontendInstance from "./instance"
import { AxiosHeaders, RawAxiosRequestHeaders } from "axios"

const useAuthService = () => {
  const instance = useFrontendInstance()

  return {
    login: (payload: LoginPayload) => instance.post<ResponseAPI<LoginResponse>>("/login", payload),
    getProfile: (headers?: RawAxiosRequestHeaders | AxiosHeaders) => instance.get<ResponseAPI<IGetProfile>>("/account/profile/get", {headers})
  }
}

export default useAuthService