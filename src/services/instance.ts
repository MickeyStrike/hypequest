import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { defaultPath } from "@/helper/route-path"
import { useGlobalContext } from "@/providers/stores";
import CONSTANT from "@/Constant";
import { useEffect } from "react";
import { useDisconnect } from "wagmi";

const useFrontendInstance = (prefix?: string, token?: string) => {
  const {state, dispatch} = useGlobalContext()
  const disconnect = useDisconnect()
  const router = useRouter()

  const instance = axios.create({
    baseURL: CONSTANT.BASE_URL + (prefix ?? ""),
    headers: {
      Authorization: (token ?? state.token) ? 'Bearer ' + (token ?? state.token) : false
    }
  })

  instance.interceptors.request.use((config) => {
    return config
  })
  instance.interceptors.response.use(undefined, (err: AxiosError<ResponseAPI<undefined>>) => {
    if(err.response?.status === 401 && err.response?.data?.message?.toLowerCase() === "Session has expired".toLowerCase()) {
      dispatch({
        token: undefined,
        profile: undefined
      })
      disconnect.disconnect()
    }
    // if(err.response?.status === 401) {
    //   dispatch({token: undefined})
    //   router.push(defaultPath)
    // }

    return Promise.reject(err);
  })

  return instance
}

export default useFrontendInstance