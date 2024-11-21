"use client"
import { CopyIcon, DiscordIcon, TelegramIcon, TwitterXIcon } from "@/components/assets/icons";
import { DropzoneReturnValues, ThemeAvatar, ThemeButton, ThemeCard, ThemeChip, ThemeCode, ThemeDropzone, ThemeInput, ThemeModal, ThemeModalBody, ThemeModalHeader, ThemeTabs, ThemeTextarea } from "@/components/reusables/NextuiTheme";
import { getListDescription, middleEllipsisText, redirectToNewPage, submitFormikForm, useDebounce, useMetamaskLogo, useMinimizedState } from "@/helper";
import { useGlobalContext } from "@/providers/stores";
import { CardBody, ModalContent, Tab } from "@nextui-org/react";
import { Manrope } from "@next/font/google";
import { FC, useEffect } from "react";
import dataListChain from '@/localeData/list_chains.json'
import NextImage from "next/image"
import { IClient, IManageAdminInviteRequest, IUser, IUserBy } from "@/types/service-types";
import { AlertModalType, useModal } from "@/providers/modal";
import useSocmedAdminAuthService from "@/services/socmed-admin-auth-service";
import { ProfileAdminSocmedModal, TelegramAuth } from "../reusables";
import CONSTANT from "@/Constant";
import { useFormik } from "formik";
import useClientService from "@/services/client-service";
import * as yup from "yup"
import useManageAdmin from "@/services/manage-admin-service";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import MetamaskIcon from "@/components/assets/images/metamask.png"
import { useRouter } from "next/navigation";

const manrope700 = Manrope({weight: "700", subsets: ["latin"]})

export interface ProfileComponentPageProps {
  clientProject?: IClient;
  onUpdated?: (cp: IClient) => void;
}

interface InitialState {
  origin: string;
  href: string;
  modalType?: "discord" | "telegram";
  telegramUser?: TUser;
  inviteMethod?: "link" | "email";
  selectedAdmin?: IUser;
  isUpdateMode: boolean;
  isLoading: boolean;
}

interface IProfileForm extends Omit<IClient, "logo"> {
  logo: DropzoneReturnValues;
}

const ProfileComponentPage: FC<ProfileComponentPageProps> = (props) => {
  const { twitterAuth } = useSocmedAdminAuthService()
  const { telegramAuth: telegramAdminAuth } = useSocmedAdminAuthService()
  const { getManageAdmin, inviteByEmail } = useManageAdmin()
  const { updateClient } = useClientService()
  const feedbackModal = useModal()
  const router = useRouter()
  const { clientProject } = props
  const { state: { isLight, token } } = useGlobalContext()
  const [state, dispatch] = useMinimizedState<InitialState>({
    origin: "",
    href: "",
    modalType: undefined,
    isUpdateMode: true,
    isLoading: false,
  })
  const metamaskLogo = useMetamaskLogo({
    width: 140,
    height: 140
  }, [!!state.selectedAdmin])

  useEffect(()=>{
    dispatch({
      origin: window.origin,
      href: window.location.href
    })
  }, [])

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);

    toast.success("Successfully copied!")
  }

  const profileFormik = useFormik<Partial<IProfileForm>>({
    initialValues: {},
    onSubmit: (vals, fHelper) => {
      if(props.clientProject?._id) {
        dispatch({isLoading: true})
        updateClient({
          clientProjectId: props.clientProject._id,
          username: vals.username ?? props.clientProject.username,
          name: vals.name ?? props.clientProject.name,
          email: vals.email ?? props.clientProject.email,
          description: vals.description ?? "",
          url: vals.url ?? "",
          chains: props.clientProject.chains,
          logo: vals.logo?.rawFiles?.[0] ?? undefined
        })
          .then(res => {
            props.onUpdated?.(res.data.data)

            fHelper.setValues({
              ...res.data.data,
              logo: res.data.data.logo ? {files: [res.data.data.logo], rawFiles: []} : undefined,
              username: state.isUpdateMode ? res.data.data.username : `${state.origin}/${res.data.data.username}`
            })

            // dispatch({isUpdateMode: false})

            toast.success(`Update profile is successfully!`)
          })
          .catch((err: AxiosError<ResponseAPI<null>>) => {
            if(err.response?.data?.message) toast.error(err.response.data.message)
          })
          .finally(()=>dispatch({isLoading: false}))
      }
    },
    validationSchema: yup.object().shape({
      url: yup.string(),
      description: yup.string(),
      email: yup.string().email("Email is not valid!")
    })
  })

  useEffect(()=>{
    if(props.clientProject) profileFormik.setValues({
      ...props.clientProject,
      logo: props.clientProject.logo ? {files: [props.clientProject.logo], rawFiles: []} : undefined,
      username: state.isUpdateMode ? props.clientProject.username : `${state.origin}/${props.clientProject.username}`
    })
  }, [state.isUpdateMode, props.clientProject])

  const inviteFormik = useFormik<Partial<Omit<IManageAdminInviteRequest, "username">>>({
    initialValues: {},
    onSubmit: (vals, iHelper) => {
      if(clientProject?.username && vals.email && token) inviteByEmail({
        username: clientProject?.username,
        email: vals.email
      }, { Authorization: "Bearer " + token })
        .then(() => {
          toast.success('Invite email is successfully sent!')
          iHelper.resetForm()
        })
        .catch(err => console.log(err))
    },
    validationSchema: yup.object().shape({
      email: yup.string().email("Email is not valid!").required("Email is required!")
    })
  })

  const getConfirmStatus = (isConfirm?: boolean) => {
    if(typeof isConfirm === "boolean") {
      if(isConfirm) return "CONFIRMED"
      else return "UNCONFIRMED"
    }
    else return undefined
  }

  const avatarRenderer = () => {
    if(state.isUpdateMode) return (
      <ThemeDropzone 
        formik={{
          config: profileFormik,
          name: "logo"
        }}
        supportedMimes={["image/png","image/jpeg"]}
        maxByteSize={5e+6}
      />
    )
    else return (
      <ThemeAvatar 
        src={clientProject?.logo} 
        radius="lg" 
        className="w-[200px] min-h-[200px]" 
      />
    )
  }

  const actionButtonRenderer = () => {
    if(state.isUpdateMode) return (
      <div className="flex flex-row items-center gap-2 w-full">
        {/* <ThemeButton
          className="w-full"
          radius="full"
          size="sm"
          onClick={()=>dispatch({isUpdateMode: false})}
        >
          Cancel
        </ThemeButton> */}
        <ThemeButton
          className="w-full"
          color="primary"
          radius="full"
          size="sm"
          onClick={()=> {
            if (props.clientProject?._id) {
              feedbackModal({
                type: AlertModalType.WARNING,
                title: "Confirmation",
                description: "Are you sure want to update profile?",
                okButtonProps: {
                  children: "Save",
                  color: "primary"
                },
                isCancelButton: true,
                onOk: () => {
                  submitFormikForm(profileFormik)
                }
              })
            } else {
              feedbackModal({
                type: AlertModalType.WARNING,
                title: "Warning",
                description: "Project not found, select a project first or please re-login!",
                okButtonProps: {
                  children: "Ok",
                  color: "warning"
                },
              })
              router.push('/project-signup')
            }
          }}
        >
          Update Profile
        </ThemeButton>
      </div>
    ) 
    else return (
      <ThemeButton
        color="primary"
        radius="full"
        size="sm"
        onClick={()=>dispatch({isUpdateMode: true})}
      >
        Update Profile
      </ThemeButton>
    )
  }
  const getCreatedBy = (created_by?: IUserBy) => typeof created_by === "object" ? created_by._id : created_by

  return (
    <ThemeCard>
      <CardBody className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:p-8">
        {avatarRenderer()}
        <div className="flex flex-col gap-8 w-full lg:w-2/3">
          <div className="flex flex-row gap-4">
            <ThemeInput 
              label="Website"
              labelPlacement="outside"
              placeholder="Website"
              formik={{
                config: profileFormik,
                name: "url"
              }}
              className="w-1/2"
              isDisabled={!state.isUpdateMode}
            />
            <ThemeInput 
              label="Community URL"
              labelPlacement="outside"
              placeholder="[username]"
              endContent={<ThemeButton onClick={()=>copyToClipboard(state.origin + `/${clientProject?.username}`)} size="sm" variant="light" isIconOnly><CopyIcon /></ThemeButton>}
              formik={{
                config: profileFormik,
                name: "username"
              }}
              startContent={state.isUpdateMode ? state.origin + "/" : undefined}
              className="w-1/2"
              disabled
            />
          </div>
          <ThemeTextarea 
            label="Introduction"
            labelPlacement="outside"
            placeholder="Describe your community so that we can know you better!"
            formik={{
              config: profileFormik,
              name: "description"
            }}
            isDisabled={!state.isUpdateMode}
          />
          <div className="flex flex-col gap-2">
            <div className={`w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 ${isLight ? "text-black" : "text-white"}`}>
              Chain
            </div>
            <div className='flex flex-row flex-nowrap overflow-x-auto gap-1 w-full pb-3'>
              {dataListChain.filter(dc => (clientProject?.chains?.map((x) => Number(x)) ?? []).includes(dc.chain_id)).map((chain, index) => (
                <ThemeChip
                  classNames={{
                    base: `px-2 py-5 min-w-[100px] w-full cursor-pointer`,
                    content: "text-sm text-center"
                  }}
                  key={index}
                  startContent={
                    <div className="mx-1">
                      <NextImage
                        src={chain.icon_url}
                        alt={chain.symbol}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    </div>
                  }
                >
                  {chain.symbol}
                </ThemeChip>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className={`${manrope700.className} text-[24px]`}>Connect Socials</h2>
            <div className="flex flex-row gap-2 items-center">
              <ThemeButton 
                startContent={<TwitterXIcon />} 
                radius="full"
                onClick={()=> {
                  if(token && props.clientProject?._id && state.href) {
                    twitterAuth({
                      authorization: "Bearer " + token, 
                      client_project_id: props.clientProject?._id,
                      redirect_url: state.href
                    })
                  }
                }}
                color={props.clientProject?.twitter?.username || props.clientProject?.twitter?.displayName ? "success" : "default"}
              >
                {props.clientProject?.twitter?.username ?? props.clientProject?.twitter?.displayName ?? 'Connect X'}
              </ThemeButton>
              <ThemeButton 
                startContent={<DiscordIcon />} 
                radius="full"
                color={props.clientProject?.discord?.username || props.clientProject?.discord?.global_name || props.clientProject?.discord?.server_id ? "success" : "default"}
                onClick={()=>dispatch({modalType: "discord"})}
              >
                {props.clientProject?.discord?.username ?? props.clientProject?.discord?.global_name ?? props.clientProject?.discord?.server_id ?? 'Connect Discord'}
              </ThemeButton>
              <ThemeButton 
                startContent={<TelegramIcon />} 
                radius="full"
                onClick={()=>dispatch({modalType: "telegram"})}
              >
                {props.clientProject?.telegram?.username ?? 'Connect Telegram'}
              </ThemeButton>
            </div>
          </div>
          <ThemeInput 
            label="Email"
            labelPlacement="outside"
            placeholder="Email"
            formik={{
              config: profileFormik,
              name: "email"
            }}
            isDisabled={!state.isUpdateMode}
          />
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <h2 className={`${manrope700.className} text-[24px]`}>Admins</h2>
              <ThemeButton
                size="sm"
                radius="full"
                onClick={()=>dispatch({inviteMethod: "email"})}
              >
                Invite Admins
              </ThemeButton>
            </div>
            <div>
              {/* {(props.clientProject?.admins ?? []).length === 0 && "-"} */}
              {(props.clientProject?.admins ?? []).map((admin, index) => typeof admin === "object" &&
                <ThemeChip
                  key={index}
                  size="sm"
                  classNames={{
                    base: `px-2 py-5 w-full cursor-pointer m-2`,
                    content: "text-sm text-center cursor-pointer"
                  }}
                  className="p-4"
                  onClick={()=>dispatch({selectedAdmin: admin})}
                  color={admin._id === getCreatedBy(props.clientProject?.created_by) ? "warning" : "default"}
                >
                  {admin._id === getCreatedBy(props.clientProject?.created_by) && "[OWNER]"} {admin.email ? middleEllipsisText(admin.email) : admin.wallet_address ? middleEllipsisText(admin.wallet_address) : "-"}
                </ThemeChip>  
              )}
            </div>
          </div>
          {actionButtonRenderer()}
        </div>
      </CardBody>
      <ThemeModal
        isOpen={!!state.inviteMethod}
        onClose={() => {
          dispatch({inviteMethod: undefined})
          inviteFormik.resetForm()
        }}
      >
        <ModalContent>
          <ThemeModalHeader>Add Admins</ThemeModalHeader>
          <ThemeModalBody>
            <ThemeTabs 
              disabledKeys={["link"]} 
              selectedKey={state.inviteMethod}
              onSelectionChange={(key) => dispatch({inviteMethod: key as "link" | "email"})}
            >
              <Tab key="link" title="Invite by Link">
                <div className="flex flex-row items-center gap-2">
                  <ThemeCode size="md" className="min-w-[400px]">{state.origin + `/${clientProject?.username}`}</ThemeCode>
                  <ThemeButton
                    isIconOnly
                    size="sm"
                    onClick={()=>copyToClipboard(state.origin + `/${clientProject?.username}`)}
                  >
                    <CopyIcon />
                  </ThemeButton>
                </div>
              </Tab>
              <Tab key="email" title="Invite by Email" className="flex flex-col gap-4">
                <ThemeInput 
                  label="Input Email Admin's Candidate"
                  labelPlacement="outside"
                  placeholder="name@domain.com"
                  size="sm"
                  formik={{
                    config: inviteFormik,
                    name: "email"
                  }}
                />
                <ThemeButton
                  size="sm"
                  color="primary"
                  onClick={()=>submitFormikForm(inviteFormik)}
                  className="w-full"
                >
                  Sent
                </ThemeButton>
              </Tab>
            </ThemeTabs>
          </ThemeModalBody>
        </ModalContent>
      </ThemeModal>
      <ThemeModal
        isOpen={!!state.selectedAdmin}
        onClose={() => dispatch({selectedAdmin: undefined})}
      >
        <ModalContent>
          <ThemeModalHeader>Admin Detail</ThemeModalHeader>
          <ThemeModalBody className="flex flex-col items-center justify-center gap-8">
            {state.selectedAdmin?.avatar ?
              <div className="relative w-[170px] h-[170px] rounded-full overflow-hidden">
                <NextImage 
                  src={state.selectedAdmin?.avatar}
                  alt="admin-avatar"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              : 
              <ThemeButton
                radius="full"
                className="w-fit h-fit p-4"
                isIconOnly
                disabled
                isDisabled
              >
                {metamaskLogo}
              </ThemeButton>
            }
            <div className="flex flex-col gap-2 w-full">
              {getListDescription("Email", state.selectedAdmin?.email)}
              {getListDescription("Name", state.selectedAdmin?.name)}
              {getListDescription("Role", state.selectedAdmin?._id === getCreatedBy(props.clientProject?.created_by) ? "Owner" : "Admin")}
              {getListDescription("Wallet Address", state.selectedAdmin?.wallet_address ? (
                <ThemeButton
                  size="sm"
                  radius="full"
                  onClick={()=>copyToClipboard(state.selectedAdmin?.wallet_address ?? "")}
                  startContent={<CopyIcon />}
                >
                  {middleEllipsisText(state.selectedAdmin.wallet_address)}
                </ThemeButton>
              ) : "-")}
            </div>
          </ThemeModalBody>
        </ModalContent>
      </ThemeModal>
      {state.origin &&
        <TelegramAuth 
          onAuthCallback={(user) => dispatch({telegramUser: user})}
          botName={CONSTANT.TELEGRAM_BOT}
          requestAccess={true}
          usePic={true}
          redirectUrl={state.origin}
          className="hidden"
        />
      }
      <ProfileAdminSocmedModal 
        modalType={state.modalType}
        isOpen={!!state.modalType}
        onClose={()=>dispatch({modalType: undefined})}
        onTelegramAuth={(clientProject) => {
          redirectToNewPage(telegramAdminAuth(), true)
        }}
        clientProjectId={props.clientProject?._id}
        onDiscordAuth={(clientProject)=> {
          redirectToNewPage(CONSTANT.DISCORD_GROUP_OAUTH2, true)
        }}
        onTelegramAuthSubmit={(clientProject) => {
          if(clientProject) {
            props.onUpdated?.(clientProject)
            dispatch({modalType: undefined})
            feedbackModal({
              type: AlertModalType.SUCCESS,
              title: "Success",
              description: "Successfully Updated Data!"
            })
          }
        }}
        onDiscordAuthSubmit={(clientProject) => {
          if(clientProject) {
            props.onUpdated?.(clientProject)
            dispatch({modalType: undefined})
            feedbackModal({
              type: AlertModalType.SUCCESS,
              title: "Success",
              description: "Successfully Updated Data!"
            })
          }
        }}
      />
    </ThemeCard>
  )
}

export default ProfileComponentPage