import { GetHistoryResponse, GetLeaderboardParams, GetLeaderboardResponse, GetLuckyWheelUser, GetPublicMission, IConvertSpinRequest, IGetSpinResult, IGetUserInfo, IInventoryGet, IInventoryRedeemRequest, IMarketplaceRedeemRequest, MetaLeaderboardResponse, GetUserInfoParams } from "@/types/service-types"
import useFrontendInstance from "./instance"
import { RawAxiosRequestHeaders } from "axios"

const usePublicService = () => {
  const instance = useFrontendInstance("account/project")

  return {
    getLeaderboard: (username: string, params: GetLeaderboardParams, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<GetLeaderboardResponse>, MetaLeaderboardResponse>>(`/${username}/leaderboard`, {params, headers}),
    getHistory: (username: string, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<GetHistoryResponse>>>(`/${username}/history`, {headers}),
    getAllMission: (username: string, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<GetPublicMission>>>(`/${username}/mission/getall`, {headers}),
    inventoryGet: (username: string, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<IInventoryGet>>>(`/${username}/inventory/get`, {headers}),
    inventoryRedeem: (username: string, payload: IInventoryRedeemRequest, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<null>>(`/${username}/inventory/redeem`, payload, {headers}),
    marketplaceRedeem: (username: string, payload: IMarketplaceRedeemRequest, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<null>>(`/${username}/marketplace/redeem`, payload, {headers}),
    getLuckyWheels: (username: string, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<GetLuckyWheelUser>>(`/${username}/luckywheel/get`, {headers}),
    luckyWheelConvertSpin: (username: string, payload: IConvertSpinRequest, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<null>>(`/${username}/luckywheel/convertspin`, payload, {headers}),
    luckyWheelSpin: (username: string, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<IGetSpinResult>>(`/${username}/luckywheel/spin`, {headers}),
    getUserInfo: (username: string, headers?: RawAxiosRequestHeaders, params?: GetUserInfoParams) => instance.get<ResponseAPI<IGetUserInfo>>(`/${username}/user/info`, {headers, params})
  }
}

export default usePublicService