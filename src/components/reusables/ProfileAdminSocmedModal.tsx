"use client"
import { FC, Fragment, ReactNode, useEffect } from "react";
import { ThemeAlert, ThemeAlertType, ThemeButton, ThemeCard, ThemeCardBody, ThemeDivider, ThemeInput, ThemeModal, ThemeModalBody, ThemeModalHeader } from "./NextuiTheme";
import { ModalContent, ModalFooter, ModalHeader, UseDisclosureProps, useDisclosure } from "@nextui-org/react";
import { Manrope } from "next/font/google";
import { DiscordIcon, TelegramIcon, TwitterXIcon } from "../assets/icons";
import { useGlobalContext } from "@/providers/stores";
import useClientService from "@/services/client-service";
import { isValidHttpUrl, loginTelegram, submitFormikForm, useDebounce, useMinimizedState } from "@/helper";
import { IClient } from "@/types/service-types";
import { useFormik } from "formik";
import * as yup from "yup"
import NextLink from "next/link"
import { AlertModalType, useModal } from "@/providers/modal";
import useSocmedAdminAuthService from "@/services/socmed-admin-auth-service";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import useSocmedAuthService from "@/services/socmed-auth-service";
import useAuthService from "@/services/auth-service";

const manrope700 = Manrope({weight: "700", subsets: ["latin"]})

export interface ProfileAdminSocmedModalInterface extends UseDisclosureProps {
  clientProjectId?: string;
  onDiscordAuth?: (clientProject?: IClient) => void;
  onTelegramAuth?: (clientProject?: IClient) => void;
  onTelegramAuthSubmit?: (clientProject?: IClient) => void;
  onDiscordAuthSubmit?: (clientProject?: IClient) => void;
  modalType?: "discord" | "telegram"
}

interface InitialState {
  clientProject?: IClient;
  isLoading: boolean;
  origin: string;
  telegramUser?: TUser;
}

interface IDiscordForm {
  server_id: string;
}
interface ITelegramForm {
  username_group: string;
}

const ProfileAdminSocmedModal: FC<ProfileAdminSocmedModalInterface> = (props) => {
  const { isOpen, onOpenChange } = useDisclosure(props)
  const { getClientDetail, telegramAuth, discordAuth } = useClientService()
  const { telegramAuth: telegramSocmedAuth } = useSocmedAuthService()
  const { state: { profile, token }, dispatch: globalDispatch } = useGlobalContext()
  const { telegramAuth: telegramAuthUrl } = useSocmedAdminAuthService()
  const { getProfile } = useAuthService()
  const [state, dispatch] = useMinimizedState<InitialState>({
    isLoading: false,
    origin: ""
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
          .then((res) => props.onDiscordAuthSubmit?.(res.data.data))
          .catch((err: AxiosError<ResponseAPI<null>>) => toast.error(err?.response?.data?.message ?? "Something went wrong!"))
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
          .then((res) => props.onTelegramAuthSubmit?.(res.data.data))
          .catch((err: AxiosError<ResponseAPI<null>>) => toast.error(err?.response?.data?.message ?? "Something went wrong!"))
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

  useEffect(()=>{
    if(props.clientProjectId) {
      dispatch({isLoading: true})
      getClientDetail({clientProjectId: props.clientProjectId})
        .then(res => dispatch({clientProject: res.data.data}))
        .catch(err => console.log(err))
        .finally(()=>dispatch({isLoading: false}))
    }
  }, [props.clientProjectId])

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
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => 
          <Fragment>
            <ThemeModalHeader>{props.modalType === "discord" ? 'Discord Auth' : 'Telegram Auth'}</ThemeModalHeader>
            <ThemeModalBody className="flex flex-col items-center justify-center gap-4">
              {props.modalType === "discord" &&
                <Fragment>
                  <ThemeButton 
                    className="w-full"
                    startContent={<DiscordIcon />} 
                    radius="full" 
                    onClick={() => props.onDiscordAuth?.(state.clientProject)}
                    isLoading={state.isLoading}
                    isDisabled={state.isLoading}
                  >
                    Select Discord Channel
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
                      <ThemeButton className="w-full" color="warning" onClick={async () => await submitFormikForm(dFormik)}>Submit</ThemeButton>
                    </Fragment>
                  }
                </Fragment>
              }
              {props.modalType === "telegram" &&
                <Fragment>
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
                    className="w-full"
                    onClick={() => loginTelegram((data) => {
                      if(data !== false) dispatch({telegramUser: data})
                    })}
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
                      <ThemeButton className="w-full" color="warning" onClick={async () => await submitFormikForm(tFormik)}>Submit</ThemeButton>
                    </Fragment>
                  }
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

export default ProfileAdminSocmedModal