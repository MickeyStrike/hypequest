"use client"
import { CustomQuestboard, GetPublicMission, StageRewardTypeEnum } from "@/types/service-types";
import { DM_Sans, Manrope } from "next/font/google";
import { FC, ReactNode } from "react";
import { ThemeAccordion, ThemeAvatar, ThemeButton, ThemeChip } from "./NextuiTheme";
import { DateTime } from "luxon";
import { ClockIcon } from "../assets/icons";
import { AccordionItem, AvatarGroup } from "@nextui-org/react";
import { CustomMilestoneRewardIcon } from ".";
import usePublicClientService from "@/services/public-client-service";
import { addSearchParams, useDebounce, useMinimizedState } from "@/helper";
import { useGlobalContext } from "@/providers/stores";
import { useRouter } from "next/navigation";

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope700 = Manrope({weight: "700", subsets: ["latin"]})
const dmSans400 = DM_Sans({weight: "400", subsets: ["latin"]})

export interface ProjectQuestboardItemProps {
  questboard: CustomQuestboard;
  getMissionAvatar: (mission: GetPublicMission) => ReactNode;
  renderMissionByType: (mission: GetPublicMission) => ReactNode;
  index: number;
  project: string;
}

interface InitialState {
  questers: Array<string>;
  total_questers: number;
}

const ProjectQuestboardItem: FC<ProjectQuestboardItemProps> = (props) => {
  const router = useRouter()
  const [state, dispatch] = useMinimizedState<InitialState>({
    questers: [],
    total_questers: 0
  })
  const { state: { token } } = useGlobalContext()

  const { getQuesterAvatars } = usePublicClientService()
  const { questboard, getMissionAvatar, renderMissionByType, index, project } = props

  useDebounce<[string, string | undefined, string]>((t, questBoardId, username)=>{
    if(t && questBoardId && username) getQuesterAvatars(username, {questBoardId, page: 1, limit: 5})
      .then(res => dispatch({
        questers: res.data?.data?.data ?? [],
        total_questers: res.data?.data?.meta?.total ?? 0
      }))
      .catch(err => console.log(err))
  }, [token, questboard.questBoardId, project], 400)
  
  const getQuestboardRedemptionDateLabel = (qb: CustomQuestboard) => {
    if(qb.start_redemption_date && qb.end_redemption_date) return (
      <ThemeChip color="default">
        {`${DateTime.fromJSDate(new Date(qb.start_redemption_date)).toFormat("LLL dd - HH:mm")} ~ ${DateTime.fromJSDate(new Date(qb.end_redemption_date)).toFormat("LLL dd - HH:mm")}`}
      </ThemeChip>
    )
    else return (
      <ThemeChip>No Redemption Date</ThemeChip>
    )
  }

  const getQuestboardTagTimeLeft = (qb: CustomQuestboard) => {
    const isCompleted = Array.isArray(qb.missions) && qb.missions.length > 0 ? qb.missions.every(m => m.is_claimed === true) : false
    
    if(isCompleted) return (
      <ThemeChip color="success">
        You have completed this Questboard.
      </ThemeChip>
    )
    else {
      if(qb.start_redemption_date && qb.end_redemption_date) {
        if(new Date() < new Date(qb.start_redemption_date)) return (
          <ThemeChip 
            color="success"
            startContent={<ClockIcon width="17" height="17" />}
          >
            {DateTime.fromJSDate(new Date(qb.end_redemption_date)).toRelative({base: DateTime.fromJSDate(new Date())})}
          </ThemeChip>
        )
        else if(new Date() < new Date(qb.end_redemption_date)) return (
          <ThemeChip 
            color="warning"
            startContent={<ClockIcon width="17" height="17" />}
          >
            {DateTime.fromJSDate(new Date(qb.end_redemption_date)).toRelative({base: DateTime.fromJSDate(new Date())})}
          </ThemeChip>
        )
        else return (
          <ThemeChip 
            color="danger"
            startContent={<ClockIcon width="17" height="17" />}
          >
            Redemption Date has expired.
          </ThemeChip>
        )
      }
      else return null
    }
  }

  const getChipContent = (qb: CustomQuestboard) => {
    const isCompleted = Array.isArray(qb.missions) && qb.missions.length > 0 ? qb.missions.every(m => m.is_claimed === true) : false

    if(isCompleted) return <ThemeChip color="success">Completed</ThemeChip>
    else {
      if(qb.start_redemption_date && (new Date() < new Date(qb.start_redemption_date))) return <ThemeChip>Hasn&apos;t start yet!</ThemeChip>
      else if(qb.start_redemption_date && qb.end_redemption_date && (new Date() >= new Date(qb.start_redemption_date)) && (new Date() < new Date(qb.end_redemption_date))) return <ThemeChip color="success">Ongoing</ThemeChip>
      else if(qb.end_redemption_date && (new Date() >= new Date(qb.end_redemption_date))) return <ThemeChip color="danger">Expired Campaign</ThemeChip>
      else return null
    }
  }

  return (
    <ThemeButton 
      className="flex flex-col gap-4 h-full items-start p-8 transition-all whitespace-normal"
      variant="light"
      onClick={()=>{
        router.push(addSearchParams(project, {questboardId: props.questboard.questBoardId}))
      }}
      isDisabled={props.questboard.end_redemption_date && (new Date() >= new Date(props.questboard.end_redemption_date)) ? true : false}
    >
      <h1 className={`${manrope800.className} text-[42px]`}>{questboard.title}</h1>
      <span className={`${dmSans400.className} text-[16px] text-left`}>{questboard.description}</span>
      <div className="flex flex-row items-center gap-1">
        {getChipContent(questboard)}
        {getQuestboardRedemptionDateLabel(questboard)}
        {getQuestboardTagTimeLeft(questboard)}
      </div>
      <div className="flex flex-row gap-8 justify-between w-full">
        {questboard.missions && 
          <ThemeAccordion variant="splitted" className="px-0">
            {questboard.missions?.map((mission, index) =>
              <AccordionItem 
                key={index}
                title={
                  <div className="flex flex-row items-center justify-between">
                    {mission.data?.label ?? mission.type}
                    {mission.is_claimed && <ThemeChip color="success">Completed</ThemeChip>}
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
        }
        <div className="flex flex-col items-start gap-8">
          <div className="flex flex-col items-start gap-2">
            <h2 className={`${manrope700.className} text-[22px]`}>Reward</h2>
            <div className="flex flex-row items-center gap-2">
              <CustomMilestoneRewardIcon 
                width="58"
                height="58"
                imgHref={questboard.extra_reward_type === StageRewardTypeEnum.USDT ? '/usdt.svg' : '/xp.png'}
                background={questboard.extra_reward_type === StageRewardTypeEnum.USDT ? 'green' : 'purple'}
                imgId={`questboard-icon-${index}`}
              />
              <p className={`${manrope700.className} text-[36px] text-ellipsis`}>+{questboard.extra_reward_point ?? 0} {questboard.extra_reward_type}</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 min-w-[300px]">
            <h2 className={`${manrope700.className} text-[22px]`}>Questers</h2>
            <AvatarGroup
              className="justify-start"
              isBordered
              max={3}
              total={10}
              renderCount={() => (
                <p className="text-small text-foreground font-medium ms-2">{state.total_questers - state.questers.length}+</p>
              )}
            >
              {state.questers.map((quester, qIndex) =>
                <ThemeAvatar src={quester} key={qIndex} />
              )}
            </AvatarGroup>
          </div>
        </div>
      </div>
    </ThemeButton>
  )
}

export default ProjectQuestboardItem