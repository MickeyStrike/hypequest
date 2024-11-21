import { NextPage } from "next";
import QuestboardAdminPage from "@/components/pages/questboard-admin";

const QuestboardPage: NextPage<{ params: { username: string } }> = (props) => {
  return (
    <QuestboardAdminPage {...props} />
  )
}

export default QuestboardPage