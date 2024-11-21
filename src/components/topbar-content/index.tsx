"use client"
import { FC, Fragment, ReactNode, useEffect } from "react"
import { AntdInfoIcon, ApartmentIcon, BurgerIcon, DiscordIcon, LinkedInIcon, MoonIcon, ProgrammingWebIcon, SunIcon, TelegramIcon, TwitterXIcon } from "../assets/icons";
import { useAccount, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { addSearchParams, getSignMessage, loginTelegram, submitFormikForm, useDebounce, useMinimizedState } from "@/helper";
import { useGlobalContext } from "@/providers/stores";
import { DropzoneReturnValues, ThemeAlert, ThemeAlertType, ThemeAvatar, ThemeButton, ThemeChip, ThemeDropzone, ThemeImage, ThemeInput, ThemeListbox, ThemeModal, ThemeModalBody, ThemeModalHeader, ThemeSwitch, ThemeUser } from "../reusables/NextuiTheme";
import useAuthService from "@/services/auth-service";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { defaultPath, marketplacePath, profilePath, questboardPath, questsPath } from "@/helper/route-path";
import { AlertModalType, useModal } from "@/providers/modal";
import { ListboxItem, ModalContent, useDisclosure } from "@nextui-org/react";
import NextImage from "next/image"
import { DM_Sans, Manrope, Roboto } from "next/font/google";
import { useFormik } from "formik";
import useProfileService from "@/services/profile-service";
import { ActiveTabEnum, ActiveTabKey, IClient, IEmailSetRequest, IEmailVerifyRequest, IGetProfile, INameSetRequest } from "@/types/service-types";
import * as yup from "yup"
import { Inner2Wrapper, InnerWrapper, TelegramAuth } from "../reusables";
import { LogoWithText } from "../assets";
import NextLink from "next/link"
import CONSTANT from "@/Constant";
import useSocmedAuthService from "@/services/socmed-auth-service";
import { toast } from "react-toastify";
import usePublicClientService from "@/services/public-client-service";
import useClientService from "@/services/client-service";
import MetamaskIcon from "@/components/assets/images/metamask.png"

const manrope400 = Manrope({weight: "400", subsets: ["latin"]})
const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope700 = Manrope({weight: "700", subsets: ["latin"]})
const roboto400 = Roboto({weight: "400", subsets: ["latin"]})
const dmSans500 = DM_Sans({ weight: "500", subsets: ["latin"] })

interface RedirectMenu {
  label: ReactNode;
  className?: string;
  icon: ReactNode;
  redirectTo?: () => string | undefined;
  isDisabled?: boolean;
  isAdmin?: boolean;
  isShow?: boolean;
}

interface InitialState {
  isLoading: boolean;
  isNameUpdate: boolean;
  isProfileOpen: boolean;
  isEmailSetter: boolean;
  isVerifySetter: boolean;
  origin: string;
  userStatus?: "ADMIN" | "OWNER"
  client?: IClient;
}

type IProfileForm = IEmailSetRequest & { file_avatar?: DropzoneReturnValues }

export interface TopBarContentProps {
  className?: string;
}

const TopBarContent: FC<TopBarContentProps> = (props) => {
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state: { token, isLight, isSignatureLoading, profile, showMenu }, dispatch: globalDispatch } = useGlobalContext()
  const [state, dispatch] = useMinimizedState<InitialState>({
    isLoading: false,
    isNameUpdate: false,
    isProfileOpen: false,
    isEmailSetter: false,
    isVerifySetter: false,
    origin: ""
  })
  const openModal = useModal()
  const { login, getProfile } = useAuthService()
  const { setAvatar, setEmail, verifiedEmail, setName } = useProfileService()
  const { twitterAuth, discordAuth, telegramAuth } = useSocmedAuthService()
  const { getProjectByUsername } = usePublicClientService()
  const { getClientDetail } = useClientService()
  const clientProjectId = searchParams.get("clientProjectId")
  const username = searchParams.get("username") ?? params.username

  useDebounce<[string | Array<string> | undefined, string | null, string, IGetProfile | undefined, string | Array<string> | null]>((project, cpId, t, p, uname)=>{
    if(uname ?? project) {
      getProjectByUsername(uname ? String(uname) : String(project))
        .then(res => {
          dispatch({client: res.data.data})
          const createById = typeof res.data.data.created_by === "object" ? res.data.data.created_by._id : res.data.data.created_by
          const admins = res.data.data.admins.map(admin => {
            if(typeof admin === "object") return admin._id
            else return admin
          })

          if(createById === p?.id) dispatch({userStatus: "OWNER"})
          else if(admins.find(admin => admin === p?.id)) dispatch({userStatus: "ADMIN"})
          else dispatch({userStatus: undefined})
        })
        .catch(err => console.log(err))
    }
    else if(cpId && t) {
      getClientDetail({clientProjectId: cpId}, {Authorization: "Bearer " + t})
        .then(res => {
          dispatch({client: res.data.data})
          const createById = typeof res.data.data.created_by === "object" ? res.data.data.created_by._id : res.data.data.created_by
          const admins = res.data.data.admins.map(admin => {
            if(typeof admin === "object") return admin._id
            else return admin
          })

          if(createById === p?.id) dispatch({userStatus: "OWNER"})
          else if(admins.find(admin => admin === p?.id)) dispatch({userStatus: "ADMIN"})
          else dispatch({userStatus: undefined})
        })
        .catch(err => console.log(err))
    }
    else dispatch({userStatus: undefined})
  }, [params.project, clientProjectId, token, profile, username])

  useEffect(()=>{
    dispatch({origin: window.location.href})
  }, [])

  const isShowMenu = () => {
    if(pathname !== defaultPath) {
      if(params.project ?? profile?.id) return true
      else return false
    }
    else return false
  }

  const redirectMenus: Array<RedirectMenu> = [
    {
      label: "Leaderboard",
      className: "bg-success/10 text-success",
      icon: <ApartmentIcon />,
      isShow: !!params.project,
      redirectTo: () => {
        if(params.project) return addSearchParams(String(params.project), {selectedTab: ActiveTabKey.LEADERBOARD})
        else return undefined
      }
    },
    {
      label: "Quests",
      className: "bg-success/10 text-success",
      icon: <ApartmentIcon />,
      isShow: isShowMenu(),
      redirectTo: () => {
        if(state.client?.username) {
          // if(params.project) return `/${state.client.username}` + questsPath
          if(params.project) return addSearchParams(String(params.project), {selectedTab: ActiveTabKey.QUEST})
          else return questboardPath + `/${state.client.username}`
        }
        else return undefined
      }
    },
    {
      label: "XP Marketplace",
      className: "bg-secondary/10 text-secondary",
      icon: <ApartmentIcon />,
      isShow: isShowMenu(),
      redirectTo: () => {
        if(state.client?.username) {
          if(params.project) return undefined
          // if(params.project) return `/${state.client.username}` + marketplacePath
          else if(state.userStatus && state.client._id) return addSearchParams(marketplacePath, {clientProjectId: state.client._id, isCreate: true})
          else return undefined
        }
        else return undefined
      }
    },
    {
      label: "Analytics",
      className: "bg-secondary/10 text-primary",
      icon: <ApartmentIcon />,
      isShow: isShowMenu(),
      isDisabled: true
    },
    {
      label: "Vesting",
      className: "bg-secondary/10 text-primary",
      icon: <ApartmentIcon />,
      isShow: !!params.project && isShowMenu(),
      isDisabled: true
    },
    {
      label: "My Profile",
      className: "bg-secondary/10 text-primary",
      icon: <ApartmentIcon />,
      isAdmin: true,
      isShow: !!state.userStatus && isShowMenu(),
      redirectTo: () => {
        if(state.client?.username) return addSearchParams(profilePath, {username: state.client?.username, tab: ActiveTabEnum.PROFILE})
        else return undefined
      }
      // isDisabled: true
    },
    // {
    //   label: "Games",
    //   className: "bg-primary/10 text-primary",
    //   icon: <ApartmentIcon />,
    //   isDisabled: true
    // },
  ]

  const nameFormik = useFormik<Partial<INameSetRequest>>({
    initialValues: {},
    onSubmit: (vals, nHelper) => {
      if(vals.name && token && profile) {
        dispatch({isLoading: true})
        setName({name: vals.name}, {Authorization: "Bearer " + token})
          .then(() => {
            globalDispatch({
              profile: {
                ...profile,
                name: vals.name
              }
            })
            toast.success("Successfully updated your name!")
            dispatch({isNameUpdate: false})
            nHelper.resetForm()
          })
          .catch(err => console.log(err))
          .finally(()=>dispatch({isLoading: false}))
      }
    },
    validationSchema: yup.object().shape({
      name: yup.string().required("Name must be fill!")
    })
  })

  const profileFormik = useFormik<Partial<IProfileForm>>({
    initialValues: {},
    onSubmit: (vals) => {
      if(vals.email && token) {
        dispatch({isLoading: true})
        setEmail({email: vals.email},{Authorization: "Bearer " + token})
          .then(() => dispatch({isVerifySetter: true}))
          .catch(err => console.log(err))
          .finally(()=>dispatch({isLoading: false}))
      }
    },
    validationSchema: yup.object().shape({
      email: yup.string().email("Email is not valid!").required("Email must be fill!")
    })
  })
  const verifyFormik = useFormik<Partial<IEmailVerifyRequest>>({
    initialValues: {},
    onSubmit: (vals, fHelper) => {
      if(vals.token_verified && token) {
        dispatch({isLoading: true})
        verifiedEmail({token_verified: vals.token_verified},{Authorization: "Bearer " + token})
          .then(() => {
            dispatch({
              isVerifySetter: false,
              isEmailSetter: false
            })

            openModal({
              type: AlertModalType.SUCCESS,
              title: "Success!",
              description: "Successfully updated email!"
            })

            getProfileService(token)

            fHelper.resetForm()
            profileFormik.resetForm()
          })
          .catch(err => console.log(err))
          .finally(()=>dispatch({isLoading: false}))
      }
    },
    validationSchema: yup.object().shape({
      token_verified: yup.string().required("Verify Token must be fill!")
    })
  })
  const { address, isDisconnected } = useAccount()
  const { data, isLoading, isSuccess, signMessageAsync } = useSignMessage({
    message: getSignMessage(), // signature hash can use for login, verify data, etc
  })

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
              title: "Oops!",
              description: "Unexpected error! Please re-connect your wallet!"
            })
          })
          .finally(()=>globalDispatch({isSignatureLoading: false}))
      })
      .catch(err => {
        console.log(err)
        globalDispatch({isSignatureLoading: false})
      })
  }

  useDebounce<[`0x${string}` | undefined, `0x${string}` | undefined, boolean, string]>((d, wallet_address, i, t)=>{
    if(wallet_address && !t) {
      setTimeout(()=>{
        loginService(getSignMessage(), wallet_address)
      }, 400)
    }
    else if(i) {
      globalDispatch({
        profile: undefined,
        token: undefined
      })
    }
  }, [data, address, isDisconnected, token], 400)

  useDebounce<[string, Array<File> | undefined]>((t, rf)=>{
    if(t && rf?.[0]) {
      setAvatar({file_avatar: rf[0]}, {Authorization: "Bearer " + t})
        .then(()=>{
          openModal({
            type: AlertModalType.SUCCESS,
            title: "Success!",
            description: "Successfully updated avatar!"
          })

          getProfileService(t)
        })
        .catch(err => console.log(err))
    }
  }, [token, profileFormik.values.file_avatar?.rawFiles])

  const getProfileService = (t: string) => {
    getProfile({Authorization: "Bearer " + t})
      .then(res => globalDispatch({profile: res.data.data}))
      .catch(err => console.log(err))
  }

  useDebounce<[string]>((t)=>{
    if(t) getProfileService(t)
    else globalDispatch({profile: undefined})
  }, [token])

  const customConnectButton = (address: string) => {
    return (
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

          const customButtonRenderer = () => {
            if (!connected) {
              return (
                <ThemeButton radius="full" onClick={openConnectModal} type="button">
                  Connect Wallet
                </ThemeButton>
              );
            }

            if (chain.unsupported) {
              return (
                <ThemeButton 
                  radius="full" 
                  onClick={openChainModal} 
                  type="button"
                  variant="light"
                >
                  This project doesn&apos;t support this Network.
                </ThemeButton>
              );
            }

            return (
              <div className="flex flex-row items-center gap-2">
                {/* <ThemeButton
                  onClick={openChainModal}
                  type="button"
                  variant="ghost"
                  radius="full"
                >
                  {chain.hasIcon && chain.iconUrl && <ThemeImage className="w-[20px] h-[20px]" src={chain.iconUrl} alt={chain.name ?? 'Chain icon'} />}
                  {chain.name}
                </ThemeButton> */}

                <ThemeButton 
                  onClick={openAccountModal} 
                  type="button"
                  variant="light"
                  radius="full"
                >
                  {account.displayName}
                  {/* {account.displayBalance
                    ? ` (${account.displayBalance})`
                    : ''} */}
                </ThemeButton>

                {(!data && !isSuccess || !token) &&
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
                }

                <ThemeButton
                  isIconOnly
                  variant="ghost"
                  radius="full"
                  onClick={()=>dispatch({isProfileOpen: true})}
                >
                  <NextImage 
                    src={profile?.avatar ?? profile?.twitter?.avatar ?? profile?.telegram?.avatar ?? MetamaskIcon}
                    alt="avatar-profile-img"
                    className="rounded-full"
                    width={100}
                    height={100}
                  />
                </ThemeButton>
              </div>
            )
          }
  
          return customButtonRenderer()
        }}
      </ConnectButton.Custom>
    )
  }

  const renderer = () => {
    if(address) return customConnectButton(address)
    else return (
      <div className="flex lg:items-center gap-3 lg:gap-1 flex-row">
        <button className={`bg-[#ffffff0d] border border-black rounded-3xl p-1 h-[40px] w-[40px] flex items-center justify-center`}><span className={isLight ? "text-black" : "text-white"}><ProgrammingWebIcon /></span></button>
        <button className={`bg-[#ffffff0d] border border-black rounded-3xl p-1 h-[40px] w-[40px] flex items-center justify-center`}><span className={isLight ? "text-black" : "text-white"}><TwitterXIcon /></span></button>
        <button className={`bg-[#ffffff0d] border border-black rounded-3xl p-1 h-[40px] w-[40px] flex items-center justify-center`}><span className={isLight ? "text-black" : "text-white"}><DiscordIcon /></span></button>
        <button className={`bg-[#ffffff0d] border border-black rounded-3xl p-1 h-[40px] w-[40px] flex items-center justify-center`}><span className={isLight ? "text-black" : "text-white"}><TelegramIcon /></span></button>
        <button className={`bg-[#ffffff0d] border border-black rounded-3xl p-1 h-[40px] w-[40px] flex items-center justify-center`}><span className={isLight ? "text-black" : "text-white"}><LinkedInIcon /></span></button>
      </div>
    )
  }

  const profileModalContents = [
    { 
      label: "Name", 
      rightLabel: (
        <ThemeButton
          size="sm"
          color={profile?.name ? "success" : "primary"}
          onClick={()=>{
            dispatch({isNameUpdate: true})
            nameFormik.setFieldValue("name", profile?.name ?? "")
          }}
          isLoading={state.isLoading}
          isDisabled={state.isLoading}
        >
          {profile?.name ? "Change Name" : "Set Name"}
        </ThemeButton>
      ),
      value: state.isNameUpdate ? (
        <div className="flex flex-col gap-2 w-full">
          <ThemeInput 
            placeholder="Name"
            size="sm"
            formik={{
              config: nameFormik,
              name: "name"
            }}
            isDisabled={state.isLoading}
          />
          <div className="flex flex-row items-center gap-2">
            <ThemeButton
              onClick={()=>{
                dispatch({isNameUpdate: false})
                nameFormik.resetForm()
              }}
              size="sm"
              className="w-full"
              isLoading={state.isLoading}
              isDisabled={state.isLoading}
            >
              Cancel
            </ThemeButton>
            <ThemeButton
              onClick={()=>submitFormikForm(nameFormik)}
              color="success"
              size="sm"
              className="w-full"
              isLoading={state.isLoading}
              isDisabled={state.isLoading}
            >
              Save
            </ThemeButton>
          </div>
        </div>
      ) : (profile?.name ?? "-" )
    },
    { 
      label: "Email", 
      rightLabel: (
        <ThemeButton
          size="sm"
          color={profile?.email ? "success" : "primary"}
          onClick={()=>dispatch({isEmailSetter: true, isVerifySetter: false})}
          isLoading={state.isLoading}
          isDisabled={state.isLoading}
        >
          {profile?.email ? "Change Email" : "Set Email"}
        </ThemeButton>
      ),
      value: state.isEmailSetter ? (
        <div className="flex flex-col gap-2 w-full">
          <ThemeInput 
            placeholder="Email"
            size="sm"
            formik={{
              config: profileFormik,
              name: "email"
            }}
            isDisabled={state.isVerifySetter || state.isLoading}
          />
          {state.isVerifySetter ?
            <Fragment>
              <ThemeInput 
                placeholder="Verify Token"
                size="sm"
                formik={{
                  config: verifyFormik,
                  name: "token_verified"
                }}
                isDisabled={state.isLoading}
              />
              <ThemeAlert
                title="Notes"
                type={ThemeAlertType.SUCCESS}
              >
                Check your inbox email or spam email
              </ThemeAlert>
              <div className="flex flex-row items-center gap-2 justify-between">
                <ThemeButton
                  size="sm"
                  className="w-full"
                  onClick={async () => await submitFormikForm(profileFormik)}
                  isDisabled={state.isLoading}
                  isLoading={state.isLoading}
                >
                  Resend
                </ThemeButton>
                <ThemeButton
                  color="success"
                  size="sm"
                  className="w-full"
                  onClick={async () => await submitFormikForm(verifyFormik)}
                  isDisabled={state.isLoading}
                  isLoading={state.isLoading}
                >
                  Verify
                </ThemeButton>
              </div>
            </Fragment>
            :
            <div className="flex flex-row items-center gap-2 justify-between">
              <ThemeButton
                color="primary"
                size="sm"
                className="w-full"
                isDisabled={state.isLoading}
                isLoading={state.isLoading}
                onClick={profileFormik.submitForm}
              >
                Submit
              </ThemeButton>
              <ThemeButton
                color="danger"
                size="sm"
                className="w-full"
                isDisabled={state.isLoading}
                isLoading={state.isLoading}
                onClick={()=>dispatch({isEmailSetter: false})}
              >
                Cancel
              </ThemeButton>
            </div>
          }
        </div>
      ) : (profile?.email ?? "-" )
    },
  ]

  const contentRenderer = (className?: string) => {
    return (
      <div className={`flex-col lg:flex-row items-start lg:items-center gap-2 ${className ?? ""}`}>
        <ThemeListbox
          className="block lg:hidden w-11/12"
          itemClasses={{
            base: "p-4"
          }}
          disabledKeys={redirectMenus.filter(rm => rm.isDisabled === true).map((rm, index) => rm.label?.toString() ?? index)}
        >
          {redirectMenus.map((rm, index) =>
            <ListboxItem 
              key={rm.label?.toString() ?? index}
              startContent={
                rm.icon ?
                <div className={`${rm.className ?? ""} flex items-center rounded-small justify-center w-7 h-7`}>
                  {rm.icon}
                </div> : undefined
              }
              onClick={()=> {
                const redirectTo = rm.redirectTo?.()
                if(redirectTo) router.push(redirectTo)
              }}
            >
              {rm.isDisabled ?
                <div className="flex flex-col">
                  <h3>{rm.label}</h3>
                  <h3 className={`${dmSans500.className} text-[8px] opacity-30 leading-[10px]`}>Coming Soon</h3>
                </div>
                : rm.label
              }
            </ListboxItem>
          )}
        </ThemeListbox>
        {renderer()}
        <ThemeSwitch 
          isSelected={isLight}
          onValueChange={(isLight)=>globalDispatch({isLight})}
          size="lg"
          color="success"
          startContent={<SunIcon />}
          endContent={<MoonIcon />}
        />
        {(!address && pathname !== defaultPath) &&
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
            
            return (
              <ThemeButton
                radius="full"
                variant="solid"
                color="warning"
                isLoading={authenticationStatus === 'loading'}
                isDisabled={!ready}
                onClick={openConnectModal}
              >
                {ready ? "Connect Wallet" : "Please wait ..."}
              </ThemeButton>
            )
          }}
          </ConnectButton.Custom>
        }
        <ThemeModal
          isOpen={state.isProfileOpen}
          onClose={()=>dispatch({isProfileOpen: false})}
          size="2xl"
        >
          <ModalContent>
            <ThemeModalHeader>Your Profile</ThemeModalHeader>
            <ThemeModalBody className="flex flex-col lg:flex-row gap-8 lg:p-4">
              <ThemeDropzone
                formik={{
                  config: profileFormik,
                  name: "file_avatar"
                }}
                supportedMimes={["image/png","image/jpeg"]}
                maxByteSize={5e+6}
                customRender={(getRootProps, getInputProps, values) =>
                  <div className="flex items-center justify-center rounded-full w-[150px] h-[150px] overflow-hidden" {...getRootProps()}>
                    <input {...getInputProps()} />
                    <NextImage 
                      src={values?.files?.[0]?.toString() ?? profile?.avatar ?? profile?.twitter?.avatar ?? profile?.telegram?.avatar ?? MetamaskIcon}
                      alt="avatar-profile-img"
                      width={150}
                      height={150}
                    />
                  </div>
                }
              />
              <div className="flex flex-col gap-4 w-full">
                {profileModalContents.map((pmc, index) =>
                  <div className="flex flex-col gap-2" key={index}>
                    {pmc.rightLabel ?
                      <div className="flex flex-row items-center justify-between">
                        <h1 className={`${manrope700.className} text-[20px] leading-8`}>{pmc.label}</h1>
                        {pmc.rightLabel}
                      </div>
                      :
                      <h1 className={`${manrope700.className} text-[20px] leading-8`}>{pmc.label}</h1>
                    }
                    <h3 className={`${roboto400.className}`}>{pmc.value}</h3>
                  </div>
                )}
                <div className="flex flex-row items-center gap-2">
                  <ThemeButton
                    size="sm"
                    radius="full"
                    startContent={<TelegramIcon />}
                    color={profile?.telegram?.username ? "success" : "default"}
                    onClick={()=>{
                      loginTelegram((user) => {
                        if(user !== false && token) telegramAuth(user, {Authorization: "Bearer " + token})
                          .then(() => getProfileService(token))
                          .catch(err => console.log(err))
                      })
                    }}
                  >
                    {profile?.telegram?.username ?? "Connect Telegram"}
                  </ThemeButton>
                  <ThemeButton
                    size="sm"
                    radius="full"
                    startContent={<TwitterXIcon width="18" height="18" />}
                    color={profile?.twitter?.username ? "success" : "default"}
                    onClick={()=>{
                      twitterAuth({
                        authorization: "Bearer " + token,
                        redirect_url: state.origin
                      })
                    }}
                  >
                    {profile?.twitter?.username ?? "Connect Twitter"}
                  </ThemeButton>
                  <ThemeButton
                    size="sm"
                    radius="full"
                    startContent={<DiscordIcon width="18" height="18" />}
                    color={profile?.discord?.username ? "success" : "default"}
                    onClick={()=>{
                      discordAuth({
                        authorization: "Bearer " + token,
                        redirect_url: state.origin
                      })
                    }}
                  >
                    {profile?.discord?.username ?? 'Connect Discord'}
                  </ThemeButton>
                </div>
              </div>
            </ThemeModalBody>
          </ModalContent>
        </ThemeModal>
      </div>
    )
  }

  const redirectMenusRenderer = (rm: RedirectMenu, index: number) => {
    const redirectTo = rm.redirectTo?.()
    if(redirectTo) return (
      <NextLink 
        key={index} 
        href={redirectTo}
        className="hidden lg:block"
      >
        <ThemeButton
          variant="light"
          size="sm"
          radius="full"
        >
          {rm.label}
        </ThemeButton>
      </NextLink>
    )
    else return (
      <div 
        key={index} 
        className={`hidden lg:block relative after:absolute after:content-['Coming_Soon'] after:z-50 after:text-[0.5rem] after:-bottom-1 after:whitespace-nowrap ${isLight ? "" : "after:dark"} after:left-1/2 after:-translate-x-1/2 after:opacity-disabled after:text-default-foreground`}
      >
        <ThemeButton
          variant="flat"
          size="sm"
          isDisabled
          key={index}
          radius="full"
          className="hidden lg:block bg-transparent"
        >
          {rm.label}
          {/* <ThemeChip size="sm">
            Coming Soon
          </ThemeChip> */}
        </ThemeButton>
      </div>
    )
  }

  const mainContent = () => {
    return (
      <Fragment>
        <div className="flex flex-row items-center gap-4">
          <LogoWithText />
          {redirectMenus.filter(rm => rm.isShow === true).map((rm, index) => redirectMenusRenderer(rm, index))}
        </div>
        <Fragment>
          <ThemeButton
            className="invisible max-lg:visible"
            variant="light"
            isIconOnly
            onClick={()=>globalDispatch({showMenu: true})}
          >
            <BurgerIcon />
          </ThemeButton>
          <ThemeModal
            isOpen={showMenu}
            onClose={()=>globalDispatch({showMenu: false})}
            size="full"
          >
            <ModalContent>
              <ThemeModalHeader />
              <ThemeModalBody>
                {contentRenderer("flex")}
              </ThemeModalBody>
            </ModalContent>
          </ThemeModal>
          {contentRenderer("hidden lg:flex")}
        </Fragment>
      </Fragment>
    )
  }

  const mainRenderer = () => {
    if(params.project) return (
      <Inner2Wrapper className="flex items-center justify-between py-3.5">
        {mainContent()}
      </Inner2Wrapper>
    )
    else return (
      <InnerWrapper className="flex items-center justify-between py-3.5">
        {mainContent()}
      </InnerWrapper>
    )
  }

  return (
    <Fragment>
      {mainRenderer()}
      {state.origin &&
        <TelegramAuth 
          onAuthCallback={()=>{}}
          botName={CONSTANT.TELEGRAM_BOT}
          requestAccess={true}
          usePic={true}
          redirectUrl={state.origin}
          className="hidden"
        />
      }
    </Fragment>
  )
}

export default TopBarContent