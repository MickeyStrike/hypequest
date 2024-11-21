"use client"
import { FC, Fragment } from "react";
import { ThemeButton, ThemeModal } from "./NextuiTheme";
import { ModalBody, ModalContent, ModalFooter, ModalHeader, UseDisclosureProps, useDisclosure } from "@nextui-org/react";
import { DM_Sans, Manrope, Montserrat } from "next/font/google"
import { useGlobalContext } from "@/providers/stores";
import { ChecklistJoinPublicIcon, HypequestJoinPublicIcon } from "../assets/icons";
import { IPublicClientResponse } from "@/types/service-types";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { getSignMessage } from "@/helper";
import useAuthService from "@/services/auth-service";
import { AlertModalType, useModal } from "@/providers/modal";

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope700 = Manrope({weight: "700", subsets: ["latin"]})
const manrope600 = Manrope({weight: "600", subsets: ["latin"]})
const montserrat400 = Montserrat({weight: "400", subsets: ["latin"]})
const montserrat600 = Montserrat({weight: "600", subsets: ["latin"]})
const montserrat800 = Montserrat({weight: "800", subsets: ["latin"]})
const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})

export interface JoinHypequestPublicModalInterface extends UseDisclosureProps {
  clientProject?: IPublicClientResponse | null;
}

const JoinHypequestPublicModal: FC<JoinHypequestPublicModalInterface> = (props) => {
  const { state: { isLight, isSignatureLoading, token }, dispatch: globalDispatch } = useGlobalContext()
  const { isOpen, onOpenChange } = useDisclosure(props)
  const openModal = useModal()
  const { login } = useAuthService()
  const descriptions = [
    "Community-Boost XP Jackpot",
    "Social Quest Board",
    "Rolling the Lucky",
    "Airdrop Vesting",
    "XP Marketplace"
  ]
  const { data, isLoading, isSuccess, signMessageAsync } = useSignMessage({
    message: getSignMessage(), // signature hash can use for login, verify data, etc
  })
  const { address } = useAccount()
  const loginService = (message: string, wallet_address: string) => {
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
          })
          .catch(err => {
            console.log(err)
            openModal({
              type: AlertModalType.ERROR,
              title: "Login Error",
              description: "Opps! Please re-connect your wallet to login!"
            })
          })
          .finally(()=>globalDispatch({isSignatureLoading: false}))
      })
      .catch(err => {
        console.log(err)
        globalDispatch({isSignatureLoading: false})
      })
  }
  return (
    <ThemeModal
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => 
          <Fragment>
            <ModalHeader/>
            <ModalBody className="flex flex-col items-center justify-center gap-4">
              <h1 className={`${manrope800.className} text-[#631AFF] text-6xl leading-8`}>WIN BIG</h1>
              <h2 className={`${montserrat600.className} text-2xl ${isLight ? "text-[#212121]" : "text-white"}`}>In Web3 Space?</h2>
              <span className={`${montserrat400.className} text-center text-xs font-thin my-2 ${isLight ? "text-[#0D0D0D]" : "text-white"}`}>Join <b className={montserrat600.className}>#Hypequest</b> ,Earn XP and Spin Your Fortune! <br />Unlock Your Limitless Earning!</span>
              <div 
                className="flex flex-row items-center justify-center gap-4 rounded-xl transition-all hover:shadow-xl px-14 py-2"
                style={{
                  background: "linear-gradient(353deg, #FFC627 -52.76%, #631AFF 84.55%)"
                }}
              >
                <HypequestJoinPublicIcon />
                <span className={`${montserrat800.className} font-3xl text-white`}>Claim Your <br />{props.clientProject?.token_name ?? props.clientProject?.name} Token</span>
              </div>
              <div className="flex flex-col justify-center gap-2">
                {descriptions.map((description, index) =>
                  <div key={index} className={`flex flex-row gap-2 ${dmSans700.className} ${isLight ? "text-[#212121]" : "text-white"} text-sm`}>
                    <ChecklistJoinPublicIcon />
                    <span>{description}</span>
                  </div>
                )}
              </div>
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated');

                  if(!connected) return (
                    <ThemeButton 
                      className="my-4" 
                      radius="full" 
                      size="lg" 
                      color="warning"
                      isLoading={authenticationStatus === 'loading'}
                      isDisabled={!ready}
                      onClick={openConnectModal}
                    >
                      {ready ? "Join Now" : "Please wait ..."}
                    </ThemeButton>
                  )
                  else if(!data && !isSuccess || !token) {
                    if(address) return (
                      <ThemeButton 
                        onClick={()=>loginService(getSignMessage(), address)}
                        type="button"
                        variant="light"
                        radius="full"
                        isDisabled={isLoading || isSignatureLoading}
                        isLoading={isLoading || isSignatureLoading}
                      >
                        Get Signature
                      </ThemeButton>
                    )
                    else return null
                  }
                  else return null
                }}
                
              </ConnectButton.Custom>
            </ModalBody>
            <ModalFooter />
          </Fragment>
        }
      </ModalContent>
    </ThemeModal>
  )
}

export default JoinHypequestPublicModal