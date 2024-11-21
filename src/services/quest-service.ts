import { ICreateMission, ICreateQuestboard, IDetailClientProject, IDetailMission, IDetailQuestboard, IGetAllSingleMission, IGetDetailQuestboard, IGetDiscordRolesRequest, IGetDiscordRolesResponse, IGetQuestboardsRequest, IGetSingleMissionDetail, IMission, IMissionRequest, IQuestboard, IUpdateMission, IUpdateQuestboard, IUpdateQuestboardThumbnail, MissionTypesEnum } from "@/types/service-types"
import useFrontendInstance from "./instance"
import { RawAxiosRequestHeaders } from "axios"

const useQuestService = () => {
  const instance = useFrontendInstance("admin/account/quest")

  return {
    getAllQuestboard: (params: IGetQuestboardsRequest, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<PaginationResponseWrapper<IQuestboard>>>("/questboard/getall", {params, headers}),
    getDetailQuestboard: (params: IGetDetailQuestboard, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<IDetailQuestboard>>("/questboard/detail", {params, headers}),
    getAllMission: (params: IMissionRequest, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<PaginationResponseWrapper<IMission>>>("/mission/getall", {params, headers}),
    createQuestboard: (payload: ICreateQuestboard, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<ICreateQuestboard>>("/questboard/create", payload, {headers}),
    updateQuestboard: (payload: IUpdateQuestboard, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<ICreateQuestboard>>("/questboard/update", payload, {headers}),
    updateThumbnailQuestboard: (payload: IUpdateQuestboardThumbnail, headers?: RawAxiosRequestHeaders) => instance.postForm<ResponseAPI<ICreateQuestboard>>("/questboard/thumbnailupdate", payload, {headers}),
    checkIsAlreadyConnect: (params: IDetailClientProject, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<MissionTypesEnum>>>("mission/checkisalreadyconnect",{params, headers}),
    createMission: (payload: ICreateMission, headers?: RawAxiosRequestHeaders) => instance.postForm<ResponseAPI<IMission>>("/questboard/mission/create", payload, {headers}),
    updateMission: (payload: IUpdateMission, headers?: RawAxiosRequestHeaders) => instance.postForm<ResponseAPI<IMission>>("/questboard/mission/update", payload, {headers}),
    getAllSingleMission: (params: IGetAllSingleMission, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<PaginationResponseWrapper<IMission>>>("/mission/single/getall", {params, headers}),
    getSingleMissionDetail: (params: IGetSingleMissionDetail, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<IMission>>("/mission/single/detail", {params, headers}),
    deleteMission: (payload: IDetailMission, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<IMission>>("/questboard/mission/delete", payload, {headers}),
    getDiscordRoles: (params: IGetDiscordRolesRequest, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<IGetDiscordRolesResponse>>>("/mission/discord/getroles", {params, headers}),
  }
}

export default useQuestService