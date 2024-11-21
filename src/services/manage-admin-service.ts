import { IGetManageAdminRequest, IGetManageAdminResponse, IManageAdminConfirmRequest, IManageAdminInviteRequest, IManageAdminInviterRequest, IManageAdminInviterResponse } from "@/types/service-types"
import useFrontendInstance from "./instance"
import { RawAxiosRequestHeaders } from "axios"

const useManageAdmin = () => {
  const instance = useFrontendInstance("admin/account/manage-admin")

  return {
    getManageAdmin: (params: IGetManageAdminRequest, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<IGetManageAdminResponse>>>("/get", {params, headers}),
    inviteByEmail: (payload: IManageAdminInviteRequest, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>("/invite", payload, {headers}),
    confirmByEmail: (payload: IManageAdminConfirmRequest, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>("/confirm", payload, {headers}),
    getInviter: (params: IManageAdminInviterRequest, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<IManageAdminInviterResponse>>('/inviter/get', {params, headers}),
  }
}

export default useManageAdmin