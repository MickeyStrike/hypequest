"use client"
import { FC, Fragment, ReactNode, useEffect, useMemo } from "react";
import { ThemeAvatar, ThemeButton, ThemeDivider, ThemeModal, ThemeModalBody, ThemeModalHeader } from "./NextuiTheme";
import { ModalBody, ModalContent, ModalFooter, ModalHeader, UseDisclosureProps, useDisclosure } from "@nextui-org/react";
import { DM_Sans, Manrope, Montserrat, Poppins } from "@next/font/google"
import { useGlobalContext } from "@/providers/stores";
import { AcceptIcon, ConnectIllustrationIcon, ConnectWalletIcon, DiscordConnectIcon, MainXpSmallIcon, OldTwitterIcon, TelegramConnectIcon, WelcomeXPIcon, ZealySmallIcon } from "../assets/icons";
import { CustomContentSuccessTaskModal, CustomMilestoneRewardIcon, TelegramAuth } from ".";
import { addSearchParams, loginTelegram, middleEllipsisText, numFormatter, useDebounce, useMinimizedState } from "@/helper";
import CONSTANT from "@/Constant";
import { GetPublicMission, IPublicClientResponse, MissionTypesEnum, StageRewardTypeEnum } from "@/types/service-types";
import useSocmedAuthService from "@/services/socmed-auth-service";
import { useSearchParams } from "next/navigation";
import useSocmedMissionService from "@/services/socmed-mission-service";
import { AlertModalType, useModal } from "@/providers/modal";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import coinsBackground from "@/components/assets/images/coins.png"
import NextImage from "next/image"

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope600 = Manrope({weight: "600", subsets: ["latin"]})
const poppins400 = Poppins({weight: "400", subsets: ["latin"]})
const montserrat200 = Montserrat({weight: "200", subsets: ["latin"]})
const montserrat800 = Montserrat({weight: "800", subsets: ["latin"]})

interface AvailableMission {
  icon: ReactNode;
  label: ReactNode;
  xp: number;
  rewardType?: StageRewardTypeEnum;
  isCompleted: boolean;
  onClick?: () => void;
}

export interface ConnectHypequestPublicModalInterface extends UseDisclosureProps {
  platformConnectMissions: Array<GetPublicMission>;
  project: string;
  onCallback?: () => void;
  clientProject?: IPublicClientResponse | null;
  referralLink: string;
  shareLink: (anotherParams?: Record<string, any>) => Promise<void>
}

const ConnectHypequestPublicModal: FC<ConnectHypequestPublicModalInterface> = (props) => {
  const params = useSearchParams()
  const openModal = useModal()
  const authType = params.get("auth_type")
  const { state: { isLight, token } } = useGlobalContext()
  const { twitterAuth, discordAuth, telegramAuth } = useSocmedAuthService()
  const { connectDiscord, connectTelegram, connectTwitter, walletConnect, dailyCheckin } = useSocmedMissionService()
  const [state, dispatch] = useMinimizedState({
    origin: ""
  })
  const { onOpen, isOpen, onOpenChange } = useDisclosure(props)

  const tFinder = props.platformConnectMissions.find(mission => mission.type === MissionTypesEnum.CONNECT_TWITTER)
  const dFinder = props.platformConnectMissions.find(mission => mission.type === MissionTypesEnum.CONNECT_DISCORD)
  const connectWalletFinder = props.platformConnectMissions.find(mission => mission.type === MissionTypesEnum.CONNECT_WALLET)
  const connectTelegramFinder = props.platformConnectMissions.find(mission => mission.type === MissionTypesEnum.CONNECT_TELEGRAM)
  const dailyCheckinFinder = props.platformConnectMissions.find(mission => mission.type === MissionTypesEnum.DAILY_CHECKIN)
  const referralFinder = props.platformConnectMissions.find(mission => mission.type === MissionTypesEnum.REFERRAL)

  useEffect(()=>{
    dispatch({origin: window.location.href})
  }, [])

  useDebounce<[string | null, string | undefined, boolean | undefined, string]>((at, id, is_claimed, t)=>{
    if(at === "twitter" && t && id && is_claimed === false) {
      connectTwitter(props.project, {missionId: id}, {Authorization: "Bearer " + t})
        .then(() => console.log('OK'))
        .catch(err => console.log(err))
        .finally(()=>{
          if(props.onCallback) props.onCallback()
        })
    }
  }, [authType, tFinder?.id, tFinder?.is_claimed, token])

  useDebounce<[string | null, string | undefined, boolean | undefined, string]>((at, id, is_claimed, t)=>{
    if(at === "discord" && t && id && is_claimed === false) {
      connectDiscord(props.project, {missionId: id}, {Authorization: "Bearer " + t})
        .then(() => console.log('OK'))
        .catch(err => console.log(err))
        .finally(()=>{
          if(props.onCallback) props.onCallback()
        })
    }
  }, [authType, dFinder?.id, dFinder?.is_claimed, token])

  useDebounce<[string | undefined, boolean | undefined, string]>((id, is_claimed, t)=>{
    if(t && id && is_claimed === false) {
      walletConnect(props.project, {missionId: id}, {Authorization: "Bearer " + t})
        .then(() => console.log('OK'))
        .catch(err => console.log(err))
        .finally(()=>{
          if(props.onCallback) props.onCallback()
        })
    }
  }, [connectWalletFinder?.id, connectWalletFinder?.is_claimed, token], 400)

  useDebounce<[string | undefined, boolean | undefined, string]>((id, is_claimed, t)=>{
    if(t && id && is_claimed === false) {
      dailyCheckin(props.project, {missionId: id}, {Authorization: "Bearer " + t})
        .then(() => console.log('OK'))
        .catch(err => console.log(err))
        .finally(()=>{
          if(props.onCallback) props.onCallback()
        })
    }
  }, [dailyCheckinFinder?.id, dailyCheckinFinder?.is_claimed, token], 400)

  const onAuthCallbackHandler = async (user: TUser) => {
    telegramAuth(user)
      .then(()=>{
        if(connectTelegramFinder) connectTelegram(props.project, {missionId: connectTelegramFinder.id})
          .then(() => openModal({
            type: AlertModalType.SUCCESS,
            size: "2xl",
            customContent: (onOk, onCancel) => (
              <CustomContentSuccessTaskModal 
                clientProject={props.clientProject}
                referralLink={props.referralLink}
                shareLink={props.shareLink}
                referralFinder={referralFinder}
                selectedTask={connectTelegramFinder}
              />
            )
          }))
          .catch(err => console.log(err))
          .finally(()=>{
            if(props.onCallback) props.onCallback()
          })
        else {
          if(props.onCallback) props.onCallback()
        }
      })
      .catch(err => console.log(err))
  }

  const socmeds = () => {
    const availableMission: Array<AvailableMission> = []

    if(connectWalletFinder) availableMission.push({
      icon: <ConnectWalletIcon />,
      label: connectWalletFinder?.data?.label ?? "Connect Wallet",
      xp: connectWalletFinder.data?.rewardType === StageRewardTypeEnum.XP ? connectWalletFinder.point_reward : connectWalletFinder.usdt_reward,
      rewardType: connectWalletFinder.data?.rewardType,
      isCompleted: connectWalletFinder.is_claimed
    })

    if(tFinder) availableMission.push({
      icon: <OldTwitterIcon />,
      label: tFinder?.data?.label ?? "Connect Twitter",
      xp: tFinder.data?.rewardType === StageRewardTypeEnum.XP ? tFinder.point_reward : tFinder.usdt_reward,
      rewardType: tFinder.data?.rewardType,
      isCompleted: tFinder.is_claimed,
      onClick: () => {
        if(!tFinder.is_claimed) {
          if(token) twitterAuth({redirect_url: state.origin, authorization: "Bearer " + token})
          else openModal({
            type: AlertModalType.WARNING,
            title: "Warning",
            description: "Required to log in!"
          })
        }
        else openModal({
          type: AlertModalType.WARNING,
          title: "Warning",
          description: "Already claimed!"
        })
      }
    })
    
    if(dFinder) availableMission.push({
      icon: <DiscordConnectIcon />,
      label: dFinder?.data?.label ?? "Connect Discord",
      xp: dFinder.data?.rewardType === StageRewardTypeEnum.XP ? dFinder.point_reward : dFinder.usdt_reward,
      rewardType: dFinder.data?.rewardType,
      isCompleted: dFinder.is_claimed,
      onClick: () => {
        if(!dFinder.is_claimed) {
          if(token) discordAuth({redirect_url: state.origin, authorization: "Bearer " + token})
          else openModal({
            type: AlertModalType.WARNING,
            title: "Warning",
            description: "Required to log in!"
          })
        }
        else openModal({
          type: AlertModalType.WARNING,
          title: "Warning",
          description: "Already claimed!"
        })
      }
    })
    
    if(connectTelegramFinder) availableMission.push({
      icon: <TelegramConnectIcon />,
      label: connectTelegramFinder?.data?.label ?? "Connect Telegram",
      xp: connectTelegramFinder.data?.rewardType === StageRewardTypeEnum.XP ? connectTelegramFinder.point_reward : connectTelegramFinder.usdt_reward,
      rewardType: connectTelegramFinder.data?.rewardType,
      isCompleted: connectTelegramFinder.is_claimed,
      onClick: () => {
        if(!connectTelegramFinder.is_claimed) {
          loginTelegram((data) => {
            if(data !== false) onAuthCallbackHandler(data)
          })
        }
        else openModal({
          type: AlertModalType.WARNING,
          title: "Warning",
          description: "Already claimed!"
        })
      }
    })

    if(dailyCheckinFinder) availableMission.push({
      icon: <ThemeAvatar src="/hypequest.png" className="bg-black w-[35px] h-[35px] p-0.5" alt="Hypequest_Logo" size="sm" />,
      label: dailyCheckinFinder?.data?.label ?? "Daily Checkin",
      xp: dailyCheckinFinder.data?.rewardType === StageRewardTypeEnum.XP ? dailyCheckinFinder.point_reward : dailyCheckinFinder.usdt_reward,
      rewardType: dailyCheckinFinder.data?.rewardType,
      isCompleted: dailyCheckinFinder.is_claimed,
      onClick: () => {
        if(!dailyCheckinFinder.is_claimed) {
          dailyCheckin(props.project, {missionId: dailyCheckinFinder.id})
            .then(() => {
              openModal({
                type: AlertModalType.SUCCESS,
                size: "2xl",
                customContent: (onOk, onCancel) => (
                  <CustomContentSuccessTaskModal 
                    clientProject={props.clientProject}
                    referralLink={props.referralLink}
                    shareLink={props.shareLink}
                    referralFinder={referralFinder}
                    selectedTask={dailyCheckinFinder}
                  />
                )
              })
              if(props.onCallback) props.onCallback()
            })
            .catch((err: AxiosError<ResponseAPI<null>>) => {
              toast.error(err?.response?.data?.message ?? "Something went wrong!")
            })
        }
        else openModal({
          type: AlertModalType.WARNING,
          title: "Warning",
          description: "Already claimed!"
        })
      }
    })
    // const connectZealyFinder = props.platformConnectMissions.find(m => m.type === MissionTypesEnum.CONNECT_ZEALY)
    // if(connectZealyFinder) availableMission.push({
    //   icon: <ZealySmallIcon width="25" height="25" />,
    //   label: connectZealyFinder.title ?? "Connect Zealy",
    //   xp: connectZealyFinder.point_reward,
    //   rewardType: connectZealyFinder.data?.rewardType,
    //   isCompleted: connectZealyFinder.is_claimed
    // })

    return availableMission
  }

  return (
    <Fragment>
      {state.origin &&
        <TelegramAuth 
          onAuthCallback={onAuthCallbackHandler}
          botName={CONSTANT.TELEGRAM_BOT}
          requestAccess={true}
          usePic={true}
          redirectUrl={state.origin}
          className="hidden"
        />
      }
      <ThemeModal
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
      >
        <ModalContent>
          {(onClose) => 
            <Fragment>
              <ModalHeader/>
              <ModalBody className={`flex flex-col lg:flex-row gap-2 ${isLight ? "text-black" : "text-white"}`}>
                <div className="flex flex-col gap-4">
                  <h1 className={`${manrope800.className} text-3xl lg:text-5xl`}>WIN BIG on Hypequest?</h1>
                  <h3 className={`${manrope600.className} text-xl lg:text-2xl`}>Your limitless rewards just {socmeds().length} Steps away</h3>
                  <div className="flex flex-col gap-2">
                    {socmeds().map((socmed, index) =>
                      <ThemeButton 
                        disabled={socmed.isCompleted} 
                        variant="light" 
                        key={index} 
                        className={`flex flex-row items-center justify-between gap-2 w-full py-2 h-full ${manrope800.className}`}
                        onClick={socmed.onClick}
                      >
                        <div className="flex flex-row items-center gap-2">
                          <ThemeAvatar icon={<span className={socmed.isCompleted ? "text-[#68C766]" : "text-[#A1A1A1]"}><AcceptIcon /></span>} />
                          {socmed.icon}
                          <span>{socmed.label}</span>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                          <span>+{socmed.xp}</span>
                          <CustomMilestoneRewardIcon 
                            width="40"
                            height="40"
                            imgHref={socmed.rewardType === StageRewardTypeEnum.USDT ? "/usdt.png" : "/xp.png"}
                            imgId={"icon_" + socmed.label?.toString().replace(/ /g,"_")}
                            background={socmed.rewardType === StageRewardTypeEnum.USDT ? "green" : "purple"}
                          />
                        </div>
                      </ThemeButton>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-8 min-w-[100px] lg:min-w-[300px]">
                  <div className={`text-white text-center rounded-3xl p-3 bg-black ${poppins400.className}`}>Multiple ways to<br /><span className="text-[#FAC12E]">increase your chances</span><br />to WIN BIG!</div>
                  <ConnectIllustrationIcon />
                </div>
              </ModalBody>
              <ModalFooter />
            </Fragment>
          }
        </ModalContent>
      </ThemeModal>
    </Fragment>
  )
}

export default ConnectHypequestPublicModal