"use client"
import { Inter } from '@next/font/google'
import Provider from '@/providers'
import NextImage from "next/image"
import HeroDarkBackground from '@/assets/abstract-background-grid-squares-2.png'
import HeroLightBackground from '@/assets/new-hq-lightmode-background.jpeg'
import { OuterWrapper } from "@/components/reusables";
import { FC, PropsWithChildren, useEffect, useMemo, useRef } from 'react'
import { useMinimizedState } from '@/helper'

import '@/styles/components/react-quill/quill.snow.css'
import '@rainbow-me/rainbowkit/styles.css';

import { RainbowKitProvider, darkTheme, lightTheme, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, trustWallet, braveWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import * as allChains from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { GlobalContext, GlobalState, initialGlobalState, schema } from '@/providers/stores'
import TopBarContent from '@/components/topbar-content'
import { useParams } from 'next/navigation'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'] })

const RootComponent: FC<PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useMinimizedState<GlobalState>(initialGlobalState, {
    persistentName: "hypequest-var",
    schema
  })
  // const [state, dispatch] = useMinimizedState<GlobalState>(initialGlobalState)
  const params = useParams()
  
  const getChainsByProject = () => {
    if(params.project) {
      const chains: Array<allChains.Chain> = []
      if(state.chains && state.chains.length > 0) state.chains.forEach(chain => {
        const finder = Object.entries(allChains).find(([_label,value]) => value.id === chain)

        if(finder) chains.push(finder[1])
      })

      if(chains.length > 0) return chains
      else {
        if(process.env.NODE_ENV as string == 'development') return [sepolia]
        else return [mainnet]
      }
    }
    else {
      if(process.env.NODE_ENV as string == 'development') return [sepolia]
      else return [mainnet]
    }
  }

  const { chains, publicClient } = configureChains(
    getChainsByProject(),
    [publicProvider()],
    {
      retryCount: 10,
      retryDelay: 1000,
      pollingInterval: 10_000
    }
  );
  
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID_WALLETCONNECT as string;
  const connectors = connectorsForWallets([
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet({ projectId, chains }),
        trustWallet({ projectId, chains }),
        braveWallet({ projectId, chains }),
        walletConnectWallet({ projectId, chains }),
      ],
    },
  ]);
  
  const wagmiConfig = createConfig({
    autoConnect: state.token ? true : false,
    connectors,
    publicClient
  })

  const topRef = useRef<HTMLDivElement>(null)
  
  useEffect(()=>{
    if(topRef.current) dispatch({topBarHeight: topRef.current.offsetHeight})
  }, [topRef.current?.offsetHeight, state.showMenu])

  // useEffect(()=>{
  //   const callback = () => dispatch({isTop: window.scrollY < 1})
  //   window.addEventListener("scroll", callback)

  //   callback()

  //   return () => window.removeEventListener("scroll", callback)
  // }, [])

  const providerMemoized = useMemo(()=>({state,dispatch}), [state])

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={state.isLight ? lightTheme() : darkTheme()}>
        <GlobalContext.Provider value={providerMemoized}>
          <Provider>
            <body className={`${inter.className}`}>
              <OuterWrapper className={`z-10 flex flex-col fixed inset-x-0 top-0 transition-all backdrop-blur-xl ${state.isTop ? "" : "shadow-xl"}`} ref={topRef}>
                <TopBarContent />
              </OuterWrapper>
              <main 
                className="min-h-screen backdrop-blur-2xl overflow-auto transition-all"
                style={{
                  background: state.isLight ? "linear-gradient(267deg, rgba(255, 255, 255, 0.00) 11.23%, rgba(255, 255, 255, 0.15) 45.55%, rgba(255, 255, 255, 0.00) 84.44%, rgba(255, 255, 255, 0.00) 84.44%)" : "radial-gradient(145.66% 111.22% at 59.9% 15.09%, rgba(143, 10, 10, 0.00) 27.25%, rgba(49, 0, 111, 0.33) 61.05%, rgba(183, 145, 48, 0.04) 83.53%, rgba(183, 145, 48, 0.00) 100%), #050505"
                }}
              >
                <NextImage 
                  src={state.isLight ? HeroLightBackground : HeroDarkBackground}
                  alt='hero-background'
                  unoptimized
                  className='fixed top-0 pointer-events-none opacity-10 object-cover object-center w-full h-full z-0 mix-blend-screen'
                />
                <div className='relative' style={{paddingTop: state.topBarHeight}}>
                  { children }
                </div>
              </main>
            </body>
            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              theme={state.isLight ? "light" : "dark"}
            />
          </Provider>
        </GlobalContext.Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default RootComponent