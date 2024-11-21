import { NextPage } from "next";
import GlobalQuestsPage from "@/components/pages/public-quest-page";

const GlobalQuests: NextPage<{ params: { project: string }, searchParams: Record<string, any> }> = (props) => {
  return (
    <GlobalQuestsPage project={props.params.project} />
  )
}

export default GlobalQuests