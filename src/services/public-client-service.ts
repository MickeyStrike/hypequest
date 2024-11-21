import { IGetQuesterAvatarRequest, IGetSocialRaidTweetMission, IGetXpRewardMissionRequest, IGetXpRewardMissionResponse, ILastMissionRequest, ILastMissionResponse, IMarketplaceDetail, IMarketplaceGetDetail, IMarketplacePublicGet, IPublicClientResponse } from "@/types/service-types"
import useFrontendInstance from "./instance"
import { RawAxiosRequestHeaders } from "axios"

const usePublicClientService = () => {
  const instance = useFrontendInstance("project")

  return {
    getProjectByUsername: (username: string, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<IPublicClientResponse>>(`/${username}/get`, {headers}),
    marketplaceGetAll: (username: string, params: PaginationRequest, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<IMarketplacePublicGet>, PaginationResponse>>(`/${username}/marketplace/get`, {params, headers}),
    marketplaceGetDetail: (username: string, params: IMarketplaceGetDetail, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<IMarketplaceDetail>>(`/${username}/marketplace/detail`, {params, headers}),
    getLastMission: (username: string, params: ILastMissionRequest, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<ILastMissionResponse>>(`/${username}/mission/last/get`, {params, headers}),
    getXpRewardMissions: (username: string, params: IGetXpRewardMissionRequest, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<PaginationResponseWrapper<IGetXpRewardMissionResponse>>>(`${username}/mission/xpreward/get`,{params,headers}),
    getQuesterAvatars: (username: string, params: IGetQuesterAvatarRequest, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<PaginationResponseWrapper<string>>>(`/${username}/mission/quester/get`, {params, headers}),
  }
}

export default usePublicClientService