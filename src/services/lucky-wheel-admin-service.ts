import { CreateLuckyWheelRequest, GetAllLuckyWheel, GetDetailLuckyWheel, IActivateLuckyWheelOrSocialRaid, IClient, ICreateConvertionConsumptionSpin, ILuckyWheel, IUpdateActivateFreeSpin, UpdateLuckyWheelRequest } from "@/types/service-types"
import useFrontendInstance from "./instance"
import { RawAxiosRequestHeaders } from "axios"

const useLuckyWheelService = () => {
  const instance = useFrontendInstance("admin/account/luckywheel")

  return {
    getAllLuckyWheel: (params: GetAllLuckyWheel, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<ILuckyWheel>>>("/getall", {params, headers}),
    getDetailLuckyWheel: (params: GetDetailLuckyWheel, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<ILuckyWheel>>("/getdetail", {params, headers}),
    createLuckyWheel: (payload: CreateLuckyWheelRequest, headers?: RawAxiosRequestHeaders) => instance.postForm<ResponseAPI<ILuckyWheel>>("/create", payload, {headers}),
    updateLuckyWheel: (payload: UpdateLuckyWheelRequest, headers?: RawAxiosRequestHeaders) => instance.postForm<ResponseAPI<ILuckyWheel>>("/update", payload, {headers}),
    activateLuckyWheel: (payload: IActivateLuckyWheelOrSocialRaid, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>("/activate", payload, {headers}),
    updateConvertionSpin: (payload: ICreateConvertionConsumptionSpin, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<IClient>>("/updateconvertionspin", payload, {headers}),
    activateFreeSpin: (payload: IUpdateActivateFreeSpin, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<IClient>>("/activatefreespin", payload, {headers}),
  }
}

export default useLuckyWheelService