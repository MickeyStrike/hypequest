"use client"
import { IMarketplaceDetail, IMarketplacePublicGet, IMarketplaceRedeemRequest, IPublicClientResponse, TypePointEnum } from "@/types/service-types";
import { FC, Fragment, useEffect } from "react";
import { Inner2Wrapper, InnerWrapper, OuterWrapper } from "../reusables";
import { ThemeAvatar, ThemeButton, ThemeCard, ThemeCardBody, ThemeChip, ThemeInput, ThemeModal, ThemeModalBody, ThemeProgress, ThemeSwitch, ThemeTabs } from "../reusables/NextuiTheme";
import { DM_Sans, Manrope } from "@next/font/google";
import { ClockIcon, DiscordIcon, GraphicElementIcon, MainXpSmallIcon, MarketplaceXP2Icon, MarketplaceXP2SmallIcon, MarketplaceXPIcon, TelegramIcon, TwitterXIcon, ZealySmallIcon } from "../assets/icons";
import { ModalBody, ModalContent, ModalHeader, Tab, useDisclosure } from "@nextui-org/react";
import NextImage from "next/image"
import usePublicService from "@/services/public-service";
import { numFormatter, submitFormikForm, useDebounce, useMinimizedState } from "@/helper";
import { AlertModalType, useModal } from "@/providers/modal";
import PlaceholderIcon from "@/components/assets/images/placeholder.png"
import { DateTime } from "luxon";
import CustomDatePicker from "../reusables/CustomDatePicker";
import { useFormik } from "formik";
import * as yup from "yup"
import { useGlobalContext } from "@/providers/stores";
import NextLink from "next/link"
import usePublicClientService from "@/services/public-client-service";
import CONSTANT from "@/Constant";

interface PublicMarketplaceProjectPageProps {
  project: string;
  clientProject?: IPublicClientResponse | null;
}

const dmSans400 = DM_Sans({weight: "400", subsets: ["latin"]})
const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})
const dmSans900 = DM_Sans({weight: "900", subsets: ["latin"]})
const manrope400 = Manrope({weight: "400", subsets: ["latin"]})
const manrope800 = Manrope({weight: "800", subsets: ["latin"]})

enum MarketplaceTab {
  FILTER = "FILTER",
  PROFILE = "PROFILE"
}

interface InitialState {
  activeTab: MarketplaceTab;
  marketplaces: Array<IMarketplacePublicGet>;
  detail?: IMarketplaceDetail;
  page: number;
  total_data: number;
  isLoading: boolean;
}

interface IRedeemForm extends Omit<IMarketplaceRedeemRequest, "type_point"> {
  type_point: boolean;
}

const PublicMarketplaceProjectPage: FC<PublicMarketplaceProjectPageProps> = (props) => {
  const { marketplaceRedeem } = usePublicService()
  const { marketplaceGetAll, marketplaceGetDetail } = usePublicClientService()
  const { state: { token, isLight } } = useGlobalContext()
  const [state, dispatch] = useMinimizedState<InitialState>({
    activeTab: MarketplaceTab.PROFILE,
    marketplaces: [],
    page: 1,
    total_data: 0,
    isLoading: false
  })
  const formik = useFormik<Partial<IRedeemForm>>({
    initialValues: {},
    onSubmit: (vals, fHelper) => {
      if(state.detail?.id && vals.qty) {
        const type_point = vals.type_point ? TypePointEnum.ZEALY : TypePointEnum.XP
  
        dispatch({isLoading: true})
        marketplaceRedeem(props.project, {
          type_point,
          marketplaceId: state.detail.id,
          qty: vals.qty
        })
          .then(res => {
            openModal({
              type: AlertModalType.SUCCESS,
              title: "Success!",
              description: "Successfully redeemed!"
            })

            dispatch({detail: undefined})
          })
          .catch(err => {
            openModal({
              type: AlertModalType.ERROR,
              title: "Failed!",
              description: "Failed to redeemed!"
            })
          })
          .finally(()=>{
            fHelper.resetForm()
            dispatch({isLoading: false})
          })
      }
    },
    validationSchema: yup.object().shape({
      qty: yup.number().min(0, "Qty min. 0").max(Number(state.detail?.qty ?? 0), `Qty max. ${state.detail?.qty ?? 0}`).required("Quantity must be fill!")
    })
  })
  const openModal = useModal()
  const {isOpen} = useDisclosure({
    isOpen: !!state.detail,
    onClose: () => dispatch({detail: undefined})
  });

  useEffect(()=>{
    if(!state.detail) formik.resetForm()
  }, [state.detail])

  useDebounce<[string, number]>((t, page)=>{
    if(t) marketplaceGetAll(props.project, {
      limit: CONSTANT.PAGINATION_DEFAULT_LIMIT,
      page
    }, {Authorization: "Bearer " + t})
      .then(res => dispatch({
        marketplaces: [...state.marketplaces, ...res.data.data],
        total_data: res.data.meta?.total
      }))
      .catch(err => {
        console.log('err', err)
      })
  }, [token, state.page])

  const openDetailItem = (marketplace: IMarketplacePublicGet) => {
    dispatch({isLoading: true})
    marketplaceGetDetail(props.project, {marketplaceId: marketplace.id})
      .then(res => dispatch({detail: res.data.data}))
      .catch(err => openModal({
        type: AlertModalType.ERROR,
        title: "Failed!",
        description: "Failed to fetch Marketplace Detail item!"
      }))
      .finally(()=>dispatch({isLoading: false}))
  }

  const socmeds = [
    {
      icon: <TwitterXIcon />,
      href: props.clientProject?.twitter?.username ? `https://twitter.com/${props.clientProject?.twitter?.username}` : undefined
    },
    {
      icon: <DiscordIcon />,
      href: props.clientProject?.discord?.server_id ? `https://discord.com/channels/${props.clientProject?.discord?.server_id}` : undefined
    },
    {
      icon: <TelegramIcon />,
      href: props.clientProject?.telegram?.username_group ? `https://t.me/${props.clientProject?.telegram?.username_group}` : undefined
    },
  ]

  return (
    <Fragment>
      <OuterWrapper>
        <Inner2Wrapper className='flex flex-col py-[4rem] gap-7'>
          <div className={`${isLight ? "text-black" : "text-white"} w-full text-center ${dmSans900.className} text-3xl xl:text-5xl`}>Marketplace</div>
          <div className="flex flex-col lg:flex-row gap-5">
            <div className={`${isLight ? "text-black" : "text-white"} flex flex-col gap-5`}>
              <div className="flex flex-row items-center gap-2">
                <GraphicElementIcon />
                <span className={`${dmSans700.className} text-3xl`}>CompAnything</span>
              </div>
              <ThemeCard className="min-w-0 lg:min-w-[25rem] min-h-[20rem]">
                <ThemeCardBody className="justify-between">
                  <ThemeTabs
                    selectedKey={state.activeTab}
                    onSelectionChange={(key) => dispatch({activeTab: key as MarketplaceTab})}
                  >
                    <Tab key={MarketplaceTab.PROFILE} title="Profile" />
                    <Tab key={MarketplaceTab.FILTER} title="Filter" />
                  </ThemeTabs>
                  {state.activeTab === MarketplaceTab.FILTER &&
                    <Fragment>
                      <div className="flex flex-col gap-4">
                        <div className="font-extrabold">XP Cost</div>
                        <ThemeProgress
                          size="md"
                          radius="md"
                          classNames={{
                            base: "max-w-md flex-col-reverse",
                            track: "drop-shadow-md border border-default",
                            indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
                            label: "tracking-wider font-medium text-default-600",
                            value: "text-foreground/60",
                          }}
                          label="0"
                          value={65}
                          showValueLabel={true}
                          valueLabel="10.000"
                        />
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="font-extrabold">XP Cost</div>
                        <ThemeButton radius="sm" variant="bordered">
                          Old to Latest
                        </ThemeButton> 
                        <ThemeButton radius="sm" variant="bordered">
                          Latest to Old
                        </ThemeButton>
                      </div>
                    </Fragment>
                  }
                  {state.activeTab === MarketplaceTab.PROFILE &&
                    <div className="flex flex-col items-center justify-center gap-4 mt-4 lg:p-4">
                      <ThemeAvatar 
                        size="lg"
                        className="w-[150px] h-[150px]"
                        src={props.clientProject?.logo}
                        radius="lg"
                      />
                      <h1 className={`${dmSans700.className} text-[33px]`}>{props.clientProject?.name}</h1>
                      <h3 className={`${manrope400.className} text-[14px] text-center`}>{props.clientProject?.description ?? "No Description"}</h3>
                      <div className="flex flex-row items-center justify-center gap-2">
                        {socmeds.map((socmed, index) =>
                          socmed.href && <NextLink href={socmed.href} key={index} target="_blank"><ThemeButton isIconOnly radius="full">{socmed.icon}</ThemeButton></NextLink>
                        )}
                      </div>
                    </div>
                  }
                </ThemeCardBody>
              </ThemeCard>
            </div>
            <ThemeCard className="w-full">
              <ThemeCardBody>
                <div className="grid grid-cols-marketplaceItem gap-4">
                  {state.marketplaces.map((marketplace, index) => 
                    <ThemeButton 
                      key={index}
                      className="flex flex-col items-start justify-start gap-4 cursor-pointer h-full p-4" 
                      onClick={() => openDetailItem(marketplace)}
                      isLoading={state.isLoading}
                      isDisabled={state.isLoading}
                    >
                      <div>{marketplace.name}</div>
                      <div className="relative w-full h-[140px]">
                        <ThemeAvatar 
                          isBordered 
                          radius="sm" 
                          icon={
                            <div className="w-full h-full flex items-center justify-center">
                              <NextImage 
                                src={marketplace.photo ?? PlaceholderIcon}
                                alt={marketplace.photo ?? `marketplace-item-${marketplace.name}`}
                                width={140}
                                height={140}
                                className="drop-shadow-sm"
                              />
                            </div>
                          }
                          className="w-full h-[140px] pointer-events-none z-0" 
                        />
                        {marketplace.end_redemption_date &&
                          <ThemeChip className="absolute bottom-1 right-1" color="primary" size="sm">
                            <div className="flex items-center gap-1">
                              <ClockIcon />
                              <span className={`${dmSans700.className} text-xs`}>{DateTime.fromJSDate(new Date(marketplace.end_redemption_date)).toRelative({base: DateTime.fromJSDate(new Date())})}</span>
                            </div>
                          </ThemeChip>
                        }
                      </div>
                      <div className="flex flex-row items-center gap-1">
                        {formik.values.type_point ? <ZealySmallIcon /> : <MainXpSmallIcon />}
                        <span className={`${dmSans700.className} text-base`}>{numFormatter(marketplace.xp_cost ?? 0)}</span>
                      </div>
                    </ThemeButton>
                  )}
                </div>
                {state.marketplaces.length < state.total_data && <ThemeButton onClick={()=>dispatch({page: state.page + 1})}>Get More Item ..</ThemeButton>}
              </ThemeCardBody>
            </ThemeCard>
          </div>
        </Inner2Wrapper>
      </OuterWrapper>
      <ThemeModal 
        backdrop="blur" 
        isOpen={isOpen} 
        onClose={()=>dispatch({detail: undefined})}
        size="xl"
      >
        <ModalContent>
          {(onClose) => (
            <Fragment>
              <ModalHeader>&nbsp;</ModalHeader>
              <ThemeModalBody className="flex flex-col gap-6">
                <div className="flex flex-row gap-4">
                  <div className="w-[6rem] h-[6rem]">
                    <ThemeAvatar 
                      isBordered 
                      radius="sm" 
                      icon={
                        <div className="w-full h-full flex items-center justify-center">
                          <NextImage 
                            src={state.detail?.photo ?? "/placeholder.png"}
                            alt="alt-example"
                            width={96}
                            height={96}
                            className="drop-shadow-sm"
                          />
                        </div>
                      }
                      className="w-[6rem] h-[6rem] pointer-events-none z-0" 
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className={`font-extrabold ${dmSans700.className} text-xl`}>{state.detail?.name}</div>
                    {state.detail?.start_redemption_date && state.detail?.end_redemption_date ?
                      <CustomDatePicker 
                        disabled
                        value={state.detail?.start_redemption_date && state.detail?.end_redemption_date &&[new Date(state.detail.start_redemption_date), new Date(state.detail.end_redemption_date)]}
                      />
                      :
                      <ThemeChip color="danger">No Redemption Date</ThemeChip>
                    }
                    <div className={`my-2 ${dmSans400.className} text-sm`}>
                      {state.detail?.description}
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <MarketplaceXP2Icon />
                      <span className={`${dmSans700.className} text-4xl text-semibold`}>{numFormatter(state.detail?.xp_cost ?? 0)}</span>
                    </div>
                    <div className="flex flex-row w-full justify-between">
                      <div className="flex flex-col gap-2">
                        <div className={`${dmSans700.className} text-lg`}>Quantity</div>
                        <ThemeInput 
                          className="max-w-[140px]"
                          size='sm' 
                          type="text" 
                          placeholder="Quantity"
                          labelPlacement="outside"
                          isDisabled={!token}
                          formik={{
                            config: formik,
                            name: "qty"
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className={`${dmSans700.className} text-lg`}>Select XP to use</div>
                        <div className="flex flex-row items-center gap-2">
                          <MarketplaceXP2SmallIcon />
                          <ThemeSwitch 
                            color="warning"
                            formik={{
                              config: formik,
                              name: "type_point"
                            }}
                            size="sm"
                          />
                          <ZealySmallIcon />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className={`${dmSans700.className} text-lg`}>Total</div>
                      <div className="flex flex-row items-center gap-2">
                        <MarketplaceXP2Icon />
                        <span className={`${dmSans700.className} text-4xl text-semibold`}>{(formik.values.qty ?? 0) * (state.detail?.xp_cost ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {token &&
                  <div className="flex items-center justify-center">
                    <ThemeButton 
                      color="warning" 
                      radius="full" 
                      className={`w-64 ${manrope800.className}`} 
                      size="lg"
                      isLoading={state.isLoading}
                      isDisabled={state.isLoading}
                      onClick={async () => await submitFormikForm(formik)}
                    >
                      Redeem
                    </ThemeButton>
                  </div>
                }
              </ThemeModalBody>
            </Fragment>
          )}
        </ModalContent>
      </ThemeModal>
    </Fragment>
  )
}

export default PublicMarketplaceProjectPage