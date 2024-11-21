"use client"
import { FC, Fragment } from "react";
import { ThemeButton, ThemeModal } from "./NextuiTheme";
import { ModalBody, ModalContent, ModalFooter, ModalHeader, UseDisclosureProps, useDisclosure } from "@nextui-org/react";
import { DM_Sans, Manrope, Montserrat } from "next/font/google"
import { useGlobalContext } from "@/providers/stores";
import { WelcomeXPIcon } from "../assets/icons";
import { GetPublicMission, IPublicClientResponse, ISetReferralReturn } from "@/types/service-types";

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope700 = Manrope({weight: "700", subsets: ["latin"]})
const manrope600 = Manrope({weight: "600", subsets: ["latin"]})
const montserrat400 = Montserrat({weight: "400", subsets: ["latin"]})
const montserrat600 = Montserrat({weight: "600", subsets: ["latin"]})
const montserrat800 = Montserrat({weight: "800", subsets: ["latin"]})
const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})

export interface WelcomeHypequestPublicModalInterface extends UseDisclosureProps {
  clientProject?: IPublicClientResponse | null;
  referrer?: ISetReferralReturn;
  referralMission?: GetPublicMission;
}

const WelcomeHypequestPublicModal: FC<WelcomeHypequestPublicModalInterface> = (props) => {
  const { state: { isLight } } = useGlobalContext()
  const { onOpen, isOpen, onOpenChange } = useDisclosure(props)
  
  return (
    <ThemeModal
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
    >
      <ModalContent>
        {(onClose) => 
          <Fragment>
            <ModalHeader/>
            <ModalBody className={`flex flex-col items-center justify-center gap-4 ${isLight ? "text-black" : "text-white"} bg-[url('/welcome-modal-bg.png')] bg-no-repeat`}>
              <h3 className={`${manrope600.className} text-xl`}>Welcome to {props.clientProject?.name}</h3>
              <h1 className={`${manrope800.className} text-7xl`}>Airdrop!</h1>
              <div className="flex flex-col items-center">
                <span className={`${dmSans700.className} text-sm`}>Invite By</span>
                <span className={`${manrope800.className} text-4xl px-12 py-2 rounded-xl bg-gray-600 text-white`}>{props.referrer?.data_referrer?.name}</span>
              </div>
              <div className="flex flex-row gap-2 items-center justify-center">
                <WelcomeXPIcon />
                <span><b>Get Extra +{props.referralMission?.point_reward}</b> {props.clientProject?.name} {props.referralMission?.data?.rewardType}<br />By Joining Us</span>
              </div>
              <ThemeButton className="my-4" radius="full" size="lg" color="warning">LET&apos;s GO</ThemeButton>
            </ModalBody>
            <ModalFooter />
          </Fragment>
        }
      </ModalContent>
    </ThemeModal>
  )
}

export default WelcomeHypequestPublicModal