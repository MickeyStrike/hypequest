import { NextPage } from "next";
import PublicMarketplaceProjectPage from "@/components/pages/public-marketplace-project-page"
import CONSTANT from "@/Constant";
import { IPublicClientResponse } from "@/types/service-types";

const getClientProject = async (username: string): Promise<ResponseAPI<IPublicClientResponse | null>> => {
  const res = await fetch(CONSTANT.BASE_URL + `project/${username}/get`)

  if (!res.ok) return {
    data: null,
    statusCode: 400,
    message: "Failed to fetch data"
  }

  return res.json()
}

const PublicMarketplacePage: NextPage<{ params: { project: string } }> = async ({ params: { project } }) => {
  const clientProject = await getClientProject(project)

  return <PublicMarketplaceProjectPage project={project}  clientProject={clientProject?.data} />
}

export default PublicMarketplacePage