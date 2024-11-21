import CONSTANT from '@/Constant'
import { nFormatter } from '@/helper/server-side-helper'
import { ILuckyWheel, IPublicClientResponse, LuckyWheelTypesEnum, MetaOGEnum } from '@/types/service-types'
import { ImageResponse } from 'next/og'
import { ReactElement } from 'react'
 
export const runtime = 'edge'

const errorImage = (request: Request): ReactElement => {
  const url = new URL(request.url.replace('https://', 'http://'))
  return (
    <div 
      tw="w-full h-full flex justify-center items-center relative"
      style={{
        background: "linear-gradient(to right, #EF1BC3, #2043E4)"
      }}
    >
      <div 
        tw="flex flex-row items-center justify-center w-[1180px] h-[610px] overflow-hidden px-[100px]"
        style={{
          background: `url('${url.origin}/hero_og_bg.png')`
        }}
      >
        <h1 tw="text-white text-[8rem] font-bold w-[600px] leading-[7rem]" style={{zIndex: 10}}>Something Went Wrong ..</h1>
      </div>
    </div>
  )
}

const luckyWheelImage = async (request: Request): Promise<ReactElement> => {
  const url = new URL(request.url.replace('https://', 'http://'))
  return (
    <div 
      tw="w-full h-full flex justify-center items-center relative"
      style={{
        background: "linear-gradient(to right, #EF1BC3, #2043E4)"
      }}
    >
      <div 
        tw="flex flex-row items-center w-[1180px] h-[610px] overflow-hidden px-[100px]"
        style={{
          background: `url('${url.origin}/hero_og_bg.png')`
        }}
      >
        <img 
          tw="w-full absolute right-[-200px] bottom-[-80px]" 
          src={`${url.origin}/luckywheel_og_sprinkles.png`} 
          alt="luckywheel_sprinkles_assets"
          style={{
            mixBlendMode: "screen"
          }}
         />
        <img tw="w-4/5 absolute right-[-170px] bottom-[-50px]" src={`${url.origin}/luckywheel_og.svg`} alt="luckywheel_assets" />
        <h1 tw="text-white text-[8rem] font-bold w-[600px] leading-[7rem]" style={{zIndex: 10}}>Get More Rewards</h1>
      </div>
    </div>
  )
}

const luckyWheelPrizeImage = async (request: Request): Promise<ReactElement> => {
  const url = new URL(request.url.replace('https://', 'http://'))
  const username = url.searchParams.get("username")
  const luckyWheelId = url.searchParams.get("luckyWheelId")
  const res = await fetch(CONSTANT.BASE_URL + `project/${username}/get`)

  if(!res.ok) return errorImage(request)
  const json = await res.json() as ResponseAPI<IPublicClientResponse | null>
  const logo = await fetch(json.data?.logo ?? `${url.origin}/hypequest.png`)

  if(!luckyWheelId) return errorImage(request)
  const detailUrl = new URL(CONSTANT.BASE_URL + `admin/luckywheel/detail`)
  detailUrl.searchParams.set("id", luckyWheelId)
  const detail = await fetch(detailUrl.href)

  if(!detail.ok) return errorImage(request)
  const detailJson = await detail.json() as ResponseAPI<ILuckyWheel | null>

  if([LuckyWheelTypesEnum.USDT, LuckyWheelTypesEnum.XP].find(t => t === detailJson.data?.type_reward)) return (
    <div 
      tw="w-full h-full flex justify-center items-center relative"
      style={{
        background: "linear-gradient(to right, #EF1BC3, #2043E4)"
      }}
    >
      <div 
        tw="flex flex-row items-center justify-between w-[1180px] h-[610px] overflow-hidden px-[100px] bg-neutral-900"
        style={{
          background: `url('${url.origin}/abstract-background-grid-squares-2.png')`,
          mixBlendMode: 'screen'
        }}
      >
        <img 
          tw="w-full absolute right-[-180px] bottom-[-100px]" 
          src={`${url.origin}/luckywheel_og_sprinkles.png`} 
          alt="luckywheel_sprinkles_assets"
          style={{
            mixBlendMode: "screen"
          }}
        />
        <div tw="flex flex-col items-center justify-center" style={{gap: 10}}>
          <div tw="flex flex-col items-center justify-center">
            <h1 tw="text-white text-[5rem] font-bold leading-8">WON</h1>
            <h1 tw="text-white text-[6rem] font-bold leading-8 text-lime-200">Rewards</h1>
            <h1 tw="text-white text-[8rem] font-bold">{nFormatter(detailJson.data?.value ?? 0, 0)}{detailJson.data?.is_multiply && "X"}</h1>
          </div>
          <div tw="flex items-center" style={{gap: 10}}>
            <img 
              tw="w-[70px]" 
              src={logo.ok ? (json.data?.logo ?? `${url.origin}/hypequest.png`) : `${url.origin}/hypequest.png`} 
              alt="project_logo" 
            />
            <h1 tw="text-white text-[3rem] font-bold">{json.data?.name}</h1>
          </div>
        </div>
        {detailJson.data?.type_reward === LuckyWheelTypesEnum.USDT ?
          <img tw="w-[700px]" src={`${url.origin}/usdts.png`} alt="usdts_logo" />
          :
          <img tw="w-[400px]" src={`${url.origin}/XPs.png`} alt="xps_logo" />
        }
      </div>
    </div>
  )
  else {
    const getIcon = async () => {
      if(detailJson.data?.type_reward === LuckyWheelTypesEnum.FREE_SPIN) return `${url.origin}/free-spin.png`
      else if(detailJson.data?.type_reward === LuckyWheelTypesEnum.GOOD_LUCK) return `${url.origin}/good_luck.png`
      else {
        if(detailJson.data?.marketplaceId?.photo) {
          const imgFetcher = await fetch(detailJson.data?.marketplaceId?.photo)
          if(!imgFetcher.ok) return `${url.origin}/luckywheel_prize_wrapper.png`
          else return detailJson.data?.marketplaceId?.photo
        }
        else return `${url.origin}/luckywheel_prize_wrapper.png`
      }
    }
    return (
      <div 
        tw="w-full h-full flex justify-center items-center relative"
        style={{
          background: "linear-gradient(to right, #EF1BC3, #2043E4)"
        }}
      >
        <div 
          tw="flex flex-row items-center justify-between w-[1180px] h-[610px] overflow-hidden px-[100px] bg-neutral-900"
          style={{
            background: `url('${url.origin}/abstract-background-grid-squares-2.png')`,
            mixBlendMode: 'screen'
          }}
        >
          <img 
            tw="w-full absolute right-[-180px] bottom-[-100px]" 
            src={`${url.origin}/luckywheel_og_sprinkles.png`} 
            alt="luckywheel_sprinkles_assets"
            style={{
              mixBlendMode: "screen"
            }}
          />
          <div tw="flex flex-col items-center justify-center" style={{gap: 10}}>
            <div tw="flex items-center" style={{gap: 10}}>
              <img 
                tw="w-[70px]" 
                src={logo.ok ? (json.data?.logo ?? `${url.origin}/hypequest.png`) : `${url.origin}/hypequest.png`} 
                alt="project_logo" 
              />
              <h1 tw="text-white text-[3rem] font-bold">{json.data?.name}</h1>
            </div>
            <h1 tw="text-white text-[5rem] font-bold leading-8">WON</h1>
          </div>
          <img 
            src={`${url.origin}/luckywheel_prize_wrapper.png`} 
            alt="lw_wrapper" 
            tw="w-[700px] absolute right-[25px] top-[25px]"
          />
          <img 
            src={await getIcon()} 
            alt="lw_wrapper_icon" 
            tw="w-[400px] absolute right-[180px] top-[150px]"
          />
        </div>
      </div>
    )
  }
}

const referralImage = async (request: Request): Promise<ReactElement> => {
  const url = new URL(request.url.replace('https://', 'http://'))
  const username = url.searchParams.get("username")
  const res = await fetch(CONSTANT.BASE_URL + `project/${username}/get`)

  if(!res.ok) return errorImage(request)
  const json = await res.json() as ResponseAPI<IPublicClientResponse | null>
  const logo = await fetch(json.data?.logo ?? `${url.origin}/hypequest.png`)
  
  return (
    <div 
      tw="w-full h-full flex justify-center items-center relative"
      style={{
        background: "linear-gradient(to right, #EF1BC3, #2043E4)"
      }}
    >
      <div 
        tw="flex flex-row items-center w-[1180px] h-[610px] overflow-hidden px-[100px]"
        style={{
          background: `url('${url.origin}/hero_og_bg.png')`
        }}
      >
        <img 
          tw="w-full absolute right-[-200px] bottom-[-80px]" 
          src={`${url.origin}/luckywheel_og_sprinkles.png`} 
          alt="luckywheel_sprinkles_assets"
          style={{
            mixBlendMode: "screen"
          }}
        />
        <img tw="w-3/4 absolute right-[-120px] bottom-[-50px]" src={`${url.origin}/referral_og.png`} alt="referral_assets" />
        <div tw="flex flex-col" style={{gap: 20}}>
          <h1 tw="text-white text-[7rem] font-bold w-[600px] leading-[7rem]" style={{zIndex: 10}}>Invited Friends</h1>
          <div tw="flex items-center" style={{gap: 20}}>
            <img 
              tw="w-[70px]" 
              src={logo.ok ? (json.data?.logo ?? `${url.origin}/hypequest.png`) : `${url.origin}/hypequest.png`} 
              alt="project_logo" 
            />
            <h1 tw="text-white text-[3rem] font-bold">{json.data?.name}</h1>
          </div>
        </div>
      </div>
    </div>
  )
}

const defaultImage = async (request: Request): Promise<ReactElement> => {
  const url = new URL(request.url.replace('https://', 'http://'))
  const username = url.searchParams.get("username")
  const res = await fetch(CONSTANT.BASE_URL + `project/${username}/get`)

  if(!res.ok) return errorImage(request)
  const json = await res.json() as ResponseAPI<IPublicClientResponse | null>
  const logo = await fetch(json.data?.logo ?? `${url.origin}/hypequest.png`)
  
  return (
    <div 
      tw="w-full h-full flex justify-center items-center relative"
      style={{
        background: "linear-gradient(to right, #EF1BC3, #2043E4)"
      }}
    >
      <div 
        tw="flex flex-col items-center justify-center w-[1180px] h-[610px] overflow-hidden px-[100px] text-white"
        style={{
          background: `url('${url.origin}/project_og_bg.png')`,
          backgroundSize: "contain",
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          gap: 70
        }}
      >
        <div tw="flex flex-row relative min-h-[100px]">
          <img 
            tw="opacity-20 absolute top-[-150px] left-[70px] right-0 bottom-0 w-100"
            src={`${url.origin}/hypequest.png`} 
          />
          <div tw="flex flex-row items-center" style={{gap: 10}}>
            <img tw="w-[100px]" src={`${url.origin}/hypequest.png`} />
            <span tw="text-white text-[72px]">HypeQuest</span>
          </div>
        </div>
        <img tw="w-[100px]" src={`${url.origin}/og_x.png`} />
        <div tw="flex flex-row relative min-h-[100px]">
          <img 
            tw="rounded-full opacity-20 absolute top-[-100px] left-[70px] right-0 bottom-0 w-100"
            src={logo.ok ? (json.data?.logo) : `${url.origin}/hypequest.png`} 
          />
          <div tw="flex flex-row items-center" style={{gap: 10}}>
            <img tw="rounded-full w-[100px]" src={logo.ok ? (json.data?.logo) : `${url.origin}/hypequest.png`} />
            <span tw="text-white text-[72px]">{json.data?.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
 
export async function GET(request: Request) {
  const url = new URL(request.url.replace('https://', 'http://'))
  const type = url.searchParams.get("type") as MetaOGEnum | null
  const userId = url.searchParams.get("userId")
  const luckyWheelId = url.searchParams.get("luckyWheelId")

  if(type === MetaOGEnum.LUCKYWHEEL) return new ImageResponse(await luckyWheelImage(request), {width: 1200, height: 630})
  else if(type === MetaOGEnum.LUCKYWHEEL_PRIZE) return new ImageResponse(await luckyWheelPrizeImage(request), {width: 1200, height: 630})
  else if(type === MetaOGEnum.REFERRAL) return new ImageResponse(await referralImage(request), {width: 1200, height: 630})
  else return new ImageResponse(await defaultImage(request), {width: 1200, height: 630})
}
