import { IActivateLuckyWheelOrSocialRaid, IGetAdminSocialRaids, ISocialRaid, ISocialRaidPayload } from "@/types/service-types"
import useFrontendInstance from "./instance"

const useSocialRaidAdminService = () => {
  const instance = useFrontendInstance("admin/account/socialraid")

  return {
    createSocialRaids: (payload: Array<ISocialRaidPayload>) => instance.post<ResponseAPI<Array<ISocialRaidPayload>>>("/createorupdate",payload),
    getAllSocialRaids: (params: IGetAdminSocialRaids) => instance.get<ResponseAPI<Array<ISocialRaid>>>("/getall", {params}),
    activateSocialRaid: (payload: IActivateLuckyWheelOrSocialRaid) => instance.post<ResponseAPI<boolean>>("/activate", payload)
  }
}

export default useSocialRaidAdminService