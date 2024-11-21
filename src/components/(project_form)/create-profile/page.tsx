"use client"
import { DropzoneReturnValues, ThemeButton, ThemeChip, ThemeDropzone, ThemeInput, ThemeTextarea } from "@/components/reusables/NextuiTheme";
import { addSearchParams, redirectToNewPage, submitFormikForm, useDebounce, useMinimizedState } from "@/helper";
import { useFormContext } from "@/providers/project-form-stores";
import { useGlobalContext } from "@/providers/stores";
import useClientService from "@/services/client-service";
import { useFormik } from "formik";
import { NextPage } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import React, { useEffect } from "react";
import dataListChain from '@/localeData/list_chains.json'
import Image from "next/image";
import { ICreateClient } from "@/types/service-types";
import * as yup from "yup"
import { AlertModalType, useModal } from "@/providers/modal";
import { useRouter, useSearchParams } from "next/navigation";
import { createProfilePath, milestoneAndRewardsPath } from "@/helper/route-path";
import { ClientSocmedConnectModal, TelegramAuth } from "@/components/reusables";
import useSocmedAdminAuthService from "@/services/socmed-admin-auth-service";
import CONSTANT from "@/Constant";
import useSocmedAuthService from "@/services/socmed-auth-service";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

const dmSans900 = DM_Sans({weight: "900", subsets: ["latin"]})
const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})
const dmSans400 = DM_Sans({weight: "400", subsets: ["latin"]})
const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope400 = Manrope({weight: "400", subsets: ["latin"]})

interface ICreateProfileState {
  dataChains: {
    label: string;
    value: number;
  }[],
  selectedChain: number[],
  files: File[],
  origin: string;
  href: string;
  clientProjectId?: string;
  isLoading: boolean;
}

interface IForm extends Omit<ICreateClient, "logo" | "favicon"> {
  logo?: DropzoneReturnValues;
  favicon?: DropzoneReturnValues;
}

const MarketplacePage: NextPage = () => {
  const params = useSearchParams()
  const clientProjectId = params.get("clientProjectId")
  const status = params.get("status") ? Number(params.get("status")) : undefined
  const message = params.get("message")
  const router = useRouter()
  const openModal = useModal()
  const { createClient, updateClient, getClientDetail, usernameChecker } = useClientService()
  const { twitterAuth, discordAuth, telegramAuth: telegramAdminAuth } = useSocmedAdminAuthService()
  const { telegramAuth } = useSocmedAuthService()
  const { state: { isLight, profile, token } } = useGlobalContext()
  const formContext = useFormContext()
  const [localState, setLocalState] = useMinimizedState<ICreateProfileState>({
    dataChains: [],
    selectedChain: [],
    files: [],
    origin: "",
    href: "",
    isLoading: false
  })
  const formik = useFormik<Partial<IForm>>({
    initialValues: {
    },
    onSubmit: (vals) => {
      if(vals.username && vals.name && vals.email && vals.chains) {
        setLocalState({isLoading: true})
        if(clientProjectId) {
          updateClient({
            clientProjectId,
            username: vals.username,
            name: vals.name,
            token_name: vals.token_name,
            email: vals.email,
            chains: vals.chains,
            logo: vals.logo?.rawFiles?.[0],
            favicon: vals.favicon?.rawFiles?.[0],
            url: vals.url,
            description: vals.description,
            telegramGroupLink: vals.telegramGroupLink,
          })
            .then((res)=>{  
              setLocalState({clientProjectId: res.data.data._id})
              router.push(addSearchParams(createProfilePath, {clientProjectId: res.data.data._id, modal: true}))
            })
            .catch((err: AxiosError<ResponseAPI<null>>) => err?.response?.data?.message && toast.error(err.response.data.message))
            .finally(()=>setLocalState({isLoading: false}))
        }
        else {
          createClient({
            username: vals.username,
            name: vals.name,
            token_name: vals.token_name,
            email: vals.email,
            chains: vals.chains,
            logo: vals.logo?.rawFiles?.[0],
            favicon: vals.favicon?.rawFiles?.[0],
            url: vals.url,
            description: vals.description,
            telegramGroupLink: vals.telegramGroupLink,
          })
            .then((res)=>{
              toast.success("Successfully created your profile!")
  
              setLocalState({clientProjectId: res.data.data._id})
              router.push(addSearchParams(createProfilePath, {clientProjectId: res.data.data._id, modal: true}))
            })
            .catch((err: AxiosError<ResponseAPI<null>>) => err?.response?.data?.message && toast.error(err.response.data.message))
            .finally(()=>setLocalState({isLoading: false}))
        }
      }
    },
    validationSchema: yup.object().shape({
      username: yup.string().required("Enter your community name!").matches(
        /^[a-zA-Z0-9]+$/,
        "Please enter a valid username without any white spaces or special characters"
      )
      // .test('username', 'Username is already exist!', async (username) => {
      //   try {
      //     if(token) {
      //       const response = await usernameChecker({
      //         username,
      //         clientProjectId: clientProjectId ?? undefined
      //       }, {Authorization: "Bearer " + token})
            
      //       return response.data.data
      //     }
      //     else return false
      //   }
      //   catch(err) {
      //     return false
      //   }
      // })
      ,
      telegramGroupLink: yup.string().url("Invalid URL!"),
      url: yup.string(),
      name: yup.string().required("Name must be filled!"),
      email: yup.string().email("Please enter a valid email address!").required("Email must be filled!"),
      chains: yup.array().of(yup.number()).test({message: "Please select at least one chain", test: (arr) => Array.isArray(arr) && arr.length > 0}),
    })
  })

  useDebounce<[number | undefined, string | null]>((s, m)=>{
    if(s === 400 && m) toast.warning(m)
  }, [status, message])

  useEffect(()=>{
    setLocalState({
      origin: window.origin,
      href: window.location.href
    })
    formContext.dispatch({title: "Profile Creation"})
    getData()
  }, [])

  const getData = async () => {
    // const { data } = await getChains()
    const data = {data: []}
    setLocalState({
      dataChains: data.data
    })
  }

  useDebounce<[string, string | null]>((t, cpId) => {
    if(t && cpId) getClientDetail({clientProjectId: cpId}, {Authorization: "Bearer " + t})
      .then(res => {
        formik.setValues({
          ...res.data.data,
          logo: res.data.data.logo ? {
            files: [res.data.data.logo],
            rawFiles: []
          } : undefined,
          favicon: res.data.data.favicon ? {
            files: [res.data.data.favicon],
            rawFiles: []
          } : undefined
        })
      })
      .catch((err) => console.log(err))
  }, [token, clientProjectId])

  const handleClickChain = (value: number) => {
    let chains = formik.values.chains ?? []
    const finder = chains.find(chain => chain === value)

    if(finder) chains = chains.filter(chain => chain !== value)
    else chains.push(value)

    formik.setTouched({...formik.touched, chains: true})
    formik.setFieldValue("chains", chains)
  }

  return (
    <div className="flex flex-col gap-6 overflow-hidden">
      <div className="flex flex-row gap-5">
        <ThemeDropzone 
          label="Logo"
          supportedMimes={["image/png","image/jpg","image/jpeg", "image/svg", "image/svg+xml"]}
          maxByteSize={5e+6}
          formik={{
            config: formik,
            name: "logo"
          }}
        />
        <div className="flex w-full flex-col items-center gap-6 pt-8">
          <ThemeInput
            formik={{
              config: formik,
              name: "name"
            }}
            type="input"
            label="Community Name"
            placeholder="Enter a Community Name"
            labelPlacement="outside"
            variant='bordered'
            radius="sm"
          />
          <ThemeInput
            type="input"
            formik={{
              config: formik,
              name: "username"
            }}
            label={
              <p>Community URL <span className='text-xs'>(<i>It cannot be changed after creation</i>)</span></p>
            }
            startContent={localState.origin + "/"}
            placeholder="[your_username]"
            labelPlacement="outside"
            variant='bordered'
            radius="sm"
          />
          <ThemeInput
            type="input"
            formik={{
              config: formik,
              name: "token_name"
            }}
            label="Token Ticker"
            placeholder="$Your project token"
            labelPlacement="outside"
            variant='bordered'
            radius="sm"
          />
        </div>
      </div>
      <ThemeTextarea
        formik={{
          config: formik,
          name: "description"
        }}
        label="Introduction"
        labelPlacement="outside"
        placeholder="Describe your community so that we can know you better!"
        className="w-full"
        radius="sm"
      />
      <div className={`w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 ${isLight ? "text-black" : "text-white"}`}>
        Chain
      </div>
      <div>
        {dataListChain.map((chain, index) => (
          <ThemeChip
            classNames={{
              base: `px-2 py-5 w-full cursor-pointer m-2 ${localState.selectedChain.includes(chain.chain_id) && 'border border-red-500'}`,
              content: "text-sm flex items-center gap-2"
            }}
            color={formik.values.chains?.includes(chain.chain_id) ? "warning" : "default"}
            key={index}
            startContent={
              <Image
                src={chain.icon_url}
                alt={chain.symbol}
                width={20}
                height={20}
                className="rounded-full"
              />
            }
            onClick={() => handleClickChain(chain.chain_id)}
          >
            <b>{chain.symbol}</b>
            <span>{chain.chain_name}</span>
          </ThemeChip>
        ))}
      </div>
      {(formik.errors.chains && formik.touched.chains) && <div className={`${manrope800.className} bold text-red-900`}>{formik.errors.chains}</div>}
      <div className="flex flex-col gap-2 w-full">
        <ThemeInput
          formik={{
            config: formik,
            name: "url"
          }}
          type="input"
          label="Website"
          placeholder="Enter Your Website URL"
          labelPlacement="outside"
          variant='bordered'
          className='basis-1/2'
          radius="sm"
        />
        <ThemeInput
          formik={{
            config: formik,
            name: "email"
          }}
          type="input"
          label="Project Email"
          placeholder="Project Email"
          labelPlacement="outside"
          variant='bordered'
          className='basis-1/2'
          radius="sm"
        />
      </div>
      <div className="flex w-full flex-wrap md:flex-nowrap my-6 md:mb-0 gap-4">
        <ThemeButton
          radius="full"
          color="warning"
          onClick={async () => await submitFormikForm(formik)}
          isDisabled={localState.isLoading}
          isLoading={localState.isLoading}
        >
          Create Profile
        </ThemeButton>
      </div>
      <ClientSocmedConnectModal 
        isOpen={(!!localState.clientProjectId || !!clientProjectId && params.get("modal") === "true")}
        onTelegramAuth={(clientProject) => {
          redirectToNewPage(telegramAdminAuth(), true)
        }}
        onTelegramAuthSubmit={(clientProject) => {
          toast.success(`Your Telegram group has successfully binded!`)
        }}
        onDiscordAuthSubmit={(clientProject) => {
          toast.success(`Your Discord channel has successfully binded!`)
        }}
        clientProjectId={localState.clientProjectId ?? clientProjectId ?? undefined}
        onTwitterAuth={(clientProject)=> {
          if(token && clientProject?._id && localState.href) {
            twitterAuth({
              authorization: "Bearer " + token, 
              client_project_id: clientProject?._id,
              redirect_url: localState.href
            })
          }
        }}
        onDiscordAuth={(clientProject)=> {
          redirectToNewPage(CONSTANT.DISCORD_GROUP_OAUTH2, true)
        }}
        onContinue={() => router.push(addSearchParams(milestoneAndRewardsPath, {clientProjectId: localState.clientProjectId ?? clientProjectId}))}
      />
      {localState.href &&
        <TelegramAuth 
          onAuthCallback={(user) => {
            telegramAuth(user)
              .then(()=>{
                redirectToNewPage(telegramAdminAuth(), true)
              })
              .catch(err => console.log(err))
          }}
          botName={CONSTANT.TELEGRAM_BOT}
          requestAccess={true}
          usePic={true}
          redirectUrl={localState.href}
          className="hidden"
        />
      }
    </div>
  )
}

export default MarketplacePage