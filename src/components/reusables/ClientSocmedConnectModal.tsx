"use client"
import { FC, Fragment, ReactNode, useEffect } from "react";
import { ThemeAlert, ThemeAlertType, ThemeButton, ThemeCard, ThemeCardBody, ThemeDivider, ThemeInput, ThemeModal, ThemeModalBody, ThemeTabs } from "./NextuiTheme";
import { ModalContent, ModalFooter, ModalHeader, Tab, UseDisclosureProps, useDisclosure } from "@nextui-org/react";
import { Manrope } from "next/font/google";
import { DiscordIcon, TelegramIcon, TwitterXIcon } from "../assets/icons";
import { useGlobalContext } from "@/providers/stores";
import useClientService from "@/services/client-service";
import { isValidHttpUrl, loginTelegram, submitFormikForm, useDebounce, useMinimizedState } from "@/helper";
import { IClient } from "@/types/service-types";
import { useFormik } from "formik";
import * as yup from "yup"
import { TelegramAuth } from ".";
import CONSTANT from "@/Constant";
import { AlertModalType, useModal } from "@/providers/modal";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import InfoTooltip from "@/components/reusables/InfoTooltip";
import NextLink from "next/link"
import useSocmedAdminAuthService from "@/services/socmed-admin-auth-service";
import useSocmedAuthService from "@/services/socmed-auth-service";
import useAuthService from "@/services/auth-service";

const manrope700 = Manrope({weight: "700", subsets: ["latin"]})

export interface ClientSocmedConnectModalInterface extends UseDisclosureProps {
  clientProjectId?: string;
  onTwitterAuth?: (clientProject?: IClient) => void;
  onDiscordAuth?: (clientProject?: IClient) => void;
  onTelegramAuth?: (clientProject?: IClient) => void;
  onTelegramAuthSubmit?: (clientProject?: IClient) => void;
  onDiscordAuthSubmit?: (clientProject?: IClient) => void;
  onContinue?: () => void;
}

interface InitialState {
  clientProject?: IClient;
  isLoading: boolean;
  origin: string;
  telegramUser?: TUser;
  modalType: "discord" | "telegram" | "twitter"
}

interface IDiscordForm {
  server_id: string;
}
interface ITelegramForm {
  username_group: string;
}

const ClientSocmedConnectModal: FC<ClientSocmedConnectModalInterface> = (props) => {
  const { isOpen, onOpenChange } = useDisclosure(props)
  const { getClientDetail, telegramAuth, discordAuth } = useClientService()
  const { state: { profile, token }, dispatch: globalDispatch } = useGlobalContext()
  const { telegramAuth: telegramAuthUrl } = useSocmedAdminAuthService()
  const { telegramAuth: telegramSocmedAuth } = useSocmedAuthService()
  const { getProfile } = useAuthService()
  const [state, dispatch] = useMinimizedState<InitialState>({
    isLoading: false,
    origin: "",
    modalType: "twitter"
  })
  const openModal = useModal()
  const dFormik = useFormik<Partial<IDiscordForm>>({
    initialValues: {},
    onSubmit: (vals) => {
      if(vals.server_id && props.clientProjectId) {
        discordAuth({
          server_id: vals.server_id,
          clientProjectId: props.clientProjectId
        })
          .then((res) => {
            dispatch({clientProject: res.data.data})
            props.onDiscordAuthSubmit?.(res.data.data)
          })
          .catch(err => console.log(err))        
      }
    },
    validationSchema: yup.object().shape({
      server_id: yup.string().required("Server ID Must be fill!")
    })
  })

  const telegramGroupTest = (value: string) => {
    const splitUrl = value.split('/')
    const selected = splitUrl[splitUrl.length - 1]
    const validationRegExp = /^[a-zA-Z0-9_]{5,32}$/

    if(isValidHttpUrl(value)) {
      if(value.toLowerCase().includes("t.me/")) {
        const splitByDomain = value.split("t.me/")
        const selectedSplitByDomain = splitByDomain[splitByDomain.length - 1]

        return validationRegExp.test(selectedSplitByDomain)
      }
      else return false
    }
    else {
      if(selected.startsWith("@")) return validationRegExp.test(selected.slice(1))
      else return validationRegExp.test(selected)
    }
  }

  const telegramGroupMatch = (value: string) => {
    const splitUrl = value.split('/')
    const selected = splitUrl[splitUrl.length - 1]
    const validationRegExp = /^[a-zA-Z0-9_]{5,32}$/

    if(isValidHttpUrl(value)) {
      if(value.toLowerCase().includes("t.me/")) {
        const splitByDomain = value.toLowerCase().split("t.me/")
        const selectedSplitByDomain = splitByDomain[splitByDomain.length - 1]

        return selectedSplitByDomain.match(validationRegExp)?.[0]
      }
      else return false
    }
    else {
      if(selected.startsWith("@")) return selected.slice(1).match(validationRegExp)?.[0]
      else return selected.match(validationRegExp)?.[0]
    }
  }

  const tFormik = useFormik<Partial<ITelegramForm>>({
    initialValues: {},
    onSubmit: (vals) => {
      const telegramUsername = profile?.telegram?.username ?? state.telegramUser?.username
      const username_group = telegramGroupMatch(vals.username_group ?? "")
      if(username_group && props.clientProjectId && telegramUsername) {
        telegramAuth({
          username: telegramUsername,
          username_group,
          clientProjectId: props.clientProjectId
        })
          .then((res) => {
            dispatch({clientProject: res.data.data})
            props.onTelegramAuthSubmit?.(res.data.data)
          })
          .catch((err: AxiosError<ResponseAPI<null>>) => {
            if(err?.response?.data?.message) toast.warning(err.response.data.message)
          })
      }
      else openModal({
        type: AlertModalType.INFO,
        title: "Alert!",
        description: "Please bind your modal first!"
      })
    },
    validationSchema: yup.object().shape({
      username_group: yup.string().test({
        message: "Telegram Group (Link or Username) is not valid",
        test: (val) => telegramGroupTest(val ?? "")
      }).required("Telegram Group (Link or Username) Must be fill!")
    })
  })

  useEffect(()=>{
    dispatch({origin: window.location.href})
  }, [])

  useDebounce<[string, string | undefined]>((t, cpId)=>{
    if(t && cpId) {
      dispatch({isLoading: true})
      getClientDetail({clientProjectId: cpId}, {Authorization: "Bearer " + t})
        .then(res => dispatch({clientProject: res.data.data}))
        .catch(err => console.log(err))
        .finally(()=>dispatch({isLoading: false}))
    }
  }, [token, props.clientProjectId])

  const getProfileService = (t: string) => {
    getProfile({Authorization: "Bearer " + t})
      .then(res => globalDispatch({profile: res.data.data}))
      .catch(err => console.log(err))
  }

  useDebounce<[TUser | undefined, string]>((tUser, t)=>{
    if(tUser && t) {
      telegramSocmedAuth(tUser, {Authorization: "Bearer " + t})
        .then(() => getProfileService(t))
        .catch(err => console.log(err))
    }
  }, [state.telegramUser, token])

  const isTelegramAuthorized = !!(profile?.telegram.username || state.telegramUser?.username)

  return (
    <ThemeModal
      backdrop="blur"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      closeButton={<Fragment></Fragment>}
    >
      <ModalContent>
        {(onClose) => 
          <Fragment>
            <ModalHeader/>
            <ThemeModalBody className="flex flex-col items-center justify-center gap-4">
              <h1 className={`${manrope700.className} text-[20px]`}>Where can people connect with you?</h1>
              <ThemeTabs 
                selectedKey={state.modalType}
                onSelectionChange={(key) => dispatch({modalType: key as "twitter" | "discord" | "telegram"})}
              >
                <Tab key="twitter" title="Twitter" className="flex flex-col gap-2 w-full">
                  <ThemeButton 
                    startContent={<TwitterXIcon />} 
                    radius="full" 
                    onClick={() => props.onTwitterAuth?.(state.clientProject)}
                    color={state.clientProject?.twitter?.username ? "primary" : "default"}
                    isLoading={state.isLoading}
                    isDisabled={state.isLoading}
                    className="w-full"
                  >
                    {state.clientProject?.twitter?.username ?? 'Connect with Twitter'}
                  </ThemeButton>
                </Tab>
                <Tab key="discord" title="Discord" className="flex flex-col gap-2 w-full">
                  <h3>Connect with Your Discord</h3>
                  <ThemeButton 
                    startContent={<DiscordIcon />} 
                    radius="full" 
                    onClick={() => props.onDiscordAuth?.(state.clientProject)}
                    color={state.clientProject?.discord?.username ? "primary" : "default"}
                    isLoading={state.isLoading}
                    isDisabled={state.isLoading}
                  >
                    {state.clientProject?.discord?.username ?? 'Discord'}
                  </ThemeButton>
                  {!state.clientProject?.discord?.server_id &&
                    <Fragment>
                      <ThemeInput 
                        formik={{
                          config: dFormik,
                          name: "server_id"
                        }}
                        label="Input Discord Server ID"
                        labelPlacement="outside"
                        startContent="https://discord.com/channels/"
                        placeholder="[server_id]"
                      />
                      <ThemeAlert type={ThemeAlertType.WARNING} title="Server ID?">
                        <a className="text-small" target="_blank" rel="noreferrer" href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID">Where to find server ID?</a>
                      </ThemeAlert>
                      <ThemeButton radius="full" color="warning" onClick={() => submitFormikForm(dFormik)}>Submit</ThemeButton>
                    </Fragment>
                  }
                </Tab>
                <Tab key="telegram" title="Telegram" className="flex flex-col gap-2 w-full">
                  <h3>Connect Your Account</h3>
                  <ThemeAlert type={ThemeAlertType.WARNING} title="Step 1">
                    The first step, enter the Hypequest bot into your group!
                  </ThemeAlert>
                  <NextLink href={telegramAuthUrl()} target="_blank" className="w-full">
                    <ThemeButton
                      startContent={<TelegramIcon />}
                      radius="full"
                      className="w-full"
                    >
                      Enter the Telegram Bot
                    </ThemeButton>
                  </NextLink>
                  <ThemeAlert type={isTelegramAuthorized ? ThemeAlertType.SUCCESS : ThemeAlertType.WARNING} title="Step 2">
                    {isTelegramAuthorized ? 'The account has been successfully authorized!' : 'The next step, authorize your Telegram account!'}
                  </ThemeAlert>
                  <ThemeButton 
                    startContent={<TelegramIcon />}
                    radius="full" 
                    onClick={() => {
                      loginTelegram((data) => {
                        if(data !== false) dispatch({telegramUser: data})
                      })
                    }}
                    isLoading={state.isLoading}
                    isDisabled={state.isLoading}
                    color={isTelegramAuthorized ? "success" : "default"}
                  >
                    {profile?.telegram?.username ?? state.telegramUser?.username ?? "Connect Your Account"}
                  </ThemeButton>
                  {!state.clientProject?.telegram?.username_group &&
                    <Fragment>
                      <ThemeInput 
                        formik={{
                          config: tFormik,
                          name: "username_group"
                        }}
                        label="Telegram Group (Link or Username)"
                        labelPlacement="outside"
                        placeholder="Telegram Group (Link or Username)"
                      />
                      <ThemeButton radius="full" color="warning" onClick={() => submitFormikForm(tFormik)}>Submit</ThemeButton>
                    </Fragment>
                  }
                </Tab>
              </ThemeTabs>
              {state.clientProject?.twitter?.username &&
                <Fragment>
                  <ThemeDivider />
                  <div>Note: You can set it later in the profile menu</div>
                  <ThemeButton color="primary" className="w-full" radius="full" onClick={props.onContinue}>Continue</ThemeButton>
                </Fragment>
              }
            </ThemeModalBody>
            <ModalFooter />
          </Fragment>
        }
      </ModalContent>
    </ThemeModal>
  )
}

export default ClientSocmedConnectModal
