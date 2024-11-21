"use client"
import { HeroImage } from '@/components/assets'
import { ApartmentIcon, ContainerIcon, ProjectIcon, SettingIcon } from '@/components/assets/icons';
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
import { DM_Sans, Manrope } from 'next/font/google'
import { useRouter } from 'next/navigation';
import { Fragment, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import NextLink from 'next/link'
import useAuthService from '@/services/auth-service';
import { AlertModalType, useModal } from '@/providers/modal';
import NextImage from "next/image"

const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})
const manrope800 = Manrope({weight: "800", subsets: ["latin"]})

export default function Home() {
  const { state: { isLight, token, isSignatureLoading }, dispatch: globalDispatch } = useGlobalContext()
  return (
    <OuterWrapper>
      <div  className="bg-[url('/hero-pattern.png')] bg-auto md:bg-contain bg-center bg-no-repeat w-full">
        <main className="text-center py-40">
          <p className={`${manrope800.className} ${isLight ? 'text-black-900' :'text-white'} uppercase`}>Welcome to</p>
          <h1 className={`${dmSans700.className} ${isLight ? 'text-black-900' :'text-white'} text-6xl md:text-8xl mb-5`}>HypeQuest</h1>
          <p className={`text-lg mb-10 ${isLight ? 'text-black-900' :'text-white'}`}>Your one-stop for marketing, growth and analysis for Web3.<br/>Connect your wallet now and start setting up Quests.</p>
          <div className="flex justify-center space-x-5 ">
            <NextLink href="/auroraofficial?selectedTab=QUEST">
                <button className={`${manrope800.className} bg-yellow-400 text-gray-700 py-3 px-6 rounded-full stroke-2 stroke-black drop-shadow border-solid border-black border-2`}>Start Earning</button>
            </NextLink>
            <button className={`${manrope800.className} bg-purple-600 text-white py-3 px-6 rounded-full stroke-2 stroke-black drop-shadow-xl border-solid border-black border-2`}>Create Quest</button>
          </div>
          <div className="flex justify-center space-x-5 mb-10">
          <div className="text-xs text-gray-300 px-10">Coming Soon</div>
          <div className="text-xs text-gray-300 px-10">Coming Soon</div>
          </div>
        </main>
      </div>
    </OuterWrapper>
  )
}
