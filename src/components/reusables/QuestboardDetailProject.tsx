"use client"
import { CustomQuestboard, GetPublicMission, StageRewardTypeEnum } from "@/types/service-types";
import { FC, Fragment, PromiseLikeOfReactNode, ReactNode } from "react";
import NextImage from "next/image"
import { ThemeAccordion, ThemeAvatar, ThemeButton, ThemePagination } from "./NextuiTheme";
import { useMinimizedState } from "@/helper";
import { DM_Sans, Manrope } from "@next/font/google";
import { UploadIcon } from "../assets/icons";
import { AccordionItem } from "@nextui-org/react";
import { CustomMilestoneRewardIcon } from ".";
import { useGlobalContext } from "@/providers/stores";
import { useRouter } from "next/navigation";
import QuestboardPlaceholder from "@/components/assets/images/questboard-placeholder.jpeg"

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const dmSans400 = DM_Sans({weight: "400", subsets: ["latin"]})
const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})

export interface QuestboardDetailProjectProps extends CustomQuestboard {
  name?: string;
  project: string;
  getMissionAvatar: (mission: GetPublicMission) => JSX.Element | undefined;
  renderMissionByType: (mission: GetPublicMission) => string | number | boolean | JSX.Element | Iterable<ReactNode> | PromiseLikeOfReactNode | null | undefined;
  shareLink: (anotherParams?: Record<string, any>) => Promise<void>;
}

const QuestboardDetailProject: FC<QuestboardDetailProjectProps> = (props) => {
  const router = useRouter()
  const { state: { isLight } } = useGlobalContext()
  const [state, dispatch] = useMinimizedState({
    page: 0
  })
  
  const isAnyThumbnail = (props.missions ?? []).map(m => m.data.thumbnail).every(t => t !== undefined)

  return (
    <div className="flex flex-col lg:flex-row lg:p-4 gap-8">
      <div className="flex flex-col gap-4 w-full">
        <h2 className={`${manrope800.className} text-[42px]`}>Exploring {props.name}</h2>
        <p className={`${dmSans400.className} text-[16px]`}>{props.description}</p>
        <NextImage 
          src={props.missions?.[state.page].data.thumbnail ?? props.missions?.[state.page].data.questboard_thumbnail ?? QuestboardPlaceholder}
          alt={props.title}
          className="w-full rounded-xl overflow-hidden pointer-events-none"
          width={492}
          height={371}
          unoptimized
          priority
        />
        {isAnyThumbnail &&
          <ThemePagination 
            total={props.missions?.length ?? 0}
            onChange={(page) => dispatch({page})}
            page={state.page}
          />
        }
        <ThemeButton 
          className="w-fit" 
          onClick={()=>{
            const url = new URL(window.location.href)
            url.searchParams.delete("questboardId")
            router.push(url.href)
          }}
        >
          Go Back
        </ThemeButton>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <h1 className={`${manrope800.className} text-[47px]`}>{props.title}</h1>
        <div className="flex flex-row items-center justify-between">
          <h3 className={`${manrope800.className} text-[24px]`}>{props.missions?.length} Quest{(props.missions ?? []).length > 0 && "s"}</h3>
          <ThemeButton
            isIconOnly
            onClick={()=>props.shareLink()}
          >
            <UploadIcon />
          </ThemeButton>
        </div>
        <ThemeAccordion variant="splitted" className="px-0">
          {(props.missions ?? []).map((mission, index) =>
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
                  icon={props.getMissionAvatar(mission)}
                />
              }
            >
              {props.renderMissionByType(mission)}
            </AccordionItem>
          )}
        </ThemeAccordion>
        <div className={`flex flex-col gap-2 ${dmSans700.className} text-2xl`}>
          <h3>Extra Rewards</h3>
          <div className="flex flex-row items-center gap-2">
            <CustomMilestoneRewardIcon 
              imgHref={props.extra_reward_type === StageRewardTypeEnum.XP ? "/xp.png" : "/usdt.png"}
              imgId={`detail-questboard-${props.questBoardId}`}
              background={props.extra_reward_type === StageRewardTypeEnum.XP ?"purple" : "green"}
              width="27"
              height="27"
            />
            <h3>{props.extra_reward_point}</h3>
            <h3>{props.extra_reward_type}</h3>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestboardDetailProject
