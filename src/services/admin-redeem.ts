import { IApprovalRedeemListRequest, IGetRedeemListRequest, IGetRedeemListResponse } from "@/types/service-types"
import useFrontendInstance from "./instance"
import { RawAxiosRequestHeaders } from "axios"

const useAdminRedeemService = () => {
  const instance = useFrontendInstance("admin/account/redeem")

  return {
    getRedeemList: (params: IGetRedeemListRequest, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<PaginationResponseWrapper<IGetRedeemListResponse>>>("/get", {params, headers}),
    approvalRedeem: (payload: IApprovalRedeemListRequest, headers?: RawAxiosRequestHeaders) => instance.postForm('/approve', payload, {headers}),
    updateRedeem: (payload: IApprovalRedeemListRequest, headers?: RawAxiosRequestHeaders) => instance.postForm('/update', payload, {headers}),
    rejectRedeem: (payload: Pick<IApprovalRedeemListRequest, "username" | "inventoryId" | "note">, headers?: RawAxiosRequestHeaders) => instance.post('/reject', payload, {headers})
  }
}

export default useAdminRedeemService