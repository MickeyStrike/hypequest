import { Metadata, NextPage, ResolvingMetadata } from "next";
import ProjectComponentPage from "@/components/pages/project-page";
import CONSTANT from "@/Constant";
import { IPublicClientResponse, MetaOGEnum } from "@/types/service-types";
import dataListChain from '@/localeData/list_chains.json'

interface MetadataProps {
  params: { project: string };
  searchParams: {
    type?: MetaOGEnum;
    userId?: string;
    luckyWheelId?: string;
  }
}
// api/og/[username]/[type]/[userId]/[luckyWheelId]
export const generateMetadata = async (
  { params, searchParams }: MetadataProps,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  const res = await fetch(CONSTANT.BASE_URL + `project/${params.project}/get`)
  const imageOg = `/api/og/${params.project}/${searchParams.type ?? "null"}/${searchParams.userId ?? "null"}/${searchParams.luckyWheelId ?? "null"}`

  if(!res.ok) return {
    openGraph: {
      images: imageOg
    },
    twitter: {
      images: imageOg
    },
  }
  else {
    const json = await res.json() as ResponseAPI<IPublicClientResponse | null>
    let networks: Array<string> = []

    json.data?.chains.forEach(chain => {
      const finder = dataListChain.find(lc => lc.chain_id === chain)
      if(finder) networks.push(finder.chain_name)
    })

    const networksLabel = networks.join(", ").replace(/, ([^,]*)$/, " and $1")

    return {
      title: `${json.data?.name} Quest: Explore ${networksLabel} Rewards on HypeQuest`,
      description: `Discover ${json.data?.name} on HypeQuest U+002d a revolutionary platform on the ${networksLabel}. Engage with innovation and collaborative rewards through our gamified system. Join the quest for ${json.data?.accumulatedPoints?.total_point ?? 0} on HypeQuest!`,
      keywords: [json.data?.name ?? "-"].concat(networks).concat(CONSTANT.DEFAULT_KEYWORDS),
      openGraph: {
        title: json.data?.name,
        description: json.data?.description,
        images: imageOg
      },
      twitter: {
        site: json.data?.twitter?.username ? `https://twitter.com/${json.data?.twitter?.username}` : undefined,
        creator: json.data?.twitter?.username,
        description: json.data?.description,
        title: json.data?.name,
        images: imageOg
      },
    }
  }
}

const getClientProject = async (username: string): Promise<ResponseAPI<IPublicClientResponse | null>> => {
  const res = await fetch(CONSTANT.BASE_URL + `project/${username}/get`)

  if (!res.ok) return {
    data: null,
    statusCode: 400,
    message: "Failed to fetch data"
  }

  return res.json()
}

const ProjectPage: NextPage<MetadataProps> = async ({ params: { project } }) => {
  const clientProject = await getClientProject(project)
  
  return <ProjectComponentPage project={project} clientProject={clientProject?.data} />
}

export default ProjectPage