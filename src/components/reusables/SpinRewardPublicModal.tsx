"use client"
import { FC, Fragment } from "react";
import { ThemeAvatar, ThemeButton, ThemeModal, ThemeModalBody } from "./NextuiTheme";
import { ModalBody, ModalContent, ModalFooter, ModalHeader, UseDisclosureProps, useDisclosure } from "@nextui-org/react";
import { DM_Sans, Manrope, Montserrat } from "next/font/google"
import { useGlobalContext } from "@/providers/stores";
import { ChecklistJoinPublicIcon, HypequestJoinPublicIcon, TwitterXIcon } from "../assets/icons";
import { IGetUserInfo, ILuckyWheelCustom, LuckyWheelTypesEnum } from "@/types/service-types";
import NextImage from "next/image"
import { CustomMilestoneRewardIcon } from ".";
import FreeSpinIcon from "@/components/assets/images/free-spin.png"
import GoodLuckIcon from "@/components/assets/images/good_luck.png"
import coinsBackground from "@/components/assets/images/coins.png"

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope700 = Manrope({weight: "700", subsets: ["latin"]})
const manrope600 = Manrope({weight: "600", subsets: ["latin"]})
const montserrat400 = Montserrat({weight: "400", subsets: ["latin"]})
const montserrat600 = Montserrat({weight: "600", subsets: ["latin"]})
const montserrat800 = Montserrat({weight: "800", subsets: ["latin"]})
const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})
const dmSans400 = DM_Sans({weight: "400", subsets: ["latin"]})

export interface SpinRewardPublicModalInterface extends UseDisclosureProps {
  selectedSpinReward?: ILuckyWheelCustom;
  userInfo?: IGetUserInfo;
  onSpin?: () => void;
  onShare?: () => void;
}

const SpinRewardPublicModal: FC<SpinRewardPublicModalInterface> = (props) => {
  const { state: { isLight } } = useGlobalContext()
  const { onOpen, isOpen, onOpenChange } = useDisclosure(props)

  const getLWIcon = () => {
    if(props.selectedSpinReward?.icon) return (
      <NextImage 
        src={props.selectedSpinReward.icon}
        alt="spin-reward-icon"
        width={56}
        height={56}
        className="rounded-full overflow-hidden"
      />
    )
    else {
      if(props.selectedSpinReward?.type_reward === LuckyWheelTypesEnum.XP) return (
        <CustomMilestoneRewardIcon 
          imgHref="/xp.png"
          imgId="spin-reward-icon-xp"
          background="purple"
          width="56"
          height="56"
        />
      )
      else if(props.selectedSpinReward?.type_reward === LuckyWheelTypesEnum.USDT) return (
        <CustomMilestoneRewardIcon 
          imgHref="/usdt.svg"
          imgId="spin-reward-icon-usdt"
          background="green"
          width="56"
          height="56"
        />
      )
      else if(props.selectedSpinReward?.type_reward === LuckyWheelTypesEnum.GOOD_LUCK) return (
        <NextImage 
          src={GoodLuckIcon}
          alt="spin-reward-icon-gl"
          width={56}
          height={56}
          className="rounded-full overflow-hidden"
        />
      )
      else if(props.selectedSpinReward?.type_reward === LuckyWheelTypesEnum.FREE_SPIN) return (
        <NextImage 
          src={FreeSpinIcon}
          alt="spin-reward-icon-gl"
          width={56}
          height={56}
          className="rounded-full overflow-hidden"
        />
      )
      else return null
    }
  }
  
  return (
    <ThemeModal
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="xl"
    >
      <ModalContent>
        {(onClose) => 
          <Fragment>
            <NextImage 
              src={coinsBackground}
              alt="coins-bg"
              className="absolute top-0 left-0 right-0 pointer-events-none z-[-1]"
            />
            <ModalHeader/>
            <ThemeModalBody className="flex flex-col items-center justify-center gap-4">
              <h2 className={`${manrope800.className} text-[40px]`}>Congratulation!</h2>
              <h3 className={`${dmSans400.className} text-[18px]`}>Your Rewards Will Be Distribute To You Soon!</h3>
              <div className="flex flex-row items-center gap-2 my-4">
                {getLWIcon()}
                <h2 className={`${dmSans700.className} text-[40px]`}>{props.selectedSpinReward?.label}</h2>
              </div>
              <ThemeButton 
                startContent={<TwitterXIcon />}
                radius="full"
                color="primary"
                className="w-1/2"
                onClick={()=>props.onShare?.()}
              >
                SHARE
              </ThemeButton>
              <ThemeButton
                radius="full"
                color="warning"
                className="w-1/2"
                onClick={()=>props.onSpin?.()}
              >
                {(props.userInfo?.free_spin ?? 0) > 0 ? 'SPIN AGAIN' : 'CONTINUE'}
              </ThemeButton>
            </ThemeModalBody>
            <ModalFooter />
          </Fragment>
        }
      </ModalContent>
    </ThemeModal>
  )
}

export default SpinRewardPublicModal