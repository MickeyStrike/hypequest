import { ICreateMarketplace, IDetailMarketplace, IGetMarketplace, IGetMarketplacePagination, IMarketplace, IMarketplaceWithoutPagination, IUpdateMarketplace } from "@/types/service-types"
import useFrontendInstance from "./instance"
import { RawAxiosRequestHeaders } from "axios"

const useMarketplaceService = () => {
  const instance = useFrontendInstance("admin/account/marketplace")

  return {
    getAllMarketplaces: (params: IGetMarketplace, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<IMarketplaceWithoutPagination>>("/getall/withoutpagination", {params, headers}),
    getMarketplaces: (params: IGetMarketplacePagination, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<PaginationResponseWrapper<IMarketplace>>>("/getall", {params, headers}),
    getDetailMarketplace: (params: IDetailMarketplace, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<IMarketplace>>("/detail", {params, headers}),
    createMarketplace: (payload: ICreateMarketplace, headers?: RawAxiosRequestHeaders) => instance.postForm<ResponseAPI<IMarketplace>>("/create", payload, {headers}),
    updateMarketplace: (payload: IUpdateMarketplace, headers?: RawAxiosRequestHeaders) => instance.postForm<ResponseAPI<IMarketplace>>("/update", payload, {headers}),
  }
}

export default useMarketplaceService