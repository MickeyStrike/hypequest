"use client"
import { AffiliateYellowIcon, AlertIcon, AntdInfoIcon, AntdSuccessIcon, ClockIcon, ConnectIcon, CopyIcon, DiscordIcon, LeaderboardYellowIcon, LinkIcon, LockIcon, LuckyWheelHeader, MainIconProject, MainXp2SmallIcon, MainXpSmallIcon, MarketplaceXP2Icon, MarketplaceXP2SmallIcon, ProfileYellowIcon, QuestionTooltipIcon, RedeemIcon, SocialRaidAcceptedIcon, SocialRaidDeclinedIcon, SpinIcon, TelegramIcon, TwitterXBlackIcon, TwitterXIcon, UploadIcon, XIcon, ZealySmallIcon } from "@/components/assets/icons";
import { ConnectHypequestPublicModal, CountdownCircle, CustomContentSuccessTaskModal, CustomMilestoneRewardIcon, CustomProgressBar, CustomRangePicker, InfoTooltip, Inner2Wrapper, InnerWrapper, InventoryPublicModal, JoinHypequestPublicModal, OuterWrapper, ProjectQuestboardItem, QuestboardDetailProject, SelectedInventoryPublicModal, SpinConvertionPublicModal, SpinRewardPublicModal, VerifyButton, WelcomeHypequestPublicModal } from "@/components/reusables";
import { ThemeAccordion, ThemeAlert, ThemeAlertType, ThemeAvatar, ThemeButton, ThemeCard, ThemeCardBody, ThemeCardHeader, ThemeChip, ThemeDivider, ThemeDropdown, ThemeModal, ThemeModalBody, ThemeModalHeader, ThemePagination, ThemePopover, ThemeSelect, ThemeSpinner, ThemeSwitch, ThemeTable, ThemeTabs, ThemeTooltip } from "@/components/reusables/NextuiTheme";
import { useGlobalContext } from "@/providers/stores";
import { AccordionItem, AvatarGroup, Button, CardBody, DropdownItem, DropdownMenu, DropdownTrigger, ModalContent, PopoverContent, PopoverTrigger, SelectItem, Tab, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { DM_Sans, Manrope, Roboto } from "next/font/google";
import SplashCoin from "@/components/assets/images/splash-coin.png"
import NextImage from "next/image"
import { FC, Fragment, ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { addSearchParams, capitalizeEveryWord, dateFromNow, getSignMessage, getTotalPaginationPage, loginTelegram, middleEllipsisText, nFormatter, numFormatter, redirectToNewPage, smoothScroll, smoothScrollByRef, useDebounce, useMinimizedState, useWindowFocus } from "@/helper";
// import { LuckyWheelItem } from "@/components/reusables/LuckyWheel";
import wheelStyles from "@/styles/components/reusables/LuckyWheel.module.css"
import { ActiveTabKey, CustomQuestboard, GetHistoryResponse, GetLeaderboardResponse, GetPublicMission, IBannerProgressStages, IClientStage, ICreateQuestboard, IFollowTwitterMission, IGetProfile, IGetReferralList, IGetSocialRaidTweetMission, IGetUserInfo, IInventoryGet, ILikeTwitterMission, ILuckyWheel, ILuckyWheelCustom, IManageAdminInviterResponse, IPostTwitterMission, IPublicClientResponse, IRetweetTwitterMission, ISetReferralReturn, LeaderboardTypeEnum, LoginResponse, LuckyWheelTypesEnum, MetaLeaderboardResponse, MetaOGEnum, MissionTypesEnum, StageRewardTypeEnum, TypePointEnum } from "@/types/service-types";
import usePublicService from "@/services/public-service";
import { DateTime } from "luxon";
import NFTCrateIcon from "@/components/assets/images/nft-crate.png"
import FreeSpinIcon from "@/components/assets/images/free-spin.png"
import XPLWIcon from "@/components/assets/images/xp_lw.png"
import USDTLWIcon from "@/components/assets/images/usdt.png"
import GoodLuckIcon from "@/components/assets/images/good_luck.png"
import NextLink from "next/link"
import { AxiosError } from "axios";
import useSocmedMissionService from "@/services/socmed-mission-service";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertModalType, useModal } from "@/providers/modal";
import usePublicClientService from "@/services/public-client-service";
import MetamaskIcon from "@/components/assets/images/metamask.png"
import MarketplaceIcon from "@/components/assets/images/marketplace.png"
import GamesIcon from "@/components/assets/images/games.png"
import { marketplacePath, profilePath } from "@/helper/route-path";
import useSocmedAuthService from "@/services/socmed-auth-service";
import AirBalloonBackground from "@/components/assets/images/air_balloon.png"
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSignMessage } from "wagmi";
import useAuthService from "@/services/auth-service";
import useManageAdmin from "@/services/manage-admin-service";
import coinsBackground from "@/components/assets/images/coins.png"
import { toast } from "react-toastify";
import CONSTANT from "@/Constant";
import YoutubeIcon from "../assets/icons/YoutubeIcon";
import LoadingComponent from "../animations/loading";

const discordTask = [MissionTypesEnum.JOIN_DISCORD]
const telegramTask = [MissionTypesEnum.JOIN_GROUP_TELEGRAM, MissionTypesEnum.JOIN_CHANNEL_TELEGRAM]
const twitterTask = [MissionTypesEnum.FOLLOW_TWITTER, MissionTypesEnum.COMMENT_TWITTER, MissionTypesEnum.RETWEET_TWITTER, MissionTypesEnum.LIKE_TWEET_TWITTER, MissionTypesEnum.QUOTE_POST_TWITTER]
const connectTask = [MissionTypesEnum.CONNECT_DISCORD, MissionTypesEnum.CONNECT_TELEGRAM, MissionTypesEnum.CONNECT_TWITTER, MissionTypesEnum.CONNECT_ZEALY, MissionTypesEnum.CONNECT_WALLET, MissionTypesEnum.DAILY_CHECKIN, MissionTypesEnum.REFERRAL]
const youtubeTask = [MissionTypesEnum.WATCH_VIDEO_YOUTUBE, MissionTypesEnum.VISIT_CHANNEL_YOUTUBE]
const platformTask = twitterTask.concat(discordTask).concat(telegramTask).concat(youtubeTask)

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope700 = Manrope({weight: "700", subsets: ["latin"]})
const manrope600 = Manrope({weight: "600", subsets: ["latin"]})
const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})
const dmSans400 = DM_Sans({weight: "400", subsets: ["latin"]})
const roboto400 = Roboto({weight: "400", subsets: ["latin"]})



enum SocialRaidKey {
  COMPLETED = "Completed",
  EXPIRED = "Expired",
}

interface ProjectTab {
  key: ActiveTabKey;
  title: ReactNode;
  isNew?: boolean;
  isDisabled?: boolean;
  isWrap?: boolean;
  content: ReactNode;
}

enum PublicModal {
  JOIN = "JOIN",
  CONNECT = "CONNECT"
}

enum QuestTabEnum {
  ONGOING_CAMPAIGN = "Ongoing Campaign",
  ONE_OFF_QUEST = "One-off Quest"
}

interface IProjectState {
  selectedTab: ActiveTabKey;
  selectedSocialRaidTab: SocialRaidKey;
  isConvertionModal: boolean;
  isLuckyWheelLoading: boolean;
  isLuckyWheelConsumesZealyXP: boolean;
  isRedeemLoading: boolean;
  isVerifyLoading: boolean;
  isGetReferralList: boolean;
  referralList: Array<IGetReferralList>;
  referralPage: number;
  innerWidth: number;
  leaderboards: Array<GetLeaderboardResponse>;
  metaLeaderboards: MetaLeaderboardResponse;
  isLoadingTable: boolean;
  leaderboardType: LeaderboardTypeEnum;
  leaderboardPage: number;
  histories: Array<GetHistoryResponse>;
  missions: Array<GetPublicMission>;
  userInfo?: IGetUserInfo;
  isPublicModal?: PublicModal;
  clientProject?: IPublicClientResponse | null;
  selectedSpinReward?: ILuckyWheelCustom;
  referrerInfo?: ISetReferralReturn;
  locationHref: string;
  socialRaidMissions: Array<IGetSocialRaidTweetMission>;
  inventories: Array<IInventoryGet>;
  selectedInventory?: IInventoryGet;
  isAvailableFreeSpin?: boolean;
  inviterAdmin?: IManageAdminInviterResponse;
  questTab: QuestTabEnum;
  questboardPage: number;
  selectedStage?: IBannerProgressStages;
  // isMounted: boolean
}

interface ProjectComponentPageProps {
  project: string;
  clientProject?: IPublicClientResponse | null;
}

const ProjectComponentPage: FC<ProjectComponentPageProps> = (props) => {
  const refTab = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const questSectionRef = useRef<HTMLDivElement>(null)
  const { signMessageAsync } = useSignMessage({
    message: getSignMessage(),
  })
  const { twitterAuth, discordAuth, telegramAuth } = useSocmedAuthService()
  const { state: { isLight, token, profile, isSignatureLoading, topBarHeight }, dispatch: globalDispatch } = useGlobalContext()
  const params = useSearchParams()
  const invite_code = params.get("confirm_invite")
  const questboardId = params.get("questboardId")
  const selectedTab = params.get("selectedTab")
  const openModal = useModal()
  const { login, getProfile } = useAuthService()
  const { getLeaderboard, getHistory, getAllMission, luckyWheelSpin, getUserInfo, luckyWheelConvertSpin, inventoryGet, inventoryRedeem, getLuckyWheels } = usePublicService()
  const { referralSet, connectTelegram, joinchannelTelegram, joingroupTelegram, connectDiscord, joinDiscord, verifyRoleDiscord, connectTwitter, followTwitter, likeTweetTwitter, retweetTwitter, quotepostTwitter, commentTwitter, getReferralList, getSocialRaidTweets, visitYoutubeChannel, watchYoutubeVideo } = useSocmedMissionService()
  const { getProjectByUsername } = usePublicClientService()
  const { confirmByEmail, getInviter } = useManageAdmin()
  const [state, dispatch] = useMinimizedState<IProjectState>({
    clientProject: props.clientProject,
    selectedTab: selectedTab ? selectedTab as ActiveTabKey : ActiveTabKey.LEADERBOARD,
    selectedSocialRaidTab: SocialRaidKey.COMPLETED,
    isLuckyWheelConsumesZealyXP: false,
    isConvertionModal: false,
    isLuckyWheelLoading: false,
    isRedeemLoading: false,
    isGetReferralList: false,
    isVerifyLoading: false,
    // isMounted: false,
    referralList: [],
    referralPage: 1,
    innerWidth: 0,
    socialRaidMissions: [],
    leaderboards: [],
    leaderboardType: LeaderboardTypeEnum.POINT,
    leaderboardPage: 1,
    histories: [],
    missions: [],
    locationHref: "",
    inventories: [],
    questTab: QuestTabEnum.ONGOING_CAMPAIGN,
    questboardPage: 1,
    metaLeaderboards: {
      currentPage: 1,
      lastPage: 1,
      perPage: 50,
      total: 1,
      next: 2,
      prev: 0,
      yourRank: 0
    },
    isLoadingTable: false
  })

  const centerContents = [
    {
      icon: GamesIcon,
      title: "Games",
      description: "Join our game Channel and climb up the leaderboard",
      isDisabled: true,
    },
    {
      icon: MarketplaceIcon,
      title: "Marketplace",
      description: "Unleash the true potential of your points",
      onClick: () => router.push(`/${props.project}` + marketplacePath),
      isDisabled: true,
    },
  ]

  const getSocialRaidTweetsService = (t?: string) => {
    getSocialRaidTweets(props.project, {Authorization: "Bearer " + (t ?? token)})
      .then(res => dispatch({socialRaidMissions: res.data.data}))
      .catch(err => console.log(err))
  }

  useDebounce<[HTMLDivElement | null, string | null]>((rt, st)=>{
    if(rt && st) smoothScrollByRef(rt)
  }, [refTab.current, selectedTab], 400)

  useWindowFocus(()=>{
    if(token) {
      getHistory(props.project, {Authorization: "Bearer " + token})
        .then(res => dispatch({histories: res?.data?.data ?? []}))
        .catch(err => console.log(err))
      getAllMission(props.project, {Authorization: "Bearer " + token})
        .then(res => dispatch({missions: res?.data?.data ?? []}))
        .catch(err => console.log(err))

      if(profile?.twitter?.username) getSocialRaidTweetsService(token)
    }
  })

  const getReferralLink = (anotherParams?: Record<string, any>) => {
    return addSearchParams(state.locationHref, {ref: state.userInfo?.referral_code, ...anotherParams})
  }

  const shareLink = async (anotherParams?: Record<string, any>) => {
    await navigator.clipboard.writeText(getReferralLink(anotherParams))

    openModal({
      type: AlertModalType.SUCCESS,
      title: "Success!",
      description: "Copied to clipboard!"
    })
  }

  const shareWithIntent = (anotherParams?: Record<string, any>, callback?: () => void) => {
    const intentUrl = new URL("https://twitter.com/intent/tweet")
    intentUrl.searchParams.set("text", getReferralLink(anotherParams))

    redirectToNewPage(intentUrl.href, true)

    if(callback) callback()
  }

  useEffect(()=>{
    dispatch({locationHref: window.location.href})
  }, [])

  useDebounce<[string, string | undefined, LeaderboardTypeEnum]>((t, tUsername, typeLeaderboard)=>{
    if(t) {
      getUserInfo(props.project, {Authorization: "Bearer " + t}, {type_leaderboard: typeLeaderboard})
        .then(res => {
          dispatch({userInfo: res.data.data})
        })
        .catch(err => {
          console.log(err)
        })

      getProjectByUsername(props.project, {Authorization: "Bearer " + t})
        .then(res => dispatch({clientProject: res.data.data}))
        .catch(err => console.log(err))

      if(tUsername) getSocialRaidTweetsService(t)
    }
  }, [token, profile?.twitter?.username, state.leaderboardType], 400)

  useDebounce<[string, string | null]>((t, ic)=>{
    if(t && ic) getInviter({username: props.project}, {Authorization: "Bearer " + t})
      .then(res => dispatch({inviterAdmin: res.data.data}))
      .catch(err => console.log(err))
  }, [token, invite_code], 400)

  const getLWLabel = (item: ILuckyWheel) => {
    if(item.type_reward === LuckyWheelTypesEnum.XP) {
      if(item.is_multiply) return "XP X" + item.value
      return "XP +" + item.value
    }
    else if(item.type_reward === LuckyWheelTypesEnum.USDT) return "$" + item.value
    else if(item.type_reward === LuckyWheelTypesEnum.GOOD_LUCK) return "Good Luck"
    else if(item.type_reward === LuckyWheelTypesEnum.FREE_SPIN) return "Free Spin"
    else return item.marketplaceId?.name ?? "Custom Item"
  }

  // const LUCKY_WHEEL_ITEM = useMemo<Array<LuckyWheelItem<ILuckyWheelCustom>>>(()=>{
  //   return (state.clientProject?.luckywheels ?? []).map((lw) => ({
  //     value: lw._id!!,
  //     item: {
  //       ...lw,
  //       icon: lw.marketplaceId?.photo ?? lw.icon,
  //       label: getLWLabel(lw)
  //     }
  //   }))
  // }, [state.clientProject?.luckywheels])

  const getLeaderboardDatas = useMemo<Array<GetLeaderboardResponse & {rank: number}>>(()=>{
    return (state.leaderboards ?? []).map((ldb, index) => ({
      ...ldb,
      rank: ((state.leaderboardPage - 1) * CONSTANT.PAGINATION_DEFAULT_LIMIT) + index + 1
    }))
  }, [state.leaderboards, state.leaderboardPage])

  const getReferralLists = useMemo<Array<IGetReferralList & {no: number}>>(()=>{
    const MIN_LIMIT = CONSTANT.PAGINATION_DEFAULT_LIMIT * (state.referralPage - 1)
    const MAX_LIMIT = CONSTANT.PAGINATION_DEFAULT_LIMIT * state.referralPage

    return (state.referralList ?? []).slice(MIN_LIMIT, MAX_LIMIT).map((rl, index) => ({
      ...rl,
      no: MIN_LIMIT + index + 1
    }))
  }, [state.referralList, state.referralPage])

  const parseLeaderboardPercentage = useCallback((stringPersentase: string) => {
    if (stringPersentase === "NaN%") return "0.00%"
    let persentase:number|string = parseFloat(stringPersentase.replace('%', ''));
    // Membulatkan persentase menjadi 3 desimal
    persentase = persentase.toFixed(3);
    let hasil = persentase + "%";
    return hasil;
  }, [])

  useDebounce<[IGetProfile | undefined]>((p)=>{
    if(p) dispatch({isPublicModal: PublicModal.CONNECT})
    else dispatch({isPublicModal: PublicModal.JOIN})
  }, [profile], 400)

  useEffect(()=>{
    if(state.clientProject && state.clientProject.chains.length > 0) globalDispatch({chains: state.clientProject.chains})
  }, [state.clientProject?.chains])

  useDebounce<[string, string | null, PublicModal | undefined]>((t, referral_code, isPublicModal)=>{
    if(t && referral_code && !isPublicModal) {
      referralSet(props.project, {referral_code}, {Authorization: "Bearer " + t})
        .then(res => dispatch({referrerInfo: res.data.data}))
        .catch(err => console.log(err))
    }
  }, [token, params.get("ref"), state.isPublicModal], 400)

  useDebounce<[string, string]>((t, p)=>{
    if(t) {
      getHistory(p, {Authorization: "Bearer " + t})
        .then(res => dispatch({histories: res?.data?.data ?? []}))
        .catch(err => console.log(err))
      getAllMission(p, {Authorization: "Bearer " + t})
        .then(res => dispatch({missions: res?.data?.data ?? []}))
        .catch(err => console.log(err))
    }
  }, [token, props.project], 400)

  useDebounce<[string, string, LeaderboardTypeEnum, ActiveTabKey, number]>((t, p, type_leaderboard, selectedTab, leaderboardPage)=>{
    if(t && selectedTab === ActiveTabKey.LEADERBOARD) {
      dispatch({isLoadingTable: true})
      getLeaderboard(p, {type_leaderboard, page: leaderboardPage, limit: CONSTANT.PAGINATION_DEFAULT_LIMIT}, {Authorization: "Bearer " + t})
        .then(res => dispatch({leaderboards: res.data.data ?? [], metaLeaderboards: res.data.meta}))
        .catch(err => console.log(err))
        .finally(() => dispatch({isLoadingTable: false}))
    }
  }, [token, props.project, state.leaderboardType, state.selectedTab, state.leaderboardPage], 400)

  const moreSpinHandler = (callback: (items: Array<string>) => void) => {
    const cb = () => {
      luckyWheelSpin(props.project)
        .then(res => callback([res.data.data.id]))
        .catch((err: AxiosError<ResponseAPI<null>>) => toast.error(err?.response?.data?.message ?? "Failed to spin!"))
        .finally(()=>dispatch({isLuckyWheelLoading: false}))
    }

    dispatch({isLuckyWheelLoading: true})

    if(state.isAvailableFreeSpin === true) cb()
    else getLuckyWheels(props.project)
      .then(res => {
        if(res?.data?.data?.available_free_spin) {
          dispatch({isAvailableFreeSpin: res.data.data.available_free_spin})
          cb()
        }
        else cb()
      })
      .catch(err => {
        console.log(err)
        dispatch({isLuckyWheelLoading: false})
      })
  }

  const sectionComponent = (icon: ReactNode, title: ReactNode) => (
    <div className="flex flex-row gap-2 items-center">
      <ThemeAvatar className="bg-[#31006F]" icon={<span className="text-[#FFC627]">{icon}</span>} />
      <span className={`text-[24px] font-medium ${isLight ? "text-black" : "text-white"}`}>{title}</span>
    </div>
  )

  const questboards = useMemo(()=>{
    let results: Array<CustomQuestboard> = []

    state.missions.forEach(mission => {
      const data = mission.data as CustomQuestboard

      if(data.questBoardId && platformTask.find(pt => pt === mission.type)) {
        const { start_redemption_date, end_redemption_date } = mission
        const indexFinder = results.findIndex(result => result.questBoardId === data.questBoardId)
        if(indexFinder > -1) results[indexFinder].missions?.push(mission)
        else results.push({
          ...data, 
          start_redemption_date: start_redemption_date ?? data.start_redemption_date, 
          end_redemption_date: end_redemption_date ?? data.end_redemption_date, 
          extra_reward_type: data.extra_reward_type,
          extra_reward_point: data.extra_reward_point,
          missions: [mission]
        })
      }
    })

    const permanent = structuredClone(results).filter((qb) => !qb.start_redemption_date)
    const ongoing = structuredClone(results).filter((qb) => qb.start_redemption_date && qb.end_redemption_date && (new Date() >= new Date(qb.start_redemption_date)) && (new Date() < new Date(qb.end_redemption_date)))
    const upcoming = structuredClone(results).filter((qb) => qb.start_redemption_date && (new Date() < new Date(qb.start_redemption_date)))
    const finished = structuredClone(results).filter((qb) => qb.end_redemption_date && (new Date() >= new Date(qb.end_redemption_date) ))

    return permanent.concat(ongoing).concat(upcoming).concat(finished)
  }, [state.missions])

  useDebounce<[string | null, HTMLDivElement | null, Array<CustomQuestboard>]>((qbId, questRef, qbs)=>{
    if(qbId && questRef && qbs.length > 0) {
      smoothScrollByRef(questRef)

      const separatedQuestboards = [...Array(Math.ceil(qbs.length/CONSTANT.PAGINATION_QUESTBOARD_DEFAULT_LIMIT)).keys()].map((page) => {
        const MIN_LIMIT = CONSTANT.PAGINATION_QUESTBOARD_DEFAULT_LIMIT * page
        const MAX_LIMIT = CONSTANT.PAGINATION_QUESTBOARD_DEFAULT_LIMIT * (page + 1)

        return (qbs ?? []).slice(MIN_LIMIT, MAX_LIMIT)
      })
      const selectedPage = separatedQuestboards.findIndex(sq => sq.find(s => s.questBoardId === qbId))
      if(selectedPage > -1) dispatch({questboardPage: selectedPage + 1})
    }
  }, [questboardId, questSectionRef.current, questboards], 400)

  const questboardPaginate = useMemo(()=>{
    const MIN_LIMIT = CONSTANT.PAGINATION_QUESTBOARD_DEFAULT_LIMIT * (state.questboardPage - 1)
    const MAX_LIMIT = CONSTANT.PAGINATION_QUESTBOARD_DEFAULT_LIMIT * state.questboardPage

    return (questboards ?? []).slice(MIN_LIMIT, MAX_LIMIT)
  }, [questboards, state.questboardPage])

  const anotherMissions = useMemo(()=>{
    return state.missions.filter(mission => platformTask.find(pt => pt === mission.type) && !((mission.data as CustomQuestboard)?.questBoardId))
  }, [state.missions])

  const platformConnectMissions = useMemo(()=>{
    return state.missions.filter(mission => connectTask.find(ct => ct === mission.type))
  }, [state.missions])

  const referralMission = useMemo(()=>{
    return state.missions.find(mission => mission.type === MissionTypesEnum.REFERRAL)
  }, [state.missions])

  const verifyMission = async (mission: GetPublicMission) => {
    try {
      if(
        !profile?.discord.discord_id && discordTask.find(dt => dt === mission.type) ||
        !profile?.telegram.telegram_id && telegramTask.find(tt => tt === mission.type) ||
        !profile?.twitter.twitter_id && twitterTask.find(tt => tt === mission.type)
      ) dispatch({isPublicModal: PublicModal.CONNECT})
      else {
        const missionByTypes: Array<[MissionTypesEnum, Function]> = [
          [
            MissionTypesEnum.REFERRAL, 
            async () => {
              const param = params.get("ref")
              if(state.clientProject?._id && param) 
              await referralSet(props.project, {referral_code: param})
            }
          ],
          [MissionTypesEnum.CONNECT_TELEGRAM, async () => await connectTelegram(props.project, {missionId: mission.id})],
          [MissionTypesEnum.JOIN_GROUP_TELEGRAM, async () => await joingroupTelegram(props.project, {missionId: mission.id})],
          [MissionTypesEnum.JOIN_CHANNEL_TELEGRAM, async () => await joinchannelTelegram(props.project, {missionId: mission.id})],
          [MissionTypesEnum.CONNECT_DISCORD, async () => await connectDiscord(props.project, {missionId: mission.id})],
          [MissionTypesEnum.JOIN_DISCORD, async () => await joinDiscord(props.project, {missionId: mission.id})],
          [MissionTypesEnum.VERIFY_ROLE_DISCORD, async () => await verifyRoleDiscord(props.project, {missionId: mission.id})],
          [MissionTypesEnum.CONNECT_TWITTER, async () => await connectTwitter(props.project, {missionId: mission.id})],
          [MissionTypesEnum.FOLLOW_TWITTER, async () => await followTwitter(props.project, {missionId: mission.id})],
          [MissionTypesEnum.LIKE_TWEET_TWITTER, async () => await likeTweetTwitter(props.project, {missionId: mission.id})],
          [MissionTypesEnum.RETWEET_TWITTER, async () => await retweetTwitter(props.project, {missionId: mission.id})],
          [MissionTypesEnum.QUOTE_POST_TWITTER, async () => await quotepostTwitter(props.project, {missionId: mission.id})],
          [MissionTypesEnum.COMMENT_TWITTER, async () => await commentTwitter(props.project, {missionId: mission.id})],
          [MissionTypesEnum.WATCH_VIDEO_YOUTUBE, async () => await watchYoutubeVideo(props.project, {missionId: mission.id})],
          [MissionTypesEnum.VISIT_CHANNEL_YOUTUBE, async () => await visitYoutubeChannel(props.project, {missionId: mission.id})],
        ]
    
        const finder = missionByTypes.find(([type, _func]) => type === mission.type)
    
        if(finder) {
          dispatch({isVerifyLoading: true})
          await finder[1]()
          const missions = await getAllMission(props.project)
          const userInfo = await getUserInfo(props.project, {Authorization: "Bearer " + token}, {type_leaderboard: state.leaderboardType})
          
          dispatch({
            isVerifyLoading: false,
            userInfo: userInfo.data.data
          })
  
          const claimedMission = missions.data.data.filter(d => {
            const finder = state.missions.find(mission => mission.id === d.id)
            if(d.is_claimed === true && !(finder?.is_claimed)) return true
            else return false
          })
  
          if(claimedMission.length > 0) claimedMission.forEach(cm => {
            openModal({
              type: AlertModalType.SUCCESS,
              size: "2xl",
              customContent: (onOk, onCancel) => (
                <CustomContentSuccessTaskModal 
                  clientProject={state.clientProject}
                  referralLink={getReferralLink()}
                  shareLink={shareLink}
                  referralFinder={state.missions.find(m => m.type === MissionTypesEnum.REFERRAL)}
                  selectedTask={cm}
                />
              )
            })
          })
          else openModal({
            type: AlertModalType.SUCCESS,
            size: "2xl",
            customContent: (onOk, onCancel) => (
              <CustomContentSuccessTaskModal 
                clientProject={state.clientProject}
                referralLink={getReferralLink()}
                shareLink={shareLink}
                referralFinder={state.missions.find(m => m.type === MissionTypesEnum.REFERRAL)}
                selectedTask={mission}
                isPending
              />
            )
          })
  
          dispatch({missions: missions.data.data})
        }
      }
    }
    catch(err) {
      console.log(err)
      if((err as AxiosError<ResponseAPI<null>>)?.response?.data?.message) toast.error((err as AxiosError<ResponseAPI<null>>)?.response?.data?.message)
      dispatch({isVerifyLoading: false})
    }
  }

  const missionUnauthPlatformWarning = <T extends any>(requiredValue: T, platform: string, render: () => ReactNode) => {
    const getIconByPlatform = () => {
      if(platform.toLowerCase() === "twitter") return <TwitterXIcon />
      else if(platform.toLowerCase() === "telegram") return <TelegramIcon />
      else if(platform.toLowerCase() === "discord") return <DiscordIcon />
      else return null
    }
    const socmedAuth = () => {
      if(token) {
        if(platform.toLowerCase() === "twitter") twitterAuth({redirect_url: state.locationHref, authorization: "Bearer " + token})
        else if(platform.toLowerCase() === "discord") discordAuth({redirect_url: state.locationHref, authorization: "Bearer " + token})
        else if(platform.toLowerCase() === "telegram") loginTelegram((data) => {
          if(data !== false) telegramAuth(data)
            .then(()=>{
              const connectTelegramFinder = state.missions.find(mission => mission.type === MissionTypesEnum.CONNECT_TELEGRAM)
              const referralFinder = state.missions.find(mission => mission.type === MissionTypesEnum.REFERRAL)

              if(connectTelegramFinder && !connectTelegramFinder.is_claimed) connectTelegram(props.project, {missionId: connectTelegramFinder.id})
                .then(() => {
                  getProfile({Authorization: "Bearer " + token})
                    .then(res => globalDispatch({profile: res.data.data}))
                    .catch(err => console.log(err))
                  openModal({
                    type: AlertModalType.SUCCESS,
                    size: "2xl",
                    customContent: (onOk, onCancel) => (
                      <CustomContentSuccessTaskModal 
                        clientProject={state.clientProject}
                        referralLink={getReferralLink()}
                        shareLink={shareLink}
                        referralFinder={referralFinder}
                        selectedTask={connectTelegramFinder}
                      />
                    )
                  })})
                .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
        })
      }
      else openModal({
        type: AlertModalType.WARNING,
        title: "Warning",
        description: "Required to log in!"
      })
    }
    if(requiredValue) return render()
    else return (
      <ThemeAlert
        title="Attention"
        type={ThemeAlertType.WARNING}
      >
        <div className="flex flex-col w-full gap-2">
          <span>To complete this mission, you are required to link your {platform} account first.</span>
          <ThemeButton
            color="secondary"
            className="w-fit"
            startContent={getIconByPlatform()}
            onClick={socmedAuth}
          >
            Connect {platform}
          </ThemeButton>
        </div>
      </ThemeAlert>
    )
  }

  const getDisplayName = () => {
    if(profile?.name) return profile.name
    else if(profile?.wallet_address) return middleEllipsisText(profile.wallet_address)
    else return "-"
  }

  const ignoreAdminInvite = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete("confirm_invite")

    router.push(url.href)
  }

  const joinAdminInvite = (t?: string) => {
    if(invite_code && state.clientProject?.username && (token || t)) confirmByEmail({
      username: state.clientProject.username,
      invite_code
    }, { Authorization: "Bearer " + (token ?? t) })
      .then(()=>{
        toast.success("Congrats! You're admin now!")
        
        router.push(addSearchParams(profilePath, {tab: "PROFILE", username: state.clientProject?.username}))
      })
  }

  const renderMissionByType = (mission: GetPublicMission) => {
    const isDisableMission = mission.data?.end_redemption_date && (new Date() >= new Date(mission.data.end_redemption_date))
    
    if(mission.is_claimed) return (
      <div className="bg-success rounded-xl">
        <div className="p-2 flex items-center gap-2">
          <AntdSuccessIcon />
          <h2>Attention</h2>
        </div>
        <ThemeDivider />
        <div className="p-2 text-left">You have completed this mission!</div>
      </div>
    )
    else {
      if(mission.type === MissionTypesEnum.FOLLOW_TWITTER) {
        return missionUnauthPlatformWarning(profile?.twitter?.username, "Twitter", () => {
          const data = mission.data as IFollowTwitterMission & Object
          return (
            <div className="flex flex-row items-center gap-2">
              <VerifyButton 
                isLoading={state.isVerifyLoading}
                onClick={()=>!isDisableMission && verifyMission(mission)}
                content={(clicked)=>(
                  <NextLink href={`https://twitter.com/intent/follow?screen_name=${data.username}`} target="_blank">
                    <ThemeButton 
                      radius="full" 
                      startContent={<XIcon />}
                      onClick={clicked}
                      isLoading={state.isVerifyLoading}
                    >
                      Follow {data.username && `@${data.username}`}
                    </ThemeButton>
                  </NextLink>
                )}
              />
            </div>
          )
        })
      }
      else if(mission.type === MissionTypesEnum.COMMENT_TWITTER) {
        return missionUnauthPlatformWarning(profile?.twitter?.username, "Twitter", () => {
          const data = mission.data as ILikeTwitterMission & Record<string, any>
          const intentUrl = new URL(`https://twitter.com/intent/tweet/${data.id_tweet}`)
          if(data.text) intentUrl.searchParams.set("text",data.text)
          if(data.id_tweet) intentUrl.searchParams.set("in_reply_to", data.id_tweet)
          return (
            <div className="flex flex-row items-center gap-2">
              <VerifyButton 
                isLoading={state.isVerifyLoading}
                onClick={()=>!isDisableMission && verifyMission(mission)}
                content={(clicked)=>(
                  <NextLink href={intentUrl.href} target="_blank">
                    <ThemeButton 
                      radius="full" 
                      startContent={<XIcon />}
                      onClick={clicked}
                      isLoading={state.isVerifyLoading}
                    >
                      Comment this tweet
                    </ThemeButton>
                  </NextLink>
                )}
              />
            </div>
          )
        })
      }
      else if(mission.type === MissionTypesEnum.RETWEET_TWITTER) {
        return missionUnauthPlatformWarning(profile?.twitter?.username, "Twitter", () => {
          const data = mission.data as IRetweetTwitterMission & Object
          return (
            <div className="flex flex-col items-start gap-2">
              {data.text &&
                <Fragment>
                  <h2 className={`${manrope800.className} text-[25px]`}>Template:</h2>
                  <span className="text-left">{data.text}</span>
                </Fragment>
              }
              <div className="flex flex-row items-center gap-2">
                {data.username && data.id_tweet &&
                  <VerifyButton 
                    isLoading={state.isVerifyLoading}
                    onClick={()=>!isDisableMission && verifyMission(mission)}
                    content={(clicked)=>(
                      <NextLink href={`https://twitter.com/intent/retweet?tweet_id=${data.id_tweet}`} target="_blank">
                        <ThemeButton 
                          radius="full" 
                          startContent={<XIcon />}
                          onClick={clicked}
                          isLoading={state.isVerifyLoading}
                        >
                          Retweet this post
                        </ThemeButton>
                      </NextLink>
                    )}
                  />
                }
              </div>
            </div>
          )
        })
      }
      else if(mission.type === MissionTypesEnum.LIKE_TWEET_TWITTER) {
        return missionUnauthPlatformWarning(profile?.twitter?.username, "Twitter", () => {
          const data = mission.data as ILikeTwitterMission & Object
          return (
            <div className="flex flex-row items-center gap-2">
              {data.username && data.id_tweet &&
                <VerifyButton 
                  isLoading={state.isVerifyLoading}
                  onClick={()=>!isDisableMission && verifyMission(mission)}
                  content={(clicked)=>(
                    <NextLink href={`https://twitter.com/intent/like?tweet_id=${data.id_tweet}`} target="_blank">
                      <ThemeButton 
                        radius="full" 
                        startContent={<XIcon />}
                        onClick={clicked}
                        isLoading={state.isVerifyLoading}
                      >
                        Redirect to Tweet
                      </ThemeButton>
                    </NextLink>
                  )}
                />
              }
            </div>
          )
        })
      }
      else if(mission.type === MissionTypesEnum.QUOTE_POST_TWITTER) {
        return missionUnauthPlatformWarning(profile?.twitter?.username, "Twitter", () => {
          const data = mission.data as Record<string, any>
          const intentUrl = new URL('https://twitter.com/intent/post')
          if(data.text) intentUrl.searchParams.set("text", data.text)
          return (
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-col items-start">
                <h2>Create a Tweet with following template</h2>
                <span className="text-left">Template: {data.text ?? "(no template)"}</span>
              </div>
              <ThemeDivider />
              <div className="flex flex-row items-center gap-2">
                <VerifyButton 
                  isLoading={state.isVerifyLoading}
                  onClick={()=>!isDisableMission && verifyMission(mission)}
                  content={(clicked)=>(
                    <NextLink href={intentUrl.href} target="_blank">
                      <ThemeButton 
                        radius="full" 
                        startContent={<XIcon />} 
                        onClick={clicked}
                        isLoading={state.isVerifyLoading}
                      >
                        Create a Tweet
                      </ThemeButton>
                    </NextLink>
                  )}
                />
              </div>
            </div>
          )
        })
      }
      else if(mission.type === MissionTypesEnum.SOCIAL_RAID_TWITTER) {
        return missionUnauthPlatformWarning(profile?.twitter?.username, "Twitter", () => {
          const data = mission.data as IPostTwitterMission & Record<string, any>
          return (
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-col items-start">
                <h2>Post or Retweet this account {Array.isArray(data.keywords) && data.keywords.length > 0 ? "with specific keywords." : ""}</h2>
                <span className="text-left">Keywords: {Array.isArray(data.keywords) && data.keywords.join(", ").replace(/, ([^,]*)$/, " and $1")}</span>
              </div>
              <ThemeDivider />
              <div className="flex flex-row items-center gap-2">
                <VerifyButton 
                  isLoading={state.isVerifyLoading}
                  onClick={()=>!isDisableMission && verifyMission(mission)}
                  content={(clicked)=>(
                    <NextLink href={`https://twitter.com/${data.username}`} target="_blank">
                      <ThemeButton 
                        radius="full" 
                        startContent={<XIcon />}
                        onClick={clicked}
                        isLoading={state.isVerifyLoading}
                      >
                        Twitter Target Account
                      </ThemeButton>
                    </NextLink>
                  )}
                />
              </div>
            </div>
          )
        })
      }
      else if(mission.type === MissionTypesEnum.JOIN_GROUP_TELEGRAM) {
        return missionUnauthPlatformWarning(profile?.telegram?.username, "Telegram", () => {
          const data = mission.data as Record<string, any>
          return (
            <div className="flex flex-col items-start gap-2">
              <VerifyButton 
                isLoading={state.isVerifyLoading}
                onClick={()=>!isDisableMission && verifyMission(mission)}
                content={(clicked)=>(
                  <NextLink href={`https://t.me/${data.username_group}`} target="_blank">
                    <ThemeButton 
                      radius="full" 
                      startContent={<TelegramIcon />}
                      onClick={clicked}
                      isLoading={state.isVerifyLoading}
                    >
                      Join this Telegram Group
                    </ThemeButton>
                  </NextLink>
                )}
              />
            </div>
          )
        })
      }
      else if(mission.type === MissionTypesEnum.JOIN_CHANNEL_TELEGRAM) {
        return missionUnauthPlatformWarning(profile?.telegram?.username, "Telegram", () => {
          const data = mission.data as Record<string, any>
          return (
            <div className="flex flex-col items-start gap-2">
              <VerifyButton 
                isLoading={state.isVerifyLoading}
                onClick={()=>!isDisableMission && verifyMission(mission)}
                content={(clicked)=>(
                  <NextLink href={`https://t.me/${data.username_group}`} target="_blank">
                    <ThemeButton 
                      radius="full" 
                      startContent={<TelegramIcon />}
                      onClick={clicked}
                      isLoading={state.isVerifyLoading}
                    >
                      Join this Telegram Channel
                    </ThemeButton>
                  </NextLink>
                )}
              />
            </div>
          )
        })
      }
      else if(mission.type === MissionTypesEnum.JOIN_DISCORD) {
        return missionUnauthPlatformWarning(profile?.discord?.username, "Discord", () => {
          const data = mission.data as Record<string, any>
          return (
            <div className="flex flex-col items-start gap-2">
              <VerifyButton 
                isLoading={state.isVerifyLoading}
                onClick={()=>!isDisableMission && verifyMission(mission)}
                content={(clicked)=>(
                  <NextLink href={`https://discord.com/channels/${data.server_id}`} target="_blank">
                    <ThemeButton 
                      radius="full" 
                      startContent={<TelegramIcon />}
                      onClick={clicked}
                      isLoading={state.isVerifyLoading}
                    >
                      Join this Discord Group
                    </ThemeButton>
                  </NextLink>
                )}
              />
            </div>
          )
        })
      }
      else if(mission.type === MissionTypesEnum.VERIFY_ROLE_DISCORD) {
        return missionUnauthPlatformWarning(profile?.discord?.username, "Discord", () => {
          const data = mission.data as Record<string, any>
          return (
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-col items-start">
                <h2>Join Discord Group and Role Verify</h2>
                <span className="text-left">Role: {data.role_name}</span>
              </div>
              <ThemeDivider />
              <div className="flex flex-row items-center gap-2">
                <VerifyButton 
                  isLoading={state.isVerifyLoading}
                  onClick={()=>!isDisableMission && verifyMission(mission)}
                  content={(clicked)=>(
                    <NextLink href={`https://discord.com/channels/${data.server_id}`} target="_blank">
                      <ThemeButton 
                        radius="full" 
                        startContent={<TelegramIcon />}
                        onClick={clicked}
                        isLoading={state.isVerifyLoading}
                      >
                        Join this Discord Group and Verify
                      </ThemeButton>
                    </NextLink>
                  )}
                />
              </div>
            </div>
          )
        })
      }
      else if(mission.type === MissionTypesEnum.WATCH_VIDEO_YOUTUBE) {
        const data = mission.data as Record<string, any>
        return (
          <div className="flex flex-col items-start gap-2">
            {data.url &&
              <VerifyButton 
                isLoading={state.isVerifyLoading}
                onClick={()=>!isDisableMission && verifyMission(mission)}
                content={(clicked)=>(
                  <NextLink href={data.url} target="_blank">
                    <ThemeButton 
                      radius="full" 
                      startContent={<TelegramIcon />}
                      onClick={clicked}
                      isLoading={state.isVerifyLoading}
                    >
                      Watch this Video Youtube
                    </ThemeButton>
                  </NextLink>
                )}
              />
            }
          </div>
        )
      }
      else if(mission.type === MissionTypesEnum.VISIT_CHANNEL_YOUTUBE) {
        const data = mission.data as Record<string, any>
        return (
          <div className="flex flex-col items-start gap-2">
            {data.url &&
              <VerifyButton 
                isLoading={state.isVerifyLoading}
                onClick={()=>!isDisableMission && verifyMission(mission)}
                content={(clicked)=>(
                  <NextLink href={data.url} target="_blank">
                    <ThemeButton 
                      radius="full" 
                      startContent={<TelegramIcon />}
                      onClick={clicked}
                      isLoading={state.isVerifyLoading}
                    >
                      Visit this Channel Youtube
                    </ThemeButton>
                  </NextLink>
                )}
              />
            }
          </div>
        )
      }
      else return mission.type + " - Feature is under development!"
    }
  }

  const getLWIcon = (item: ILuckyWheel) => {
    if(item.icon) return item.icon
    else {
      if(item.type_reward === LuckyWheelTypesEnum.XP) return XPLWIcon
      else if(item.type_reward === LuckyWheelTypesEnum.USDT) return USDTLWIcon
      else if(item.type_reward === LuckyWheelTypesEnum.GOOD_LUCK) return GoodLuckIcon
      else if(item.type_reward === LuckyWheelTypesEnum.FREE_SPIN) return FreeSpinIcon
      else return NFTCrateIcon
    }
  }

  const inventoryGetService = () => {
    dispatch({isRedeemLoading: true})
    inventoryGet(props.project)
      .then(res => {
        if(res.data.data.length > 0) dispatch({inventories: res.data.data})
        else openModal({
          type: AlertModalType.INFO,
          title: "Warning",
          description: "You don't have any inventory!"
        })
      })
      .catch(err => {
        console.log(err)
        openModal({
          type: AlertModalType.ERROR,
          title: "Failed!",
          description: "Failed to Get Inventories!"
        })
      })
      .finally(()=>dispatch({isRedeemLoading: false}))
  }

  const inventoryRedeemService = (inventory: IInventoryGet) => {
    dispatch({isRedeemLoading: true})
    inventoryRedeem(props.project, {inventoryId: inventory.id})
      .then(() => {
        openModal({
          type: AlertModalType.SUCCESS,
          title: "Success!",
          description: "Successfully Requested!"
        })

        inventoryGetService()

        dispatch({selectedInventory: undefined})
      })
      .catch(err => {
        console.log(err)
        openModal({
          type: AlertModalType.ERROR,
          title: "Failed!",
          description: "Failed to Redeem Request!"
        })
      })
      .finally(()=>dispatch({isRedeemLoading: false}))
  }

  const getMissionAvatar = (mission: GetPublicMission) => {
    if(twitterTask.find(task => task === mission.type)) return <TwitterXIcon />
    else if(discordTask.find(task => task === mission.type)) return <DiscordIcon />
    else if(telegramTask.find(task => task === mission.type)) return <TelegramIcon />
    else if(youtubeTask.find(task => task === mission.type)) return <YoutubeIcon width="20" height="20" />
    else return undefined
  }

  const loginService = (message: string, wallet_address: string, callback?: (res: LoginResponse) => void) => {
    globalDispatch({isSignatureLoading: true})
    signMessageAsync({message})
      .then((signature_hash) => {
        login({
          wallet_address, 
          signature_hash,
          message
        })
          .then((responseLogin) => {
            globalDispatch({token: responseLogin.data.data.auth_token})
            
            if(callback) callback(responseLogin.data.data)
          })
          .catch(err => {
            console.log(err)
            openModal({
              type: AlertModalType.ERROR,
              title: "Oops!",
              description: "Unexpected error has occurred! Please try again!"
            })
          })
          .finally(()=>globalDispatch({isSignatureLoading: false}))
      })
      .catch(err => {
        console.log(err)
        globalDispatch({isSignatureLoading: false})
      })
  }

  const conditionalProfileRenderer = () => {
    if(profile?.wallet_address) return (
      <div
        className="flex flex-col gap-2 backdrop-blur-2xl rounded-xl w-full text-white overflow-hidden relative"
        style={{
          background: "linear-gradient(234deg, rgba(143, 10, 10, 0.00) 23.83%, rgba(42, 0, 111, 0.15) 49.27%, rgba(183, 145, 48, 0.31) 107.43%, rgba(143, 10, 10, 0.00) 145.71%), #2E2E2E",
        }}
      >
        <div className="p-4 flex flex-row items-center gap-2 w-full">
          <ThemeAvatar radius="full" size="lg" src={profile?.avatar ?? "/metamask.png"} />
          <div className={`flex flex-col gap-1 text-white ${manrope700.className}`}>
            <span className="text-[14px]">Username</span>
            <span className="text-[29px] font-bold leading-8">{getDisplayName()}</span>
          </div>
        </div>
        <ThemeDivider />
        <div className="p-4 flex flex-row justify-between w-full gap-2">
          <div className="flex flex-col gap-8 w-full justify-between">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-row items-center gap-2">
                <MainXpSmallIcon />
                <span className="text-[30px]">{numFormatter(state.userInfo?.point ?? 0)}</span>
              </div>
              <div className="flex flex-col text-white">
                <span className="text-[18px]">HypeQuestXP</span>
                <span className="text-[12px]">(Affiliate + Signup Points)</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[18px]">Total XP</span>
              <span className="text-[12px]">HypeQuest + Zealy</span>
            </div>
          </div>
          <div className="flex flex-col gap-8 w-full justify-between">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-row items-center gap-2">
                <ZealySmallIcon />
                <span className="text-[30px]">{numFormatter(state.userInfo?.zealy_xp ?? 0)}</span>
              </div>
              <div className="flex flex-col text-white">
                <span className="text-[18px]">Zealy XP</span>
              </div>
            </div>
            <span className="text-[30px]">{numFormatter((state.userInfo?.zealy_xp ?? 0) + (state.userInfo?.point ?? 0))}</span>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <span className="text-[30px]">{numFormatter(state.missions.length)}</span>
            <span className="leading-8 flex flex-row gap-2 items-center text-[18px]"><span>Total Quests</span><ThemeTooltip content="Total Quests"><QuestionTooltipIcon /></ThemeTooltip></span>
          </div>
        </div>
      </div>
    )
    else return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-[150px] backdrop-blur-2xl rounded-xl w-full text-white overflow-hidden relative"
        style={{
          background: "linear-gradient(234deg, rgba(143, 10, 10, 0.00) 23.83%, rgba(42, 0, 111, 0.15) 49.27%, rgba(183, 145, 48, 0.31) 107.43%, rgba(143, 10, 10, 0.00) 145.71%), #2E2E2E",
        }}
      >
        <NextImage 
          src={AirBalloonBackground}
          alt="unauth-profile-bg-1"
          className="absolute top-[-100px] left-[-120px] z-[-1] pointer-events-none"
        />
        <NextImage 
          src={AirBalloonBackground}
          alt="unauth-profile-bg-2"
          className="absolute top-[-20px] right-0 z-[-1] pointer-events-none"
          width={140}
        />
        <NextImage 
          src={AirBalloonBackground}
          alt="unauth-profile-bg-2"
          className="absolute bottom-[-40px] right-[60px] z-[-1] pointer-events-none"
          width={180}
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <h3 className={`${manrope600.className} text-[18px]`}>Connect and Join our</h3>
          <h1 className={`${roboto400.className} text-[40px]`}>{state.clientProject?.token_name} Airdrop Now!</h1>
        </div>
        <ConnectButton.Custom>
          {({
            account,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== 'loading';

            if(account?.address && !token) return (
              <ThemeButton 
                color="warning" 
                radius="full" 
                onClick={() => loginService(getSignMessage(), account.address)}
                isLoading={isSignatureLoading}
              >
                Get Signature
              </ThemeButton>
            )
            else return (
              <ThemeButton
                size="sm"
                radius="full"
                variant="solid"
                color="warning"
                isLoading={authenticationStatus === 'loading'}
                isDisabled={!ready}
                onClick={openConnectModal}
              >
                {ready ? "Connect Wallet" : "Please wait ..."}
              </ThemeButton>
            )
          }}
        </ConnectButton.Custom>
      </div>
    )
  }
  
  const conditionalQuestRenderer = () => {
    if(state.questTab === QuestTabEnum.ONGOING_CAMPAIGN) {
      if(questboardPaginate.length > 0) return (
        <div className="flex flex-col gap-10">
          {questboardPaginate.map((questboard, index) =>
            <ProjectQuestboardItem 
              questboard={questboard}
              index={index}
              key={questboard.questBoardId ?? index}
              getMissionAvatar={getMissionAvatar}
              renderMissionByType={renderMissionByType}
              project={props.project}
            />
          )}
          <ThemePagination
            showControls
            classNames={{
              cursor: "bg-foreground text-background",
            }}
            color="default"
            isDisabled={false}
            page={state.questboardPage}
            total={questboards.length / CONSTANT.PAGINATION_QUESTBOARD_DEFAULT_LIMIT}
            variant="light"
            onChange={(questboardPage)=>dispatch({questboardPage})}
          />
        </div>
      )
      else return (
        <div className="flex flex-col gap-10">
          <div className={`flex items-center justify-center p-12 border-1 rounded-lg border-gray-600 border-dashed ${isLight ? "text-black" : "text-white"}`}>No Questboard items to display</div>
        </div>
      )
    }
    else return (
      <Fragment>
        <h2 className={`${manrope800.className} text-[42px]`}>Single Quest List</h2>
        <ThemeAccordion variant="splitted" className="px-0">
          {anotherMissions.map((mission, index) =>
            <AccordionItem
              key={index}
              title={
                <div className="flex flex-row items-center justify-between w-full">
                  <span>{mission.title ?? mission.data?.label ?? mission.type}</span>
                  <div className={`px-2 bg-[#763AF5] ${isLight ? "text-black-900" : "text-white"} flex items-center justify-center gap-1 ${manrope800.className} text-xl rounded-full min-w-[100px] min-h-[40px]`}>
                    <CustomMilestoneRewardIcon 
                      width="30" 
                      height="30" 
                      imgHref={(mission.data as CustomQuestboard)?.extra_reward_type === StageRewardTypeEnum.USDT ? '/usdt.svg' : '/xp.png'}
                      background={(mission.data as CustomQuestboard)?.extra_reward_type === StageRewardTypeEnum.USDT ? 'green' : 'purple'}
                      imgId={(mission.data as CustomQuestboard)?.extra_reward_type}
                    />
                    <span className="text-[#FFD700]">+{mission.point_reward}</span>
                    <span className="text-white">{(mission.data as CustomQuestboard)?.extra_reward_type}</span>
                  </div>
                </div>
              }
              startContent={
                <ThemeAvatar
                  isBordered
                  color="secondary"
                  radius="full"
                  icon={getMissionAvatar(mission)}
                />
              }
            >
              {renderMissionByType(mission)}
            </AccordionItem>
          )}
        </ThemeAccordion>
      </Fragment>
    )
  }

  const progressBarRenderer = useMemo(()=>{
    let percentages = 0
    let currentIndex = 0

    const CURRENT_FOLLOWERS = state.clientProject?.twitter_follower_count ?? 0

    const clientStages = (state.clientProject?.stages && Array.isArray(state.clientProject?.stages) ? state.clientProject.stages : []) as Array<IBannerProgressStages>
    
    const NEW_STAGES = clientStages
      .sort((a,b) => {
        if(a.sequence > b.sequence) return 1
        else return -1
      })
      .map((stg, index) => {
        const total_transaction_count = stg.total_transaction_count ?? 0
        const target_max_transaction_count = stg.target_max_transaction_count ?? 0
        
        if(currentIndex === index) {
          if(stg.is_transaction_count) {
            if(total_transaction_count >= target_max_transaction_count) {
              percentages += 100/clientStages.length
              stg.is_reached = true
              currentIndex += 1
            }
            else {
              percentages += (total_transaction_count/(target_max_transaction_count ?? 1))*100/clientStages.length
              dispatch({selectedStage: stg})
            }
          }
          else {
            if(CURRENT_FOLLOWERS >= stg.target_max_followers) {
              percentages += 100/clientStages.length
              stg.is_reached = true
              currentIndex += 1
            }
            else {
              percentages += (CURRENT_FOLLOWERS/stg.target_max_followers)*100/clientStages.length
              dispatch({selectedStage: stg})
            }
          }
        }

        return stg
      })

    return (
      <CustomProgressBar 
        aria-label="Banner Progress Bar"
        className="py-8 my-4"
        items={NEW_STAGES}
        renderItem={(item, index) => {
          const isDarken = !item.is_reached

          const icon = () => {
            if(item.icon) return item.icon
            else {
              if(item.type === StageRewardTypeEnum.XP) return "/xp.png"
              else if(item.type === StageRewardTypeEnum.USDT) return "/usdt.png"
              else return undefined
            }
          }

          const TARGET_VALUE = item.is_transaction_count ? (item.target_max_transaction_count ?? 0) : item.target_max_followers

          const getShadowColor = () => {
            if(item.type === StageRewardTypeEnum.USDT) return "hover:shadow-green-500/50"
            else return "hover:shadow-purple-500/50"
          }

          const getBgIcon = () => {
            if(item.background_color) return item.background_color
            else {
              if(item.type === StageRewardTypeEnum.USDT) return "green"
              else return "purple"
            }
          }

          const popoverContents = [
            {label: "Type", value: item.is_transaction_count ? "Transaction Count" : "Followers Count" },
            {label: "Status", value: item.is_reached ? "Reached" : "Not Reached", className: item.is_reached ? "text-success" : "text-danger"},
            {label: "Target", value: `${nFormatter(TARGET_VALUE, 0)} ${item.is_transaction_count ? "Transactions" : "Followers"}`}
          ]

          return (
            <div className="flex flex-row">
              <div className={`flex flex-col ${isLight ? "text-black" : "text-white"} ${isDarken ? 'brightness-50' : ''} ${manrope600.className}`}>
                <span className="text-[12px] font-thin whitespace-nowrap">Stage {index+1}</span>
                <span className="text-[18px]">{nFormatter(TARGET_VALUE, 0)}</span>
              </div>
              <ThemePopover>
                <PopoverTrigger>
                  <div className={`${isDarken ? 'brightness-50' : ''} transition-all w-[110px] h-[110px] max-lg:w-[80px] max-lg:h-[80px] max-md:!w-[40px] max-md:!h-[40px] bg-gradient-to-r from-purple-800 to-yellow-400 rounded-full flex items-center justify-center hover:shadow-xl ${getShadowColor()} cursor-pointer hover:brightness-100`}>
                    <div className="w-[107px] h-[107px] max-lg:w-[77px] max-lg:h-[77px] bg-[#3b0764] rounded-full flex items-center justify-center">
                      <div className="w-[100px] h-[100px] max-lg:w-[70px] max-lg:h-[70px] bg-gradient-to-r from-purple-800 to-yellow-400 rounded-full flex items-center justify-center">
                        <div className="w-[90px] h-[90px] max-lg:w-[60px] max-lg:h-[60px] bg-[#3b0764] rounded-full flex flex-col items-center justify-center">
                          <span className={`${manrope800.className} ${isDarken ? 'text-white' : 'text-[#FFC627]'} text-xl`}>{nFormatter(item.value, 0)}</span>
                          <CustomMilestoneRewardIcon
                            imgHref={icon()}
                            background={getBgIcon()}
                            imgId={`custom-milestone-${index}`}
                            width="50%"
                            height="50%"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className={isLight ? "text-black" : "text-white"}>
                  <div className="px-1 py-2 flex flex-col gap-4">
                    <div className="text-small"><span className="font-bold">Stage {index + 1}</span> Details</div>
                    <div className="flex flex-col gap-2">
                      {popoverContents.map((pc,pcIndex) =>
                        <div key={pcIndex} className="flex flex-row items-center justify-between gap-8">
                          <b className="text-tiny">{pc.label}:</b>
                          <div className={`text-tiny ${pc.className ?? ""}`}>{pc.value}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </ThemePopover>
            </div>
          )
        }}
        value={percentages}
      />
    )
  }, [state.clientProject?.twitter_follower_count, state.clientProject?.stages, isLight])

  const conditionalQuestByQuestboardIdRenderer = useMemo(() => {
    const questboardFinder = questboards.find(qbs=> qbs.questBoardId === questboardId)
    if(questboardFinder) return (
      <QuestboardDetailProject 
        {...questboardFinder} 
        name={state.clientProject?.name}
        project={props.project}
        getMissionAvatar={getMissionAvatar}
        renderMissionByType={renderMissionByType}
        shareLink={shareLink}
      />
    )
    else return (
      <div className="flex flex-col gap-14 lg:p-4" ref={questSectionRef}>
        <div className="flex flex-row items-center gap-2">
          <ThemeButton
            radius="full"
            color={state.questTab === QuestTabEnum.ONGOING_CAMPAIGN ? "warning" : "default"}
            onClick={()=>dispatch({questTab: QuestTabEnum.ONGOING_CAMPAIGN})}
          >
            Ongoing Campaign
          </ThemeButton>
          <ThemeButton
            radius="full"
            color={state.questTab === QuestTabEnum.ONE_OFF_QUEST ? "warning" : "default"}
            onClick={()=>dispatch({questTab: QuestTabEnum.ONE_OFF_QUEST})}
          >
            One-off Quest
          </ThemeButton>
        </div>
        {conditionalQuestRenderer()}
      </div>
    )
  }, [questboards, questboardId, conditionalQuestRenderer()])

  const conditionalAffiliateRenderer = () => {
    if((state.userInfo?.invite_count ?? 0) > 0) return (
      <div
        className="flex flex-col gap-2 backdrop-blur-2xl rounded-xl w-full text-white"
        style={{
          background: "linear-gradient(234deg, rgba(143, 10, 10, 0.00) 23.83%, rgba(42, 0, 111, 0.15) 49.27%, rgba(183, 145, 48, 0.31) 107.43%, rgba(143, 10, 10, 0.00) 145.71%), #2E2E2E",
        }}
      >
        <div className="flex flex-row justify-between gap-2 w-full p-4">
          <div className={`flex flex-col gap-2 text-white ${manrope600.className}`}>
            <span className="text-[14px]">My Invite Link</span>
            <InfoTooltip title={getReferralLink()}>
              <ThemeButton className="text-[18px] text-white" variant="light" endContent={<CopyIcon />} onClick={() => shareLink({type: MetaOGEnum.REFERRAL})}>{middleEllipsisText(getReferralLink(), 12, 5)}</ThemeButton>
            </InfoTooltip>
          </div>
          <div className={`flex flex-col gap-2 text-white ${manrope600.className}`}>
            <span>Up to +50 XP</span>
            <span>For every valid invites</span>
          </div>
        </div>
        <ThemeDivider />
        <div className={`flex flex-col justify-between gap-4 w-full p-4 text-white ${manrope600.className}`}>
          <div className="flex flex-row justify-between gap-4">
            <ThemeButton 
              className="flex flex-col gap-2 h-full text-white items-start"
              variant="light"
              isDisabled={state.isGetReferralList}
              onClick={()=>{
                dispatch({isGetReferralList: true})
                getReferralList(props.project, {Authorization: "Bearer " + token})
                  .then(res => {
                    if(Array.isArray(res.data.data) && res.data.data.length > 0) dispatch({referralList: res.data.data})
                    else toast.info("You don't have any referrals!")
                  })
                  .catch(err => console.log(err))
                  .finally(()=>dispatch({isGetReferralList: false}))
              }}
            >
              <div className="flex flex-row gap-2">
                <ThemeAvatar color="primary" />
                <span className="leading-10 text-[30px]">{numFormatter(state.userInfo?.invite_count ?? 0)}</span>
              </div>
              <span className="text-[14px]">Invited Count</span>
            </ThemeButton>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <CustomMilestoneRewardIcon 
                  imgHref="/xp.png"
                  imgId="invited_xp_icon"
                  width="40"
                  height="40"
                />
                <span className="leading-10 text-[30px]">{numFormatter(state.userInfo?.invited_xp ?? 0)}</span>
              </div>
              <span className="text-[14px]">Invited XP</span>
            </div>
          </div>
          <div className="flex flex-col font-thin text-[10px]">
            <span>Note: Users only quality as succesful referral after</span>
            <span>connecting their wallet and completing social signup</span>
          </div>
        </div>
      </div>
    )
    else return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-[60px] backdrop-blur-2xl rounded-xl w-full text-white overflow-hidden relative"
        style={{
          background: "linear-gradient(234deg, rgba(143, 10, 10, 0.00) 23.83%, rgba(42, 0, 111, 0.15) 49.27%, rgba(183, 145, 48, 0.31) 107.43%, rgba(143, 10, 10, 0.00) 145.71%), #2E2E2E",
        }}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <h3 className={`${manrope600.className} text-[18px]`}>You will never get enough of airdrop</h3>
          <h1 className={`${roboto400.className} text-[40px]`}>Your Friends too!</h1>
        </div>
        <ThemeButton
          size="sm"
          radius="full"
          color="warning"
          onClick={()=>shareWithIntent({type: MetaOGEnum.REFERRAL})}
        >
          Invite Now
        </ThemeButton>
      </div>
    )
  }

  const getCurrentLeaderboardUser = useMemo(() => {
    if(profile && state.userInfo?.data_rank && typeof state.userInfo.data_rank.rank === "number" && state.userInfo.data_rank.rank > 0) return (
      <ThemeButton
        className="flex flex-row items-center justify-between gap-4 p-4 min-h-[80px]"
        onClick={()=>{
          const pageIndex = [...Array(getTotalPaginationPage((state.metaLeaderboards?.total ?? 0) / CONSTANT.PAGINATION_DEFAULT_LIMIT)).keys()].findIndex(key => {
            const MIN_LIMIT = key * CONSTANT.PAGINATION_DEFAULT_LIMIT
            const MAX_LIMIT = (key + 1) * CONSTANT.PAGINATION_DEFAULT_LIMIT

            const currentRank = state.userInfo?.data_rank?.rank ?? 0
            if(currentRank >= MIN_LIMIT && currentRank < MAX_LIMIT) return true
            else return false
          })
          
          if(pageIndex > -1) dispatch({leaderboardPage: pageIndex + 1})
        }}
        disabled={state.isLoadingTable}
        isDisabled={state.isLoadingTable}
      >
        <h3>{state.userInfo?.data_rank?.rank ?? "-"}</h3>
        <div className="flex items-center gap-2">
          <NextImage 
            src={profile?.avatar ?? profile?.twitter?.avatar ?? profile?.telegram?.avatar ?? MetamaskIcon} 
            alt="metamask_icon" 
            width={50}
            height={50}
            className="rounded-full"
          />
          <div>{profile?.name ?? "-"}</div>
        </div>
        <div>{profile?.wallet_address ? middleEllipsisText(profile.wallet_address, 7, 5) : "-"}</div>
        <div>{numFormatter(state.userInfo?.data_rank?.value ?? 0)}</div>
        <div>{state.userInfo?.data_rank?.share}</div>
      </ThemeButton>
    )
    else return null
  }, [state.userInfo, profile, state.metaLeaderboards?.total, state.isLoadingTable])

  const YOU_IN_LEADERBOARD = state.leaderboards.find(d => d.id === profile?.id)

  const tabs: Array<ProjectTab> = [
    {
      key: ActiveTabKey.LEADERBOARD,
      title: "Leaderboard",
      isWrap: true,
      content: (
        <div className="p-2 lg:p-4 flex flex-col lg:flex-row gap-8 justify-between">
          <div className="flex flex-col gap-4 w-full">
            {sectionComponent(<LeaderboardYellowIcon />, "Leaderboard")}
            {getCurrentLeaderboardUser}
            <ThemeTable 
              aria-label="Leaderboard Table"
              removeWrapper 
              bottomContent={
                <ThemePagination
                  showControls
                  classNames={{
                    cursor: "bg-foreground text-background",
                  }}
                  color="default"
                  isDisabled={false}
                  page={state.leaderboardPage}
                  total={(state.metaLeaderboards?.total ?? 0) / CONSTANT.PAGINATION_DEFAULT_LIMIT}
                  variant="light"
                  onChange={(leaderboardPage)=>dispatch({leaderboardPage})}
                />
              }
              bottomContentPlacement="inside"
              selectionMode="single"
              selectedKeys={YOU_IN_LEADERBOARD?.id ? [YOU_IN_LEADERBOARD.id] : []}
            >
              <TableHeader>
                <TableColumn key="rank">Rank</TableColumn>
                <TableColumn key="name">Name</TableColumn>
                <TableColumn key="wallet">Wallet</TableColumn>
                <TableColumn key="type">
                  Point
                  {/* <ThemeSelect 
                    aria-label="Leaderboard Select"
                    size="sm" 
                    defaultSelectedKeys={new Set([state.leaderboardType])} 
                    selectedKeys={new Set([state.leaderboardType])}
                    onSelectionChange={(keys) => {
                      if(keys instanceof Set) {
                        const value = keys.values()
                        const finalValue = value.next().value
                        dispatch({
                          leaderboardType: finalValue,
                          leaderboardPage: 1
                        })
                      }
                    }}
                  >
                    {Object.entries(LeaderboardTypeEnum).map(([label,value]) => <SelectItem key={value} value={value} textValue={label.replace(/_/g, " ").toUpperCase()} aria-label={label}>{label.replace(/_/g, " ").toUpperCase()}</SelectItem>)}
                  </ThemeSelect> */}
                </TableColumn>
                <TableColumn key="share">Share</TableColumn>
              </TableHeader>
              <TableBody 
                emptyContent="No rows to display."
                items={getLeaderboardDatas}
                loadingContent={
                  <div className="bg-gray-900/25 w-full h-full relative">
                    <div className="absolute -translate-x-1/2 left-1/2 -translate-y-1/2 top-1/2">
                      <LoadingComponent />
                    </div>
                  </div>
                }
                isLoading={state.isLoadingTable}
              >
                {(data) => 
                  <TableRow key={data.id}>
                    <TableCell>{data.rank}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden">
                        <NextImage 
                          src={data.avatar ?? data.twitter_avatar ?? MetamaskIcon} 
                          alt="metamask_icon" 
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>{data.name ?? "-"}</div>
                    </TableCell>
                    <TableCell>{data.wallet_address ? middleEllipsisText(data.wallet_address, 7, 5) : "-"}</TableCell>
                    <TableCell>{numFormatter(data.value ?? 0)}</TableCell>
                    {/* <TableCell>{getLeaderboardPercentage(Number(data.value))}%</TableCell> */}
                    <TableCell>{data.share}</TableCell>
                  </TableRow>
                }
              </TableBody>
            </ThemeTable>
          </div>
          <div className="flex flex-col gap-4 w-full">
            {sectionComponent(<ProfileYellowIcon />, "My Profile")}
            {conditionalProfileRenderer()}
            {referralMission &&
              <Fragment>
                {sectionComponent(<AffiliateYellowIcon />, "Affiliate")}
                {conditionalAffiliateRenderer()}
              </Fragment>
            }
          </div>
        </div>
      )
    },
    // {
    //   key: ActiveTabKey.LUCKY_SPIN,
    //   title: "Lucky Spin",
    //   isWrap: true,
    //   isDisabled: !state.clientProject?.is_lucky_wheel_feature,
    //   content: (
    //     <LuckyWheel 
    //       depedencyList={[state.selectedTab]}
    //       loading={state.isLuckyWheelLoading}
    //       items={LUCKY_WHEEL_ITEM}
    //       renderItem={(item)=>(
    //         <div className={item.item.type_reward === LuckyWheelTypesEnum.CUSTOM ? wheelStyles['lucky-spin-segment'] : wheelStyles['lucky-spin-segment-reverse']}>
    //           {item.item.type_reward === LuckyWheelTypesEnum.CUSTOM && item.item.marketplaceId?.photo ?
    //             <div className={wheelStyles['image-nft-wrapper']}>
    //               <NextImage 
    //                 src={item.item.marketplaceId.photo}
    //                 alt={item.item.marketplaceId.name}
    //                 width={state.innerWidth < 600 ? 30 : 40}
    //                 height={state.innerWidth < 600 ? 30 : 40}
    //                 className="rounded-full overflow-hidden"
    //               />
    //             </div>
    //             :
    //             <NextImage 
    //               src={getLWIcon(item.item)}
    //               alt={item.item.type_reward}
    //               width={state.innerWidth < 600 ? 15 : 25}
    //               height={state.innerWidth < 600 ? 15 : 25}
    //               className="rounded-full overflow-hidden"
    //             />
    //           }
    //           <div>{getLWLabel(item.item)}</div>
    //         </div>
    //       )}
    //       onSpin={moreSpinHandler}
    //       onReSpin={(callback) => moreSpinHandler((vals)=>callback(vals[0]))}
    //       onFinish={(selectedValue: string) => {
    //         const finder = LUCKY_WHEEL_ITEM.find(lwi => lwi.value === selectedValue)
            
    //         dispatch({ 
    //           selectedSpinReward: finder?.item,
    //           isLuckyWheelLoading: false
    //         })

    //         if(token) getUserInfo(props.project, {Authorization: "Bearer " + token}, {type_leaderboard: state.leaderboardType})
    //           .then(res => dispatch({userInfo: res.data.data}))
    //           .catch(err => console.log(err))
    //       }}
    //       customRenderer={(main, callback) => (
    //         <Fragment>
    //           <div className={`flex flex-col-reverse xl:flex-row gap-4 w-full overflow-hidden ${wheelStyles['lucky-spin-tab']}`}>
    //             <div className="flex flex-col gap-2 w-full">
    //               <LuckyWheelHeader />
    //               {main}
    //             </div>
    //             <div className="flex flex-col gap-2 w-full">
    //               <div 
    //                 className="flex flex-col gap-2 backdrop-blur-2xl rounded-xl w-full"
    //                 style={{
    //                   background: "linear-gradient(234deg, rgba(143, 10, 10, 0.00) 23.83%, rgba(42, 0, 111, 0.15) 49.27%, rgba(183, 145, 48, 0.31) 107.43%, rgba(143, 10, 10, 0.00) 145.71%), #2E2E2E",
    //                 }}
    //               > 
    //                 <div className="p-4 flex flex-row items-center justify-between w-full">
    //                   <div className="flex flex-row items-center gap-2">
    //                     <ThemeAvatar radius="full" size="lg" src={profile?.avatar ?? "/metamask.png"} />
    //                     <div className={`flex flex-col gap-1 text-white ${manrope700.className}`}>
    //                       <span className="text-[14px]">Username</span>
    //                       <span className="text-[29px] font-bold leading-8">{getDisplayName()}</span>
    //                     </div>
    //                   </div>
    //                   <ThemeButton 
    //                     variant="light" 
    //                     className="flex flex-row items-center gap-2 h-full text-white" 
    //                     radius="full"
    //                     onClick={inventoryGetService}
    //                     disableRipple
    //                     isDisabled
    //                   >
    //                     <ThemeAvatar 
    //                       size="md" 
    //                       icon={<RedeemIcon />} 
    //                       className="bg-[#2F0D59]" 
    //                       isBordered color="secondary" 
    //                     />
    //                     <span className="text-[20px]">Redeem</span>
    //                   </ThemeButton>
    //                 </div>
    //                 <ThemeDivider />
    //                 <div className="p-4 flex flex-row justify-between">
    //                   <div className="flex flex-row gap-2">
    //                     <CustomMilestoneRewardIcon 
    //                       imgHref="/xp.png"
    //                       imgId="community_xp"
    //                       width="37"
    //                       height="37"
    //                     />
    //                     <div className={`flex flex-col gap-1 text-white ${manrope600.className}`}>
    //                       <span className="leading-8 text-[30px]">{numFormatter(state.userInfo?.point ?? 0)}</span>
    //                       <span className="text-[12px]">{state.clientProject?.name} XP</span>
    //                     </div>
    //                   </div>
    //                   <div className="flex flex-row gap-2">
    //                     <ZealySmallIcon />
    //                     <div className={`flex flex-col gap-1 text-white ${manrope600.className}`}>
    //                       <span className="leading-8 text-[30px]">{numFormatter(state.userInfo?.zealy_xp ?? 0)}</span>
    //                       <span className="text-[12px]">Zealy XP</span>
    //                     </div>
    //                   </div>
    //                   <div className="flex flex-row gap-2">
    //                     <SpinIcon />
    //                     <div className={`flex flex-col gap-1 text-white ${manrope600.className}`}>
    //                       <span className="leading-8 text-[30px]">{numFormatter(state.userInfo?.free_spin ?? 0)}</span>
    //                       <span className="text-[12px]">Spins</span>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //               <div className={`${isLight ? "text-black" : "text-white"} ${manrope800.className} text-[55px]`}>
    //                 Get Extra Spins!
    //               </div>
    //               <div>
    //                 <ThemeButton 
    //                   radius="full" 
    //                   startContent={<UploadIcon />}
    //                   onClick={() => shareWithIntent({
    //                     type: MetaOGEnum.LUCKYWHEEL
    //                   })}
    //                   isLoading={state.isLuckyWheelLoading}
    //                   isDisabled={state.isLuckyWheelLoading}
    //                 >
    //                   Share
    //                 </ThemeButton>
    //               </div>
    //               <ThemeDivider className="my-4" />
    //               <div className="flex flex-row items-center gap-2">
    //                 <ThemeButton 
    //                   radius="full" 
    //                   color="warning" 
    //                   onClick={()=>moreSpinHandler(callback)}
    //                   isLoading={state.isLuckyWheelLoading}
    //                   isDisabled={state.isLuckyWheelLoading}
    //                 >
    //                   Spin Now
    //                   </ThemeButton>
    //                 <ThemeButton 
    //                   radius="full" 
    //                   onClick={()=>dispatch({isConvertionModal: true})}
    //                   isLoading={state.isLuckyWheelLoading}
    //                   isDisabled={state.isLuckyWheelLoading}
    //                 >
    //                   Get More Spins
    //                 </ThemeButton>
    //               </div>
    //             </div>
    //           </div>
    //           <SpinRewardPublicModal 
    //             isOpen={!!state.selectedSpinReward} 
    //             onClose={()=>dispatch({selectedSpinReward: undefined})}
    //             selectedSpinReward={state.selectedSpinReward} 
    //             userInfo={state.userInfo}
    //             onSpin={()=>{
    //               if((state.userInfo?.free_spin ?? 0) > 0) {
    //                 moreSpinHandler(callback)
    //                 if(state.userInfo) dispatch({
    //                   selectedSpinReward: undefined,
    //                   userInfo: {
    //                     ...state.userInfo,
    //                     free_spin: state.isAvailableFreeSpin ? state.userInfo.free_spin : state.userInfo.free_spin - 1,
    //                   },
    //                   isAvailableFreeSpin: false
    //                 })
    //               }
    //               else {
    //                 dispatch({
    //                   isConvertionModal: true,
    //                   selectedSpinReward: undefined
    //                 })
    //               }
    //             }}
    //             onShare={() => state.selectedSpinReward?._id && shareWithIntent({
    //               type: MetaOGEnum.LUCKYWHEEL_PRIZE,
    //               luckyWheelId: state.selectedSpinReward._id
    //             })}
    //           />
    //           <SpinConvertionPublicModal 
    //             isLoading={state.isLuckyWheelLoading}
    //             isOpen={state.isConvertionModal} 
    //             onClose={()=>dispatch({isConvertionModal: false})}
    //             clientProject={state.clientProject}
    //             onSelectConvertion={(convertion) => {
    //               const isValidConvert = (() => {
    //                 if(state.isLuckyWheelConsumesZealyXP) {
    //                   if((state.userInfo?.zealy_xp ?? 0) >= convertion.amount_consumption) return true
    //                   else return false
    //                 }
    //                 else {
    //                   if((state.userInfo?.point ?? 0) >= convertion.amount_consumption) return true
    //                   else return false
    //                 }
    //               })()
                  
    //               if(isValidConvert) {
    //                 dispatch({isLuckyWheelLoading: true})
    //                 luckyWheelConvertSpin(props.project, {
    //                   amount_spin: convertion.amount_spin,
    //                   type_point: state.isLuckyWheelConsumesZealyXP ? TypePointEnum.ZEALY : TypePointEnum.XP
    //                 })
    //                   .then(() => {
    //                     openModal({
    //                       type: AlertModalType.SUCCESS,
    //                       title: "Success!",
    //                       description: `Successfully convert ${convertion.amount_spin} spins!`
    //                     })
        
    //                     if(state.userInfo) dispatch({
    //                       userInfo: {
    //                         ...state.userInfo,
    //                         free_spin: (state.userInfo?.free_spin ?? 0) + convertion.amount_spin,
    //                         point: !state.isLuckyWheelConsumesZealyXP ? state.userInfo.point - convertion.amount_consumption : state.userInfo.point,
    //                         zealy_xp: state.isLuckyWheelConsumesZealyXP ? state.userInfo.zealy_xp - convertion.amount_consumption : state.userInfo.zealy_xp,
    //                       },
    //                       isConvertionModal: false
    //                     })
    //                   })
    //                   .catch(err => console.log(err))
    //                   .finally(()=>dispatch({isLuckyWheelLoading: false}))
    //               }
    //               else openModal({
    //                 type: AlertModalType.ERROR,
    //                 title: "Failed!",
    //                 description: "Your XP is not enough!"
    //               })
    //             }}
    //             isZealyConsume={state.isLuckyWheelConsumesZealyXP}
    //             onChangeConsume={(isLuckyWheelConsumesZealyXP) => dispatch({isLuckyWheelConsumesZealyXP})}
    //           />
    //         </Fragment>
    //       )}
    //     />
    //   )
    // },
    {
      key: ActiveTabKey.QUEST,
      title: "Quest",
      isNew: true,
      isWrap: true,
      content: conditionalQuestByQuestboardIdRenderer
    },
    {
      key: ActiveTabKey.SOCIAL_RAID,
      title: "Social Raid",
      isDisabled: !state.clientProject?.is_social_raid_feature,
      isWrap: true,
      content: (() => {
        if(profile?.twitter?.username) {
          const isActiveSRMissions = (state.socialRaidMissions ?? []).filter(sr => {
            if(!sr.is_claimed && (sr.end_redemption_date && (new Date() <= new Date(sr.end_redemption_date)))) return true
            else return false
          })
          const isClaimedSRMissions = (state.socialRaidMissions ?? []).filter(sr => sr.is_claimed === true)
          const isExpiredSRMissions = (state.socialRaidMissions ?? []).filter(sr => {
            if(!sr.is_claimed && (sr.end_redemption_date && (new Date() > new Date(sr.end_redemption_date)))) return true
            else return false
          })
          return (
            <div className="flex flex-col lg:flex-row gap-4 lg:p-4">
              <div className="flex flex-col gap-6 w-full">
                {sectionComponent(<ConnectIcon width="15" height="15" />, "Available Missions")}
                {isActiveSRMissions.length > 0 ? 
                  <ThemeAccordion variant="splitted">
                    {isActiveSRMissions.map((sr, index) =>
                      <AccordionItem key={index} aria-label={sr.title} title={sr.title}>
                        <div className="flex flex-col gap-2">
                          {sr.data_post?.url_post &&
                            <NextLink href={sr.data_post?.url_post} target="_blank" className="flex flex-row gap-2 transition-all hover:bg-zinc-950 rounded-xl p-4">
                              <ThemeAvatar
                                size="lg"
                                radius="full"
                                src={sr.data_post?.avatar}
                              />
                              <div className="flex flex-col">
                                <div className="flex flex-row items-end gap-2">
                                  <h3 className={`${dmSans700.className}`}>{sr.data_post?.name}</h3>
                                  <h3 className={`${dmSans400.className} text-[#A1A1A1]`}>@{sr.data_post?.username}</h3>
                                  <h3 className={`${dmSans400.className} text-[#A1A1A1]`}>.</h3>
                                  <h3 className={`${dmSans400.className} text-[#A1A1A1]`}>{sr.start_redemption_date && dateFromNow(sr.start_redemption_date)}</h3>
                                </div>
                                <h2 className={`${dmSans400.className} text-[#A1A1A1]`}>{sr.data_post?.post}</h2>
                              </div>
                            </NextLink>
                          }
                          <div className="flex flex-row items-center justify-between overflow-hidden">
                            <div className={`flex flex-row items-center gap-1 ${dmSans700.className} text-2xl`}>
                              <h3>Reward:</h3>
                              <CustomMilestoneRewardIcon 
                                imgHref={sr.data?.rewardType === StageRewardTypeEnum.XP ? "/xp.png" : "/usdt.png"}
                                imgId={`social-raid-reward-${index}`}
                                background={sr.data?.rewardType === StageRewardTypeEnum.XP ?"purple" : "green"}
                                width="27"
                                height="27"
                              />
                              <h3>{sr.data?.rewardType === StageRewardTypeEnum.XP ? sr.point_reward : sr.usdt_reward}</h3>
                            </div>
                            {sr.start_redemption_date && sr.end_redemption_date &&
                              <CountdownCircle 
                                startDate={new Date(sr.start_redemption_date)}
                                endDate={new Date(sr.end_redemption_date)}
                              />
                            }
                          </div>
                        </div>
                      </AccordionItem>
                    )}
                  </ThemeAccordion>
                  : <div className={`flex items-center justify-center p-12 border-1 rounded-lg border-gray-600 border-dashed ${isLight ? "text-black" : "text-white"}`}>No Active Missions to display</div>
                }
              </div>
              <div className="flex flex-col gap-6 w-full">
                <ThemeTabs 
                  selectedKey={state.selectedSocialRaidTab}
                  onSelectionChange={(key) => dispatch({selectedSocialRaidTab: key as SocialRaidKey})}
                >
                  <Tab key={SocialRaidKey.COMPLETED} title={SocialRaidKey.COMPLETED} />
                  <Tab key={SocialRaidKey.EXPIRED} title={SocialRaidKey.EXPIRED} />
                </ThemeTabs>
                <div className="flex flex-col gap-4">
                  {(state.selectedSocialRaidTab === SocialRaidKey.COMPLETED ? isClaimedSRMissions : isExpiredSRMissions).length === 0 && <div className={`flex items-center justify-center p-12 border-1 rounded-lg border-gray-600 border-dashed ${isLight ? "text-black" : "text-white"}`}>No {state.selectedSocialRaidTab} Missions to display</div>}
                  {(state.selectedSocialRaidTab === SocialRaidKey.COMPLETED ? isClaimedSRMissions : isExpiredSRMissions).map((sr, index) =>
                    sr.data_post?.url_post && 
                    <NextLink key={index} href={sr.data_post?.url_post} target="_blank" className={`transition-all hover:bg-zinc-950 ${state.selectedSocialRaidTab === SocialRaidKey.EXPIRED ? 'opacity-25' : ''} rounded-xl border border-gray-800 p-4 flex flex-row items-center justify-between`}>
                      <div className="flex flex-col">
                        <h2 className={`${dmSans700.className} text-2xl`}>{sr.title}</h2>
                        <div className={`${dmSans400.className} text-md flex flex-row items-center gap-1`}>
                          <span>Reward:</span>
                          <CustomMilestoneRewardIcon 
                            imgHref={sr.data?.rewardType === StageRewardTypeEnum.XP ? "/xp.png" : "/usdt.png"}
                            imgId={`social-raid-reward-${index}`}
                            background={sr.data?.rewardType === StageRewardTypeEnum.XP ?"purple" : "green"}
                            width="27"
                            height="27"
                          />
                          <span>{sr.data?.rewardType === StageRewardTypeEnum.XP ? sr.point_reward : sr.usdt_reward}</span>
                        </div>
                      </div>
                      {state.selectedSocialRaidTab === SocialRaidKey.COMPLETED ? <SocialRaidAcceptedIcon /> : <SocialRaidDeclinedIcon />}
                    </NextLink>
                  )}
                </div>
              </div>
            </div>
          )
        }
        else return (
          <div className="flex flex-col items-center justify-center gap-2 min-h-[400px]">
            <h1 className={`${dmSans700.className} text-2xl max-w-[250px] text-center`}>Must Connect Your Twitter Account</h1>
            <h3 className={`${dmSans400.className}`}>To access missions and earn more rewards</h3>
            <ThemeButton
              radius="full"
              startContent={<TwitterXIcon width="18" height="18" />}
              color={profile?.twitter?.username ? "success" : "default"}
              onClick={()=>{
                twitterAuth({
                  authorization: "Bearer " + token,
                  redirect_url: state.locationHref
                })
              }}
            >
              {profile?.twitter?.username ?? "Connect Twitter"}
            </ThemeButton>
          </div>
        )
      })()
    },
  ]

  return (
    <Fragment>
      <OuterWrapper className="py-6">
        <Inner2Wrapper className="flex flex-col gap-6">
          <div 
            className={`backdrop-blur-2xl transition-all rounded-3xl p-14 flex flex-col gap-8 relative ${isLight ? "border-black border-2" : ""}`} 
            style={{
              background: isLight ? "radial-gradient(174.89% 234.86% at 65.73% -89.24%, rgba(143, 10, 10, 0.00) 26.33%, rgba(49, 0, 111, 0.07) 70.12%, rgba(183, 145, 48, 0.10) 87.67%, rgba(143, 10, 10, 0.00) 100%), #FFF" : "radial-gradient(174.89% 234.86% at 65.73% -89.24%, rgba(143, 10, 10, 0.00) 26.33%, rgba(49, 0, 111, 0.46) 70.12%, rgba(183, 145, 48, 0.08) 87.67%, rgba(143, 10, 10, 0.00) 100%), #050505"
            }}
          >
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 w-full">
              <div className="flex flex-col gap-6">
                <div className="flex flex-row items-center gap-4">
                  <ThemeAvatar radius="sm" size="lg" src={state.clientProject?.logo} />
                  <span className={`${isLight ? "text-black-900" : "text-white"} ${dmSans700.className} text-5xl`}>{state.clientProject?.name ?? '-'}</span>
                </div>
                <div className="text-white flex flex-row items-center gap-4">
                  {state.clientProject?.url &&
                    <NextLink className="flex flex-row items-center gap-2" href={state.clientProject?.url} target="_blank">
                      <LinkIcon width="30" height="30" />
                      <span className={isLight ? "text-black" : "text-white"}>{state.clientProject?.url.replace(/^https?:\/\//, '').replace(/\/$/, '') ?? `URL`}</span>
                    </NextLink>
                  }
                  {state.clientProject?.twitter?.username &&
                    <NextLink className="flex flex-row items-center gap-2" href={`https://twitter.com/${state.clientProject.twitter.username}`} target="_blank">
                      <XIcon width="30" height="30" />
                      <span className={isLight ? "text-black" : "text-white"}>{state.clientProject.twitter.username}</span>
                    </NextLink>
                  }
                  {state.clientProject?.discord?.server_id &&
                    <NextLink className="flex flex-row items-center gap-2" href={`https://discord.com/channels/${state.clientProject.discord.server_id}`} target="_blank">
                      <div className="bg-black w-[30px] h-[30px] rounded-full flex items-center justify-center"><DiscordIcon opacity="1" width="18" height="18" /></div>
                      <span className={isLight ? "text-black" : "text-white"}>Discord</span>
                    </NextLink>
                  }
                  {state.clientProject?.telegram?.username_group &&
                    <NextLink className="flex flex-row items-center gap-2" href={`https://t.me/${state.clientProject.telegram.username_group}`} target="_blank">
                      <div className="bg-black w-[30px] h-[30px] rounded-full flex items-center justify-center"><TelegramIcon opacity="1" width="18" height="18" /></div>
                      <span className={isLight ? "text-black" : "text-white"}>@{state.clientProject.telegram.username_group ?? `Telegram`}</span>
                    </NextLink>
                  }
                </div>
              </div>
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
                <div className="flex flex-col gap-1 p-2 rounded-xl">
                  <span className={`${isLight ? "text-black-900" : "text-white"} text-xl ${manrope600.className}`}>Accumulated XP Jackpot</span>
                  <div className={`flex flex-row items-center p-3 rounded-2xl gap-4 ${isLight ? 'bg-white-900 border-black border-2' : 'bg-gray-800'} w-[350px] max-xl:w-full`}>
                    <MarketplaceXP2Icon />
                    <span className={`${isLight ? "text-black-900" : "text-white"} text-5xl text-ellipsis overflow-hidden ${manrope700.className}`}>{numFormatter(state.clientProject?.accumulatedPoints?.total_point ?? 0)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 p-2 rounded-xl">
                  <span className={`${isLight ? "text-black-900" : "text-white"} text-xl ${manrope600.className}`}>Current {state.selectedStage?.is_transaction_count ? 'Milestones' : 'Followers'}</span>
                  <div className={`flex flex-row items-center p-3 rounded-2xl gap-4 ${isLight ? 'bg-white-900 border-black border-2' : 'bg-gray-800'} w-[350px] max-xl:w-full`}>
                    {state.selectedStage?.is_transaction_count ? <LinkIcon width="61" height="61" /> : <TwitterXBlackIcon />}
                    <span className={`${isLight ? "text-black-900" : "text-white"} text-5xl text-ellipsis overflow-hidden ${manrope700.className}`}>{numFormatter(state.selectedStage?.is_transaction_count ? (state.selectedStage?.total_transaction_count ?? 0) : (state.clientProject?.twitter_follower_count ?? 0))}</span>
                  </div>
                </div>
              </div>
            </div>
            {progressBarRenderer}
            <div className={`w-full text-center text-xl ${isLight ? "text-black-900" : "text-white"} ${manrope600.className}`}>
              <span className={`${manrope800.className}`}>Maximise Your XP</span> and Exchange for <span className={`${manrope800.className}`}>{state.clientProject?.token_name ?? state.clientProject?.name} Token</span> today!
            </div>
            {state.userInfo?.referral_code &&
              <div className="absolute bottom-[10px] right-[10px]">
                <ThemeDropdown placement="bottom-end">
                  <DropdownTrigger>
                    <ThemeButton
                      radius="full"
                      startContent={<UploadIcon />}
                      size="sm"
                    >
                      Share
                    </ThemeButton>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem
                      startContent={<XIcon />}
                      onClick={()=>shareWithIntent({type: MetaOGEnum.REFERRAL})}
                    >
                      X
                    </DropdownItem>
                    <DropdownItem
                      startContent={<LinkIcon />}
                      onClick={()=>shareLink({type: MetaOGEnum.REFERRAL})}
                    >
                      Referral Link
                    </DropdownItem>
                  </DropdownMenu>
                </ThemeDropdown>
              </div>
            }
          </div>
          {state.clientProject?.is_lucky_wheel_feature &&
            <ThemeButton 
              className="h-full transition-all flex items-center justify-center w-full bg-[#1A1A1A] rounded-xl bg-[url('/confetti.png')] bg-center bg-no-repeat overflow-hidden cursor-pointer"
              onClick={()=>{
                dispatch({selectedTab: ActiveTabKey.LUCKY_SPIN})
                smoothScroll("tab", topBarHeight)
              }}
            >
              <div className="flex items-center justify-between lg:gap-4 px-4 lg:px-0 relative">
                <NextImage 
                  src={SplashCoin}
                  alt="splash-bg"
                  className="mix-blend-screen opacity-[0.9] absolute left-[-38%] pointer-events-none z-0"
                />
                <MainIconProject />
                <div className="flex flex-col leading-10">
                  <h1 className="text-[#FFD700] text-[20px] lg:text-[40px] font-semibold">More Rewards</h1>
                  <h1 className="text-white text-[20px] lg:text-[40px] font-semibold">Are On The Way!</h1>
                </div>
                <Button 
                  color="warning" 
                  radius="full"
                  onClick={()=>{
                    dispatch({selectedTab: ActiveTabKey.LUCKY_SPIN})
                    smoothScroll("tab", topBarHeight)
                  }}
                >
                  Try My Luck!
                </Button>
              </div>
            </ThemeButton>
          }
          <div className="flex flex-row items-center justify-between gap-6 max-md:flex-col">
            {centerContents.map((content, index) =>
              <div
                key={index}
                className={`h-full flex flex-row items-center justify-start gap-6 p-6 max-lg:p-4 w-full shadow-lg rounded-lg ${isLight ? 'bg-white text-black' : 'bg-[#31006F] text-white'}`}
                color="secondary"
                // isDisabled={content.isDisabled}
                onClick={() => !content.isDisabled && content.onClick?.()}
              >
                <div 
                  className="w-[90px] h-[90px] max-lg:w-[60px] max-lg:h-[60px] rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(74deg, #FFC21A 21.16%, #F3E8B3 82.27%)",
                    filter: "drop-shadow(0px 0px 15px #D1B53A)"
                  }}
                >
                  <NextImage 
                    src={content.icon}
                    alt={content.title}
                    style={{ objectFit: 'contain' }}
                    // width={70}
                    // height={70}
                  />
                </div>
                <div className="flex flex-col items-start justify-between gap-4 max-lg:gap-2">
                  <h1 className={`${manrope700.className} text-[38px] max-lg:text-[24px]`}>{content.title}</h1>
                  <h3 className={`${roboto400.className} text-[16px] max-lg:text-[12px] whitespace-normal text-left`}>{content.description}</h3>
                </div>
              </div>
            )}
          </div>
          <div className="relative" id="tab" ref={refTab}>
            <ThemeTabs 
              className="float-right"
              selectedKey={state.selectedTab} 
              disabledKeys={tabs.filter(tab => tab.isDisabled).map(tab => tab.key)}
              onSelectionChange={(key) => dispatch({selectedTab: key as ActiveTabKey})}
            >
              {tabs.map((tab, _index) =>
                <Tab 
                  key={tab.key} 
                  title={
                    <span className="flex items-center space-x-2">
                      {tab.isDisabled && <LockIcon />}
                      <span>{tab.title}</span>
                      {tab.isNew && <AlertIcon />}
                    </span>
                  }
                />
              )}
            </ThemeTabs>
          </div>
          {tabs.map((tab, index) =>
            tab.isWrap ?
            <ThemeCard key={index} className={`${state.selectedTab === tab.key ? "block" : "hidden"}`}>
              <CardBody>
                {tab.content}
              </CardBody>
            </ThemeCard>
            :
            <div key={index} className={`${state.selectedTab === tab.key ? "block" : "hidden"}`}>{tab.content}</div>
          )}
        </Inner2Wrapper>
      </OuterWrapper>
      <JoinHypequestPublicModal clientProject={state.clientProject} isOpen={state.isPublicModal === PublicModal.JOIN} onClose={()=>dispatch({isPublicModal: undefined})} />
      <WelcomeHypequestPublicModal referralMission={referralMission} clientProject={state.clientProject} referrer={state.referrerInfo} isOpen={!!state.referrerInfo} onClose={()=>dispatch({referrerInfo: undefined})} />
      <ConnectHypequestPublicModal 
        project={props.project} 
        clientProject={state.clientProject}
        platformConnectMissions={platformConnectMissions} 
        isOpen={state.isPublicModal === PublicModal.CONNECT} 
        onClose={()=>dispatch({isPublicModal: undefined})} 
        onCallback={() => {
          if(token) {
            getAllMission(props.project, {Authorization: "Bearer " + token})
              .then(res => dispatch({missions: res?.data?.data ?? []}))
              .catch(err => console.log(err))

            getUserInfo(props.project, {Authorization: "Bearer " + token}, {type_leaderboard: state.leaderboardType})
              .then(res => dispatch({userInfo: res?.data?.data}))
              .catch(err => console.log(err))
          }
        }}
        referralLink={getReferralLink()}
        shareLink={shareLink}
      />
      <InventoryPublicModal 
        inventories={state.inventories} 
        isOpen={state.inventories.length > 0} 
        onClose={()=>dispatch({inventories: []})}
        onSelectedInventory={(selectedInventory) => dispatch({selectedInventory})}
      />
      <SelectedInventoryPublicModal 
        isOpen={!!state.selectedInventory}
        onClose={()=>dispatch({selectedInventory: undefined})}
        inventory={state.selectedInventory}
        isLoading={state.isRedeemLoading}
        onRedeem={inventoryRedeemService}
      />
      <ThemeModal
        isOpen={!!invite_code && !!state.inviterAdmin}
        onClose={ignoreAdminInvite}
        size="xl"
      >
        <ModalContent>
          <NextImage 
            src={coinsBackground}
            alt="coins-bg"
            className="absolute top-0 left-0 right-0 pointer-events-none z-[-1]"
          />
          <ThemeModalHeader></ThemeModalHeader>
          <ThemeModalBody className="flex flex-col items-center justify-center gap-4">
            <h1 className={`${manrope800.className} text-[40px]`}>You&apos;re Invited!</h1>
            <h3 className={`${roboto400.className} text-[20px] text-center max-w-[300px]`}>You have been invited to become an admin.</h3>
            <div className={`${manrope800.className} text-[30px] bg-gray-800 rounded-xl p-4`}>{state.clientProject?.name}</div>
            <h2 className={`${roboto400.className} text-[20px] text-center`}>Inviter:</h2>
            <div className="flex flex-row items-center gap-4">
              <ThemeAvatar 
                size="lg"
                radius="full"
                src={state.inviterAdmin?.avatar}
              />
              <h1 className={`${manrope800.className} text-[30px]`}>{state.inviterAdmin?.name}</h1>
            </div>
            <div className="flex flex-row items-center justify-between gap-2 w-full mt-8">
              <ThemeButton
                className="w-full"
                onClick={ignoreAdminInvite}
              >
                Ignore
              </ThemeButton>
              <ConnectButton.Custom>
                {({
                  account,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';

                  if(account?.address && !token) return (
                    <ThemeButton
                      color="success"
                      className="w-full"
                      isLoading={isSignatureLoading}
                      isDisabled={isSignatureLoading}
                      onClick={() => loginService(getSignMessage(), account.address, (lr) => joinAdminInvite(lr.auth_token))}
                    >
                      Get Signature
                    </ThemeButton>
                  )
                  else if(account?.address && token) return (
                    <ThemeButton
                      color="success"
                      className="w-full"
                      isLoading={isSignatureLoading}
                      isDisabled={isSignatureLoading}
                      onClick={() => joinAdminInvite(token)}
                    >
                      Join
                    </ThemeButton>
                  )
                  else return (
                    <ThemeButton
                      color="success"
                      className="w-full"
                      isLoading={authenticationStatus === 'loading'}
                      isDisabled={!ready}
                      onClick={openConnectModal}
                    >
                      {ready ? "Join" : "Please wait ..."}
                    </ThemeButton>
                  )
                }}
              </ConnectButton.Custom>
            </div>
          </ThemeModalBody>
        </ModalContent>
      </ThemeModal>
      <ThemeModal
        isOpen={state.referralList.length > 0}
        onClose={()=>dispatch({referralList: [], referralPage: 1})}
        size="xl"
      >
        <ModalContent>
          <ThemeModalHeader>Your Referrals</ThemeModalHeader>
          <ThemeModalBody>
            <ThemeTable 
              aria-label="Referrals Table"
              removeWrapper 
              bottomContent={
                <ThemePagination
                  showControls
                  classNames={{
                    cursor: "bg-foreground text-background",
                  }}
                  color="default"
                  isDisabled={false}
                  page={state.referralPage}
                  total={state.referralList.length / CONSTANT.PAGINATION_DEFAULT_LIMIT}
                  variant="light"
                  onChange={(referralPage)=>dispatch({referralPage})}
                />
              }
              bottomContentPlacement="inside"
            >
              <TableHeader>
                <TableColumn key="rank">No</TableColumn>
                <TableColumn key="name">Name</TableColumn>
                <TableColumn key="wallet">Wallet Address</TableColumn>
                <TableColumn key="share">Date</TableColumn>
              </TableHeader>
              <TableBody 
                emptyContent="No rows to display."
                items={getReferralLists}
              >
                {(data) => 
                  <TableRow key={data.id}>
                    <TableCell>{data.no}</TableCell>
                    <TableCell>{data.name}</TableCell>
                    <TableCell>{data.wallet_address}</TableCell>
                    <TableCell>{data.date ? DateTime.fromJSDate(new Date(data.date)).toFormat('yyyy LLL dd') : "-"}</TableCell>
                  </TableRow>
                }
              </TableBody>
            </ThemeTable>
          </ThemeModalBody>
        </ModalContent>
      </ThemeModal>
    </Fragment>
  )
}

export default ProjectComponentPage
