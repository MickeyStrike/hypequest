"use client"
import { FC, Fragment } from "react";
import NextImage from "next/image"
import coinsBackground from "@/components/assets/images/coins.png"
import { ThemeButton, ThemeChip, ThemeDivider, ThemeModalBody, ThemeModalHeader } from "./NextuiTheme";
import { Manrope, Montserrat, Poppins } from "@next/font/google";
import { CustomMilestoneRewardIcon } from ".";
import { useGlobalContext } from "@/providers/stores";
import { GetPublicMission, IPublicClientResponse, StageRewardTypeEnum } from "@/types/service-types";
import { middleEllipsisText, numFormatter } from "@/helper";

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const poppins400 = Poppins({weight: "400", subsets: ["latin"]})
const montserrat200 = Montserrat({weight: "200", subsets: ["latin"]})
const montserrat800 = Montserrat({weight: "800", subsets: ["latin"]})

export interface CustomContentSuccessTaskModalProps {
  clientProject?: IPublicClientResponse | null;
  referralLink: string;
  shareLink: (anotherParams?: Record<string, any>) => Promise<void>;
  referralFinder?: GetPublicMission;
  selectedTask?: GetPublicMission;
  isPending?: boolean;
}

const CustomContentSuccessTaskModal: FC<CustomContentSuccessTaskModalProps> = (props) => {
  const { state: { isLight } } = useGlobalContext()
  return (
    <Fragment>
      <NextImage 
        src={coinsBackground}
        alt="coins-bg"
        className="absolute top-0 left-0 right-0 pointer-events-none z-[-1]"
      />
      <ThemeModalHeader />
      <ThemeModalBody className={`flex flex-col ${props.isPending ? "gap-6" : "gap-0"} items-center justify-center`}>
        <h1 className={`${manrope800.className} ${props.isPending ? "text-[60px]" : "text-[92px]"} text-center leading-[80px]`}>{props.isPending ? "Task Verification" : "Congrats!"}</h1>
        <span className={`${montserrat200.className} text-[23px] text-center ${props.isPending ? "max-w-[450px]" : ""}`}>{props.isPending ? "The system takes time to verify tasks, please check periodically!" : "For completing the task!"}</span>
        <div className="flex flex-col items-center justify-center my-6">
          {props.isPending ?
            <ThemeChip 
              radius="sm" 
              size="lg" 
              color="warning"
            >
              Pending Verification
            </ThemeChip>
          :
            <h3 className={`${poppins400.className} text-[#555555] text-[18px] text-center`}>You&apos;ve received</h3>
          }
          <div className="flex flex-row items-center gap-1">
            <h1 className={`${montserrat800.className} text-[80px] text-center`}>+{numFormatter(props.selectedTask?.data?.rewardType === StageRewardTypeEnum.XP ? props.selectedTask.point_reward : props.selectedTask?.usdt_reward ?? 0)}</h1>
            <CustomMilestoneRewardIcon 
              imgHref={props.selectedTask?.data?.rewardType === StageRewardTypeEnum.XP ? "/xp.png" : "/usdt.svg"}
              background={props.selectedTask?.data?.rewardType === StageRewardTypeEnum.XP ? "purple" : "green"}
              imgId={`success-task-${props.selectedTask?.data.rewardType}`}
              width="80"
              height="80"
            />
          </div>
        </div>
        {props.referralFinder &&
          <Fragment>
            <ThemeDivider />
            <h2 className={`${montserrat800.className} text-[22px] text-center my-8`}>Invite & Earn Extra {props.clientProject?.name} {props.referralFinder?.data?.rewardType}</h2>
            <div className={`flex flex-col gap-2 p-2 rounded-lg ${isLight ? "bg-[#F5F5F5]" : "bg-[#0a0a0a]"}`}>
              <div className="flex flex-row items-center gap-6">
                <CustomMilestoneRewardIcon 
                  imgHref={props.referralFinder?.data?.rewardType === StageRewardTypeEnum.USDT ? "/usdt.svg" : "/xp.png"}
                  background={props.referralFinder?.data?.rewardType === StageRewardTypeEnum.USDT ? "green" : "purple"}
                  imgId={`referral-${props.referralFinder?.data?.rewardType}`}
                  width="56"
                  height="56"
                />
                <div className="flex flex-col">
                  <h3 className={`${poppins400.className} text-gray text-[13px]`}>Per Successful Invite</h3>
                  <h1 className={`${manrope800.className} text-[24px]`}>Extra +{numFormatter(props.referralFinder?.data?.rewardType === StageRewardTypeEnum.XP ? props.referralFinder.point_reward : props.referralFinder?.usdt_reward ?? 0)} {props.clientProject?.token_name} {props.referralFinder?.data?.rewardType}</h1>
                </div>
              </div>
              <div className="flex flex-row items-center gap-6">
                {props.clientProject?.logo &&
                  <NextImage 
                    src={props.clientProject?.logo}
                    alt="project-logo"
                    width={56}
                    height={56}
                    className="rounded-full overflow-hidden"
                  />
                }
                <div className="flex flex-col">
                  <h3 className={`${poppins400.className} text-gray text-[13px]`}>More {props.referralFinder?.data?.rewardType} you earn, the faster to</h3>
                  <h1 className={`${manrope800.className} text-[24px]`}>Unlock {props.clientProject?.name} Airdrop!</h1>
                </div>
              </div>
            </div>
            <h1 className={`${montserrat200.className} text-gray mt-6`}>Referral Link</h1>
            <ThemeButton variant="light" onClick={()=>props.shareLink()}>
              {middleEllipsisText(props.referralLink, 12, 5)}
            </ThemeButton>
          </Fragment>
        }
      </ThemeModalBody>
    </Fragment>
  )
}

export default CustomContentSuccessTaskModal