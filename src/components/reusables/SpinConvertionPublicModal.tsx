"use client"
import { FC, Fragment } from "react";
import { ThemeButton, ThemeModal, ThemeModalBody, ThemeSwitch } from "./NextuiTheme";
import { ModalContent, ModalFooter, ModalHeader, UseDisclosureProps, useDisclosure } from "@nextui-org/react";
import { DM_Sans, Manrope, Montserrat } from "next/font/google"
import { useGlobalContext } from "@/providers/stores";
import { MainXpSmallIcon, SpinModalIcon, ZealySmallIcon } from "../assets/icons";
import { IConvertionConsumptionSpin, IPublicClientResponse } from "@/types/service-types";
import { numFormatter } from "@/helper";
import { CustomMilestoneRewardIcon } from ".";

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope700 = Manrope({weight: "700", subsets: ["latin"]})
const manrope600 = Manrope({weight: "600", subsets: ["latin"]})
const montserrat400 = Montserrat({weight: "400", subsets: ["latin"]})
const montserrat600 = Montserrat({weight: "600", subsets: ["latin"]})
const montserrat800 = Montserrat({weight: "800", subsets: ["latin"]})
const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})
const dmSans400 = DM_Sans({weight: "400", subsets: ["latin"]})

export interface SpinConvertionPublicModalInterface extends UseDisclosureProps {
  isLoading?: boolean;
  clientProject?: IPublicClientResponse | null;
  onSelectConvertion?: (value: IConvertionConsumptionSpin) => void;
  isZealyConsume?: boolean;
  onChangeConsume?: (value: boolean) => void;
}

const SpinConvertionPublicModal: FC<SpinConvertionPublicModalInterface> = (props) => {
  const { state: { isLight } } = useGlobalContext()
  const { onOpen, isOpen, onOpenChange } = useDisclosure(props)
  
  return (
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
            <ThemeModalBody className="flex flex-col items-center justify-center gap-4">
              <h1 className={`${manrope800.className} text-[40px]`}>Get More Spins!</h1>
              <h3 className={`${dmSans400.className} text-[18px] text-center`}>Saving over 10% of XP and Unlock Incredible Rewards!</h3>
              <div className="flex flex-col items-center justify-center my-4">
                <h3 className={`${dmSans700.className} text-[16px]`}>Select XP you want to use:</h3>
                <div className="flex flex-row items-center gap-2">
                  <CustomMilestoneRewardIcon 
                    imgHref="/xp.png"
                    imgId="get_more_spin_xp"
                    width="41"
                    height="41"
                  />
                  <ThemeSwitch 
                    isSelected={props.isZealyConsume}
                    onValueChange={(isSelected) => props.onChangeConsume?.(isSelected)}
                  />
                  <ZealySmallIcon />
                </div>
              </div>
              <div className="grid grid-cols-marketplaceItem gap-2 w-full">
                {(props?.clientProject?.convertion_consumption_spin && Array.isArray(props.clientProject?.convertion_consumption_spin) ? props.clientProject.convertion_consumption_spin : []).map((ccs, index) =>
                  <ThemeButton 
                    isLoading={props.isLoading}
                    className="flex flex-col items-center justify-center gap-4 p-4 h-full"
                    key={index}
                    onClick={()=>props.onSelectConvertion?.(ccs)}
                  >
                    <div 
                      className="flex flex-col items-center justify-center gap-4 rounded-full text-white p-4 shadow-xl w-[100px] h-[100px] transition-all hover:scale-110"
                      style={{
                        background: "linear-gradient(42deg, #FFC627 -11.03%, #631AFF 47.31%)",
                      }}
                    >
                      <h3 className={`${dmSans700.className} text-[40px]`}>{numFormatter(ccs.amount_spin)}</h3>
                      <div className="flex flex-row items-center gap-1">
                        <SpinModalIcon />
                        <h3>SPINS</h3>
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      {props.isZealyConsume ? 
                        <ZealySmallIcon />  
                      :
                        <CustomMilestoneRewardIcon 
                          imgHref="/xp.png"
                          imgId="get_more_spin_xp_item"
                          width="41"
                          height="41"
                        />
                      }
                      <h3 className={`${manrope800.className} text-[20px]`}>{numFormatter(ccs.amount_consumption)}</h3>
                    </div>
                  </ThemeButton>
                )}
              </div>
            </ThemeModalBody>
            <ModalFooter />
          </Fragment>
        }
      </ModalContent>
    </ThemeModal>
  )
}

export default SpinConvertionPublicModal