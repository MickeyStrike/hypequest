"use client"
import { HeroImage } from '@/components/assets'
import { ApartmentIcon, ContainerIcon, CopyIcon, LinkIcon, ProjectIcon, SettingIcon } from '@/components/assets/icons';
import { InfoTooltip, InnerWrapper, OuterWrapper } from "@/components/reusables";
import { ThemeAvatar, ThemeButton, ThemeDivider, ThemeInput, ThemePagination, ThemeTable } from '@/components/reusables/NextuiTheme';
import { addSearchParams, getSignMessage, routeToUrl, useDebounce, useMinimizedState } from '@/helper';
import { createProfilePath, profilePath, questboardPath, singleQuestsPath } from '@/helper/route-path';
import { useGlobalContext } from '@/providers/stores';
import useClientService from '@/services/client-service';
import { ActiveTabEnum, IClient } from '@/types/service-types';
import { TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useFormik } from 'formik';
import { Manrope } from '@next/font/google'
import { useRouter } from 'next/navigation';
import { Fragment, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import NextLink from 'next/link'
import useAuthService from '@/services/auth-service';
import { AlertModalType, useModal } from '@/providers/modal';
import NextImage from "next/image"
import { toast } from 'react-toastify';

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope400 = Manrope({weight: "400", subsets: ["latin"]})

interface IForm {
  search: string;
}

interface InitialState {
  origin: string;
  page: number;
  total_data: number;
  data: Array<IClient>;
}

export default function Home() {
  const LIMIT = 10
  const { getClients } = useClientService()
  const { login } = useAuthService()
  const { state: { isLight, token, isSignatureLoading }, dispatch: globalDispatch } = useGlobalContext()
  const router = useRouter()
  const openModal = useModal()
  const [state, dispatch] = useMinimizedState<InitialState>({
    origin: "",
    data: [],
    total_data: 0,
    page: 1
  })
  const { address, isConnecting, isConnected, } = useAccount()
  const formik = useFormik<Partial<IForm>>({
    initialValues: {},
    onSubmit: () => {}
  })

  const { signMessageAsync } = useSignMessage({
    message: getSignMessage(),
  })

  const getProjectClientService = (page: number, t: string, search?: string) => {
    if(t) {
      getClients({
        limit: LIMIT,
        page,
        search
      },{Authorization: "Bearer " + t})
        .then((res => dispatch({
          data: res.data.data.data,
          total_data: res.data.data.meta.total
        })))
        .catch(err => console.log(err))
    }
  }

  useDebounce<[number, string, string | undefined]>(getProjectClientService, [state.page, token, formik.values.search], 400)

  useEffect(()=>{
    dispatch({ origin: window.origin })
  }, [])

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
              description: "Unexpected error has occurred! Please try again!"
            })
          })
          .finally(()=>globalDispatch({isSignatureLoading: false}))
      })
      .catch(err => {
        console.log(err)
        globalDispatch({isSignatureLoading: false})
      })
  }

  const handleCopyToClipboard = async (textToCopy: string) => {
    try {
        await navigator.clipboard.writeText(state.origin + textToCopy);
        toast.success("Url successfully copied to clipboard!")
    } catch (error) {
        console.error("Gagal menyalin teks ke clipboard:", error);
        toast.error("Url failed to copy to clipboard!")
    }
  };

  const contentRenderer = () => {
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

        if(address && isConnected && token) return (
          <Fragment>
            <ThemeDivider />
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-2 items-center justify-between">
                <ThemeInput
                  size="sm"
                  className="max-w-[300px]"
                  formik={{config: formik, name: "search"}}
                  placeholder="Search by project name"
                  isClearable
                />
                <ThemeButton color="warning" radius="full" onClick={() => router.push(createProfilePath)}>Create Quest Board</ThemeButton>
              </div>
              <ThemeTable
                bottomContent={
                  <ThemePagination
                    showControls
                    classNames={{
                      cursor: "bg-foreground text-background",
                    }}
                    color="default"
                    isDisabled={false}
                    page={state.page}
                    total={state.total_data / LIMIT}
                    variant="light"
                    onChange={(page)=>dispatch({page})}
                  />
                }
                bottomContentPlacement="inside"
              >
                <TableHeader>
                  <TableColumn>No</TableColumn>
                  <TableColumn>Project Name</TableColumn>
                  <TableColumn>Quick Actions</TableColumn>
                </TableHeader>
                <TableBody emptyContent="There's nothing here! Let's create your own questboard!">
                  {state.data.map((d, index) =>
                    <TableRow key={index}>
                      <TableCell>{LIMIT * (state.page - 1) + index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-row items-center gap-2">
                          <div className="relative w-[40px] h-[40px] rounded-full overflow-hidden">
                            <NextImage
                              src={d.logo}
                              alt={`${d.name}-logo-project`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <h3 className={`${manrope800.className} text-[16px]`}>{d.name}</h3>
                            {/* <NextLink href={`/${d.username}`} className={`${manrope400.className} text-[13px]`}>{state.origin}/{d.username}</NextLink> */}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-row gap-2 items-center">
                          <InfoTooltip title="Copy URL">
                            <ThemeButton onClick={()=>handleCopyToClipboard('/' + d.username)} isIconOnly><LinkIcon circleColor="transparent" /></ThemeButton>
                          </InfoTooltip>
                          <InfoTooltip title="Go to Setting">
                            <ThemeButton onClick={()=>router.push(routeToUrl(profilePath, {tab: ActiveTabEnum.PROFILE, username: d.username}))} color="primary" isIconOnly><SettingIcon /></ThemeButton>
                          </InfoTooltip>
                          <InfoTooltip title="Go to Questboard">
                            <ThemeButton onClick={()=>router.push(`${questboardPath}/${d.username}`)} isIconOnly><ApartmentIcon /></ThemeButton>
                          </InfoTooltip>
                          <InfoTooltip title="Go to Single Quest">
                            <ThemeButton onClick={()=>router.push(addSearchParams(singleQuestsPath, {clientProjectId: d._id}))} isIconOnly><ContainerIcon /></ThemeButton>
                          </InfoTooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </ThemeTable>
            </div>
          </Fragment>
        )
        else if(address && !token) return (
          <ThemeButton
            color="warning"
            radius="full"
            onClick={() => loginService(getSignMessage(), address)}
            isLoading={isSignatureLoading}
          >
            Get Signature
          </ThemeButton>
        )
        else return (
          <ThemeButton
            radius="full"
            variant="solid"
            color="primary"
            isLoading={authenticationStatus === 'loading'}
            isDisabled={!ready}
            onClick={openConnectModal}
          >
            {ready ? "Connect Wallet" : "Please wait ..."}
          </ThemeButton>
        )
      }}
      </ConnectButton.Custom>
    )
  }

  return (
    <OuterWrapper>
      <InnerWrapper className='flex flex-col-reverse lg:flex-row items-center justify-center py-[12rem] gap-8'>
        <HeroImage />
        <div className='flex flex-col gap-6 max-w-[550px]'>
          <div className={`${isLight ? 'text-black-900' :'text-white'} ${manrope800.className} text-5xl xl:text-7xl`}>Welcome to HypeQuest</div>
          <div className={`${isLight ? 'text-black-900' :'text-white'} ${manrope400.className} text-l xl:text-xl opacity-50`}>Your Web3 All-Rounded Quest Tool that everyone is dreaming of. Connect your wallet now and start earning! </div>
          {contentRenderer()}
        </div>
      </InnerWrapper>
    </OuterWrapper>
  )
}
