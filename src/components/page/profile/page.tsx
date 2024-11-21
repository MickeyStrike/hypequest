import ProfileWrapperPage from "@/components/pages/profile-wrapper-page";
import { ActiveTabEnum } from "@/types/service-types";
import { NextPage } from "next";

const ProfilePage: NextPage<{searchParams: { tab?: ActiveTabEnum; username?: string }}> = (props) => {
  return (
    <ProfileWrapperPage {...props} />
  )
}

export default ProfilePage