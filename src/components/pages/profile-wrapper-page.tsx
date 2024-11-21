"use client"
import MilestoneAndRewardsPage from "@/components/pages/milestone-and-rewards-page";
import ProfileComponentPage from "@/components/pages/profile-page";
import RedeemedListAdminPage from "@/components/pages/redeemed-list-admin-page";
import SettingComponentPage from "@/components/pages/setting-page";
import { InnerWrapper, OuterWrapper } from "@/components/reusables";
import { ThemeSelect, ThemeTabs } from "@/components/reusables/NextuiTheme";
import { addSearchParams, useDebounce, useMinimizedState } from "@/helper";
import { profilePath } from "@/helper/route-path";
import { AlertModalType, useModal } from "@/providers/modal";
import { useGlobalContext } from "@/providers/stores";
import useClientService from "@/services/client-service";
import { ActiveTabEnum, IClient } from "@/types/service-types";
import { SelectItem, Tab } from "@nextui-org/react";
import { NextPage } from "next";
import { Manrope } from "next/font/google";
import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})

interface InitState {
  clientProjects: Array<IClient>;
  selectedClientId?: string;
}

const ProfileWrapperPage: FC<{searchParams: { tab?: ActiveTabEnum; username?: string }}> = (props) => {
  const activeTab = props.searchParams.tab ?? ActiveTabEnum.PROFILE
  const router = useRouter()
  const openModal = useModal()
  const { getAllClients } = useClientService()
  const { state: { token } } = useGlobalContext()
  const [state, dispatch] = useMinimizedState<InitState>({
    clientProjects: []
  })

  useDebounce<[string, string | undefined]>((t, username)=>{
    if(t) getAllClients({Authorization: "Bearer " + t})
      .then(res => {
        dispatch({clientProjects: res.data.data})

        if(!username) dispatch({selectedClientId: res.data.data[0]?._id})
      })
      .catch(err => console.log(err))
  }, [token, props.searchParams.username], 400)

  useEffect(()=>{
    if(state.clientProjects.length > 0 && props.searchParams.username) {
      const finder = state.clientProjects.find(cp => cp.username === props.searchParams.username)
      dispatch({ selectedClientId: finder?._id })
      if (!finder?._id) {
        openModal({
          type: AlertModalType.WARNING,
          title: "Warning",
          description: "Project not found, select a project first or please re-login.",
          okButtonProps: {
            children: "Ok",
            color: "warning"
          }
        })
        router.push('/project-signup')
      }
    }
  }, [state.clientProjects, props.searchParams.username])

  const conditionalRenderer = () => {
    if(activeTab === ActiveTabEnum.PROFILE) return (
      <ProfileComponentPage 
        clientProject={state.clientProjects.find(cp => cp._id === state.selectedClientId)} 
        onUpdated={(cp) => {
          dispatch({clientProjects: state.clientProjects.map(scp => {
            if(scp._id === cp._id) return cp
            else return scp
          })})
        }}
      />
    )
    else if(activeTab === ActiveTabEnum.SETTING) return (
      <SettingComponentPage 
        clientProject={state.clientProjects.find(cp => cp._id === state.selectedClientId)} 
        onUpdated={(cp) => {
          dispatch({clientProjects: state.clientProjects.map(scp => {
            if(scp._id === cp._id) return cp
            else return scp
          })})
        }}
      />
    )
    else if(activeTab === ActiveTabEnum.MILESTONE_AND_REWARDS) return (
      <MilestoneAndRewardsPage 
        clientProject={state.clientProjects.find(cp => cp._id === state.selectedClientId)} 
        onUpdated={(cp) => {
          dispatch({clientProjects: state.clientProjects.map(scp => {
            if(scp._id === cp._id) return cp
            else return scp
          })})
        }}
      />
    )
    else if(activeTab === ActiveTabEnum.REDEEMED_LIST) return (
      <RedeemedListAdminPage clientProject={state.clientProjects.find(cp => cp._id === state.selectedClientId)} />
    )
    else return null
  }
  
  return (
    <OuterWrapper>
      <InnerWrapper className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <ThemeSelect
            items={state.clientProjects}
            placeholder="Select Project"
            className="lg:w-[400px]"
            size="sm"
            selectedKeys={state.selectedClientId ? new Set([state.selectedClientId]) : undefined}
            onSelectionChange={(selections) => {
              if(selections instanceof Set) {
                const value = selections.values()
                const finalValue = value.next().value
                if(typeof finalValue === "string") {
                  dispatch({selectedClientId: finalValue})

                  const clientFinder = state.clientProjects.find(cp => cp._id === finalValue)
                  router.push(addSearchParams(profilePath, {tab: props.searchParams.tab, username: clientFinder?.username}))
                }
              }
            }}
          >
            {item => {
              const c = item as IClient
              return <SelectItem key={c._id!!} value={c._id!!}>{c.name}</SelectItem>
            }}
          </ThemeSelect>
          <ThemeTabs 
            size="lg"
            selectedKey={activeTab}
            onSelectionChange={(key) => router.push(addSearchParams(profilePath, {tab: key as ActiveTabEnum, username: props.searchParams.username}))}
          >
            <Tab key={ActiveTabEnum.PROFILE} title="My Profile" />
            <Tab key={ActiveTabEnum.MILESTONE_AND_REWARDS} title="Milestone & Rewards" />
            <Tab key={ActiveTabEnum.SETTING} title="Engagement Boost" />
            <Tab key={ActiveTabEnum.REDEEMED_LIST} title="Redemption" />
          </ThemeTabs>
        </div>
        {conditionalRenderer()}
      </InnerWrapper>
    </OuterWrapper>
  )
}

export default ProfileWrapperPage