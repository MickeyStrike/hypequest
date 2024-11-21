import { IActivateZealyAdmin, IAuthAdminDiscord, IAuthAdminTelegram, IChainSupportResponse, IClient, IClientStage, ICreateClient, ICreateClientStage, IDetailClientProject, IUpdateClient, IUpdateClientStage, IUsernameClientChecker } from "@/types/service-types"
import useFrontendInstance from "./instance"
import { RawAxiosRequestHeaders } from "axios"

const useClientService = () => {
  const instance = useFrontendInstance("admin/account")

  return {
    usernameChecker: (params: IUsernameClientChecker, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<boolean>>("/client/checker/username",{params, headers}),
    getAllClients: (headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<IClient>>>("/client/getall/withoutpagination", {headers}),
    getClients: (params: PaginationRequest, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<PaginationResponseWrapper<IClient>>>("/client/getall", {params, headers}),
    getClientDetail: (params: IDetailClientProject, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<IClient>>("/client/detail", {params, headers}),
    getChains: (headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<{label: string, value: string | number}>>>("/client/getchains", {headers}),
    createClient: (payload: ICreateClient, headers?: RawAxiosRequestHeaders) => instance.postForm<ResponseAPI<IClient>>("/client/create", payload, {headers}),
    updateClient: (payload: IUpdateClient, headers?: RawAxiosRequestHeaders) => instance.postForm<ResponseAPI<IClient>>("/client/update", payload, {headers}),
    createStageClient: (payload: ICreateClientStage, headers?: RawAxiosRequestHeaders) => instance.postForm<ResponseAPI<IClientStage>>("/client/stage/create", payload, {headers}),
    updateStageClient: (payload: IUpdateClientStage, headers?: RawAxiosRequestHeaders) => instance.postForm<ResponseAPI<IClientStage>>("/client/stage/update", payload, {headers}),
    telegramAuth: (payload: IAuthAdminTelegram, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<IClient>>('auth/telegram', payload, {headers}),
    discordAuth: (payload: IAuthAdminDiscord, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<IClient>>('auth/discord', payload, {headers}),
    activateZealyAdmin: (payload: IActivateZealyAdmin, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<IClient>>('/client/zealy/activate', payload, {headers}),
    getContractChainSupport: (headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<IChainSupportResponse>>>("/client/stage/chain/support",{headers})
  }
}

export default useClientService