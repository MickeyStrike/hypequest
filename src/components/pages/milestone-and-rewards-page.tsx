import React, { FC, Fragment, useMemo } from 'react'
import { ThemeButton, ThemeCard, ThemeChip, ThemeInput, ThemeTextarea, DropzoneReturnValues, ThemeDivider, ThemeSelect, ThemeColorPicker, ThemeDropzone, ThemeAlert, ThemeAlertType, ThemeRadioGroup, ThemeRadio, ThemeCardBody, ThemePopover } from "@/components/reusables/NextuiTheme";
import { CustomMilestoneRewardIcon, CustomProgressBar, InfoTooltip } from "@/components/reusables";
import { submitFormikForm, useDebounce, useMinimizedState, lookup, addSearchParams, nFormatter, numFormatter, capitalizeEveryWord, capitalizeFirstLetter } from "@/helper";
import { CardBody, PopoverContent, PopoverTrigger, SelectItem } from "@nextui-org/react";
import { useGlobalContext } from '@/providers/stores';
import { UpdateLuckyWheelRequest, IClient, IMarketplace, IUpdateClientStage, StageRewardTypeEnum, MilestoneAndRewardOptions, IChainSupportResponse, IClientStage, IBannerProgressStages } from "@/types/service-types";
import { FormikErrors, useFormik } from 'formik';
import useClientService from '@/services/client-service';
import { AlertModalType, useModal } from '@/providers/modal';
import { useRouter, useSearchParams } from 'next/navigation';
import * as yup from "yup";
import { Manrope } from "@next/font/google";
import { LinkIcon, MarketplaceXP2Icon, TwitterXBlackIcon } from '../assets/icons';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

interface IMilestoneAndRewardsPage {
  clientProject?: IClient,
  onUpdated?: ((clientProject: IClient) => void)
}

interface ILuckyWheelForm extends Omit<UpdateLuckyWheelRequest, "icon" | "id"> {
  id?: string
  is_activate?: boolean;
  is_free_spin?: boolean;
  draggableId: string;
  icon?:  DropzoneReturnValues;
}

interface InitState {
  rewards: Array<ILuckyWheelForm>;
  marketplaces: Array<IMarketplace>;
  isLoading: boolean;
  selectedTotalStage?: number
  supportedChains: Array<IChainSupportResponse>;
  selectedStage?: IBannerProgressStages;
  clientProject?: IClient;
}
interface ICustomStageForm extends Omit<IUpdateClientStage, "icon" | "clientProjectStageId"> {
  clientProjectStageId?: string;
  icon?: DropzoneReturnValues;
  rewardLookup?: string;
}
interface IFormMilestone {
  is_activate?: boolean;
  items: Array<ICustomStageForm>;
  selectedStage: number;
}

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope700 = Manrope({weight: "700", subsets: ["latin"]})
const manrope600 = Manrope({weight: "600", subsets: ["latin"]})

const MilestoneAndRewardsPage:FC<IMilestoneAndRewardsPage> = ({
  clientProject,
  onUpdated
}) => {
  const openModal = useModal()
  const {state: { isLight, token, profile }} = useGlobalContext()
  const { createStageClient, updateStageClient, getClientDetail, getContractChainSupport } = useClientService()
  const [state, dispatch] = useMinimizedState<InitState>({
    rewards: [],
    marketplaces: [],
    isLoading: false,
    supportedChains: [],
    clientProject
  })
  const MRformik = useFormik<IFormMilestone>({
    initialValues: {
      selectedStage: 1,
      items: []
    },
    onSubmit: (vals) => {
      Promise.all(vals.items.map(item => {
        const selectedLookup = lookup.find(l => l.symbol === item.rewardLookup)

        const { icon, rewardLookup, value, clientProjectStageId, ...anotherItem } = item
        if(clientProjectStageId) return updateStageClient({
          ...anotherItem,
          clientProjectStageId,
          icon: icon?.rawFiles?.[0],
          value: selectedLookup ? value * selectedLookup.value : value
        })
        else return createStageClient({
          ...anotherItem,
          icon: icon?.rawFiles?.[0],
          value: selectedLookup ? value * selectedLookup.value : value
        })
      }))
        .then(() => {
          openModal({
            type: AlertModalType.SUCCESS,
            title: "Success!",
            description: `Successfully updated stages!`
          })

          if(clientProject?._id) {
            getClientDetail({clientProjectId: clientProject?._id})
              .then(res => {
                if(onUpdated) onUpdated(res.data.data)

                const items: Array<ICustomStageForm> = res.data.data.stages.map(stage => {
                  const { created_by, created_date, updated_date, updated_by, ...anotherStage } = stage
                  return {
                    ...anotherStage,
                    clientProjectStageId: anotherStage._id ?? undefined,
                    is_transaction_count: anotherStage.is_transaction_count ?? false,
                    targetMaxFollowers: anotherStage.target_max_followers,
                    target_max_transaction_count: anotherStage.target_max_transaction_count ?? 0,
                    icon: anotherStage.icon ? {
                      files: [anotherStage.icon],
                      rawFiles: []
                    } : undefined,
                  }
                })
      
                dispatch({selectedTotalStage: items.length ?? 0})
                
                MRformik.setValues({
                  items,
                  selectedStage: 1
                })
              })
              .catch((err: AxiosError<ResponseAPI<null>>) => err?.response?.data?.message && toast.error(err.response.data.message))
          }
        })
        .catch((err: AxiosError<ResponseAPI<null>>) => err?.response?.data?.message && toast.error(err.response.data.message))
    },
    validationSchema: yup.object().shape({
      items: yup.array().of(yup.object().shape({
        type: yup.string().required("Reward Type must be fill!"),
        is_transaction_count: yup.bool(),
        max_transaction_count: yup.number(),
        targetMaxFollowers: yup.number(),
        value: yup.number().min(1, "Value must be more than equal 1").required("Amount must be fill!"),
      }))
    })
  })

  useDebounce<[string, string | undefined]>((t, cpId)=>{
    if(t && cpId) {
      getContractChainSupport({Authorization: "Bearer " + t})
        .then(res => dispatch({supportedChains: res.data.data}))
        .catch((err: AxiosError<ResponseAPI<null>>) => toast.error(err?.response?.data.message))

      getClientDetail({clientProjectId: cpId}, {Authorization: "Bearer " + t})
        .then(res => {
          const items: Array<ICustomStageForm> = res.data.data.stages.map(stage => {
            const { created_by, created_date, updated_date, updated_by, ...anotherStage } = stage
            return {
              ...anotherStage,
              clientProjectStageId: anotherStage._id ?? undefined,
              is_transaction_count: anotherStage.is_transaction_count ?? false,
              targetMaxFollowers: anotherStage.target_max_followers,
              target_max_transaction_count: anotherStage.target_max_transaction_count ?? 0,
              icon: anotherStage.icon ? {
                files: [anotherStage.icon],
                rawFiles: []
              } : undefined,
              backgroundColor: anotherStage.background_color
            }
          })

          dispatch({
            selectedTotalStage: items.length ?? 0,
            clientProject: res.data.data
          })
          
          MRformik.setValues({
            items,
            selectedStage: 1
          })
        })
        .catch(err => console.log(err))
    }
  }, [token, clientProject?._id])

  const getValue = (properties: keyof ICustomStageForm) => {
    return MRformik.values.items?.[MRformik.values.selectedStage - 1]?.[properties]
  }

  const setValue = <T extends any>(properties: keyof ICustomStageForm, nv: T) => {
    let currentValues = MRformik.values.items
    currentValues[MRformik.values.selectedStage - 1][properties] = nv as never

    return MRformik.setFieldValue("items", currentValues)
  }

  const isFormError = (properties: keyof ICustomStageForm) => {
    return (MRformik.errors.items?.[MRformik.values.selectedStage - 1] as FormikErrors<ICustomStageForm> | undefined)?.[properties]
  }

  const getImgByRewardType = (values: DropzoneReturnValues) => {
    if(values.files[0]?.toString()) return values.files[0].toString()
    else {
      if(MRformik.values.items[MRformik.values.selectedStage - 1]?.type === StageRewardTypeEnum.USDT) return "/usdt.svg"
      else if(MRformik.values.items[MRformik.values.selectedStage - 1]?.type === StageRewardTypeEnum.XP) return "/xp.png"
      else return undefined
    }
  }

  const getBgColor = () => {
    if(MRformik.values.items[MRformik.values.selectedStage - 1]?.backgroundColor) return MRformik.values.items[MRformik.values.selectedStage - 1].backgroundColor
    else {
      if(MRformik.values.items[MRformik.values.selectedStage - 1]?.type === StageRewardTypeEnum.USDT) return "green"
      else return "purple"
    }
  }

  const isOwner = useMemo(()=>{
    if(typeof state.clientProject?.created_by === "object") return state.clientProject.created_by._id === profile?.id
    else return false
  }, [state.clientProject?.created_by, profile?.id])

  const contract_address_values = Array.isArray(getValue("contract_address")) ? getValue("contract_address") as Array<string> : [""]
  const chains_values = Array.isArray(getValue("chains")) ? (getValue("chains") as Array<string>).map(c => c.toString()) : ["1"]

  const progressBarRenderer = useMemo(()=>{
    let percentages = 0
    let currentIndex = 0

    const CURRENT_FOLLOWERS = state.clientProject?.twitter_follower_count ?? 0

    const clientStages = (state.clientProject?.stages && Array.isArray(state.clientProject?.stages) ? state.clientProject.stages : []) as Array<IBannerProgressStages>
    
    const NEW_STAGES = clientStages
      .sort((a,b) => {
        if(a.sequence > b.sequence) return 1
        else return -1
      })
      .map((stg, index) => {
        const total_transaction_count = stg.total_transaction_count ?? 0
        const target_max_transaction_count = stg.target_max_transaction_count ?? 0
        
        if(currentIndex === index) {
          if(stg.is_transaction_count) {
            if(total_transaction_count >= target_max_transaction_count) {
              percentages += 100/clientStages.length
              stg.is_reached = true
              currentIndex += 1
            }
            else {
              percentages += (total_transaction_count/(target_max_transaction_count ?? 1))*100/clientStages.length
              dispatch({selectedStage: stg})
            }
          }
          else {
            if(CURRENT_FOLLOWERS >= stg.target_max_followers) {
              percentages += 100/clientStages.length
              stg.is_reached = true
              currentIndex += 1
            }
            else {
              percentages += (CURRENT_FOLLOWERS/stg.target_max_followers)*100/clientStages.length
              dispatch({selectedStage: stg})
            }
          }
        }

        return stg
      })

    return (
      <CustomProgressBar 
        aria-label="Banner Progress Bar"
        className="py-8 my-4"
        items={NEW_STAGES}
        renderItem={(item, index) => {
          const isDarken = !item.is_reached

          const icon = () => {
            if(item.icon) return item.icon
            else {
              if(item.type === StageRewardTypeEnum.XP) return "/xp.png"
              else if(item.type === StageRewardTypeEnum.USDT) return "/usdt.png"
              else return undefined
            }
          }

          const TARGET_VALUE = item.is_transaction_count ? (item.target_max_transaction_count ?? 0) : item.target_max_followers

          const getShadowColor = () => {
            if(item.type === StageRewardTypeEnum.USDT) return "hover:shadow-green-500/50"
            else return "hover:shadow-purple-500/50"
          }

          const getBgIcon = () => {
            if(item.background_color) return item.background_color
            else {
              if(item.type === StageRewardTypeEnum.USDT) return "green"
              else return "purple"
            }
          }

          const popoverContents = [
            {label: "Type", value: item.is_transaction_count ? "Transaction Count" : "Followers Count" },
            {label: "Status", value: item.is_reached ? "Reached" : "Not Reached", className: item.is_reached ? "text-success" : "text-danger"},
            {label: "Target", value: `${nFormatter(TARGET_VALUE, 0)} ${item.is_transaction_count ? "Transactions" : "Followers"}`}
          ]

          return (
            <div className="flex flex-row">
              <div className={`flex flex-col ${isLight ? "text-black" : "text-white"} ${isDarken ? 'brightness-50' : ''} ${manrope600.className}`}>
                <span className="text-[12px] font-thin whitespace-nowrap">Stage {index+1}</span>
                <span className="text-[18px]">{nFormatter(TARGET_VALUE, 0)}</span>
              </div>
              <ThemePopover>
                <PopoverTrigger>
                  <div className={`${isDarken ? 'brightness-50' : ''} transition-all w-[110px] h-[110px] max-lg:w-[80px] max-lg:h-[80px] max-md:!w-[40px] max-md:!h-[40px] bg-gradient-to-r from-purple-800 to-yellow-400 rounded-full flex items-center justify-center hover:shadow-xl ${getShadowColor()} cursor-pointer hover:brightness-100`}>
                    <div className="w-[107px] h-[107px] max-lg:w-[77px] max-lg:h-[77px] bg-[#3b0764] rounded-full flex items-center justify-center">
                      <div className="w-[100px] h-[100px] max-lg:w-[70px] max-lg:h-[70px] bg-gradient-to-r from-purple-800 to-yellow-400 rounded-full flex items-center justify-center">
                        <div className="w-[90px] h-[90px] max-lg:w-[60px] max-lg:h-[60px] bg-[#3b0764] rounded-full flex flex-col items-center justify-center">
                          <span className={`${manrope800.className} ${isDarken ? 'text-white' : 'text-[#FFC627]'} text-xl`}>{nFormatter(item.value, 0)}</span>
                          <CustomMilestoneRewardIcon
                            imgHref={icon()}
                            background={getBgIcon()}
                            imgId={`custom-milestone-${index}`}
                            width="50%"
                            height="50%"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className={isLight ? "text-black" : "text-white"}>
                  <div className="px-1 py-2 flex flex-col gap-4">
                    <div className="text-small"><span className="font-bold">Stage {index + 1}</span> Details</div>
                    <div className="flex flex-col gap-2">
                      {popoverContents.map((pc,pcIndex) =>
                        <div key={pcIndex} className="flex flex-row items-center justify-between gap-8">
                          <b className="text-tiny">{pc.label}:</b>
                          <div className={`text-tiny ${pc.className ?? ""}`}>{pc.value}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </ThemePopover>
            </div>
          )
        }}
        value={percentages}
      />
    )
  }, [state.clientProject?.twitter_follower_count, state.clientProject?.stages, isLight])

  return (
    <ThemeCard className="mb-8">
      <CardBody className="flex flex-col gap-10 lg:p-8">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
          <div className="flex flex-col gap-1 p-2 rounded-xl w-full">
            <span className={`${isLight ? "text-black-900" : "text-white"} text-xl ${manrope600.className}`}>Accumulated XP Jackpot</span>
            <div className={`flex flex-row items-center p-3 rounded-2xl gap-4 ${isLight ? 'bg-white-900 border-black border-2' : 'bg-gray-800'} max-xl:w-full`}>
              <MarketplaceXP2Icon />
              <span className={`${isLight ? "text-black-900" : "text-white"} text-5xl text-ellipsis overflow-hidden ${manrope700.className}`}>{numFormatter(state.clientProject?.accumulatedPoints?.total_point ?? 0)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 p-2 rounded-xl w-full">
            <span className={`${isLight ? "text-black-900" : "text-white"} text-xl ${manrope600.className}`}>Current {state.selectedStage?.is_transaction_count ? 'Milestones' : 'Followers'}</span>
            <div className={`flex flex-row items-center p-3 rounded-2xl gap-4 ${isLight ? 'bg-white-900 border-black border-2' : 'bg-gray-800'} max-xl:w-full`}>
              {state.selectedStage?.is_transaction_count ? <LinkIcon width="61" height="61" /> : <TwitterXBlackIcon />}
              <span className={`${isLight ? "text-black-900" : "text-white"} text-5xl text-ellipsis overflow-hidden ${manrope700.className}`}>{numFormatter(state.selectedStage?.is_transaction_count ? (state.selectedStage?.total_transaction_count ?? 0) : (state.clientProject?.twitter_follower_count ?? 0))}</span>
            </div>
          </div>
        </div>
        {progressBarRenderer}
        {isOwner ?
          <div className="flex flex-col gap-4">
            <div className={`w-full flex items-center gap-1 mt-6 md:mb-0 ${isLight ? 'text-black' : 'text-white'}`}>
              Set Your Project Milestones <InfoTooltip title="No of Stages will be appears in banner" />
            </div>
            <div className='flex flex-row flex-nowrap overflow-x-auto h-full gap-1'>
              {
                [...Array(3).keys()].map((_, index) => (
                  <ThemeChip
                    radius="sm"
                    classNames={{
                      content: 'w-[50px] text-center'
                    }}
                    className="cursor-pointer"
                    key={index}
                    color={state.selectedTotalStage === index + 3 ? "warning" : "default"}
                    onClick={()=>{
                      openModal({
                        type: AlertModalType.INFO,
                        title: "Warning!",
                        description: "Are you sure to choose the number of stages? The submitted data will be created into a new stages.",
                        onOk: () => {
                          dispatch({selectedTotalStage: index + 3})
                          MRformik.setFieldValue("items", [...Array(index + 3).keys()].map((index) => ({
                            clientProjectId: clientProject?._id ?? "",
                            is_transaction_count: false,
                            icon: {
                              files: [],
                              rawFiles: [],
                            },
                            type: StageRewardTypeEnum.XP,
                            targetMaxFollowers: 0,
                            target_max_transaction_count: 0,
                            value: 0,
                            sequence: index,
                          } as ICustomStageForm)))
                        },
                        okButtonProps: {
                          children: "Yes!"
                        },
                        isCancelButton: true
                      })
                    }}
                  >
                    {index + 3}
                  </ThemeChip>
                ))
              }
            </div>
            {(typeof state.selectedTotalStage === "number" && state.selectedTotalStage > 0) &&
              <div className="flex flex-col gap-4">
                <ThemeDivider />
                <div className="flex flex-col lg:flex-row justify-between gap-5">
                  <div className="w-full flex flex-col gap-8">
                    <div className={`w-full flex gap-3 items-center gap-1 md:mb-0 ${isLight ? 'text-black' : 'text-white'}`}>
                      <p>Stage</p>
                      <div className="flex items-center gap-1">
                        {
                          [...Array(state.selectedTotalStage ?? 0).keys()].map((_, index) => (
                            <ThemeChip
                              radius="sm"
                              classNames={{
                                content: 'w-[50px] text-center cursor-pointer'
                              }}
                              key={index}
                              color={MRformik.values.selectedStage === index + 1 ? "warning" : "default"}
                              onClick={()=>MRformik.setFieldValue("selectedStage", index + 1)}
                            >
                              {index + 1}
                            </ThemeChip>
                          ))
                        }
                      </div>
                    </div>
                    <ThemeSelect
                      selectedKeys={getValue("type") ? new Set([getValue("type") as string]) : undefined}
                      onSelectionChange={(selections) => {
                        if(selections instanceof Set) {
                          const value = selections.values()
                          const finalValue = value.next().value
                          if(typeof finalValue === "string") setValue("type", finalValue)
                        }
                      }}
                      isInvalid={!!isFormError("type")}
                      errorMessage={isFormError("type")}
                      label="Select Reward"
                      placeholder="Enter Value"
                      labelPlacement="outside"
                      variant='bordered'
                      radius="sm"
                    >
                      {Object.entries(StageRewardTypeEnum).map(([label,value]) =>
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )}
                    </ThemeSelect>
                    <ThemeRadioGroup
                      label="Progress Bar Parameters"
                      orientation="horizontal"
                      onValueChange={(value) => setValue("is_transaction_count", value === MilestoneAndRewardOptions.TRANSACTION_COUNTS ? true : false)}
                      value={getValue("is_transaction_count") ? MilestoneAndRewardOptions.TRANSACTION_COUNTS : MilestoneAndRewardOptions.TWITTER_FOLLOWERS_COUNTS}
                      isInvalid={!!isFormError("is_transaction_count")}
                      errorMessage={isFormError("is_transaction_count")}
                    >
                      {Object.entries(MilestoneAndRewardOptions).map(([_key,val], index) =>
                        <ThemeRadio key={index} value={val}>{capitalizeEveryWord(val.replace(/_/g, " ").toLowerCase())}</ThemeRadio>
                      )}
                    </ThemeRadioGroup>
                    {getValue("is_transaction_count") &&
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-row items-center justify-between">
                          <h2 className={`${isLight ? "text-black" : "text-white"}`}>Transaction Count Configuration</h2>
                          <ThemeButton
                            size="sm"
                            onClick={() => {
                              let clonedContractAddress = structuredClone(contract_address_values)
                              let clonedChain = structuredClone(chains_values)

                              clonedContractAddress = [...clonedContractAddress, ""]
                              clonedChain = [...clonedChain, "1"]

                              setValue("contract_address", clonedContractAddress)
                              setValue("chains", clonedChain)
                            }}
                          >
                            Add Configuration
                          </ThemeButton>
                        </div>
                        {contract_address_values.map((ca, index) =>
                          <ThemeCard key={index}>
                            <ThemeCardBody className="flex flex-row items-end gap-4">
                              <ThemeSelect
                                label="Selected Chain"
                                labelPlacement="outside"
                                placeholder="Enter Selected Chain"
                                onSelectionChange={(selections) => {
                                  if(selections instanceof Set) {
                                    const value = selections.values()
                                    const finalValue = value.next().value
                                    let clonedChain = structuredClone(chains_values)
                                    clonedChain[index] = finalValue

                                    setValue("chains", clonedChain)
                                  }
                                }}
                                selectedKeys={chains_values[index] ? new Set([chains_values[index]]) : undefined}
                              >
                                {state.supportedChains.map((sc) =>
                                  <SelectItem key={sc.chain_id} value={sc.chain_id.toString()} textValue={capitalizeFirstLetter(sc.chain_name)}>{capitalizeFirstLetter(sc.chain_name)}</SelectItem>
                                )}
                              </ThemeSelect>
                              <ThemeInput 
                                label="Contract Address"
                                labelPlacement="outside"
                                placeholder="Enter Contract Address"
                                onValueChange={(value) => {
                                  let clonedContractAddress = structuredClone(contract_address_values)

                                  clonedContractAddress[index] = value
                                  setValue("contract_address", clonedContractAddress)
                                }}
                                value={ca}
                              />
                              {contract_address_values.length > 1 &&
                                <ThemeButton
                                  color="danger"
                                  onClick={()=>{
                                    openModal({
                                      type: AlertModalType.INFO,
                                      title: "Warning",
                                      description: "Are you sure want to delete this item?",
                                      isCancelButton: true,
                                      okButtonProps: {
                                        children: "Yes, Delete it!",
                                        color: "danger"
                                      },
                                      onOk: () => {
                                        let clonedContractAddress = structuredClone(contract_address_values)
                                        let clonedChain = structuredClone(chains_values)

                                        clonedContractAddress = clonedContractAddress.filter((_, i) => i !== index)
                                        clonedChain = clonedChain.filter((_, i) => i !== index)

                                        setValue("contract_address", clonedContractAddress)
                                        setValue("chains", clonedChain)
                                      }
                                    })
                                  }}
                                >
                                  Remove
                                </ThemeButton>
                              }
                            </ThemeCardBody>
                          </ThemeCard>
                        )}
                      </div>
                    }
                    <ThemeInput
                      type="text"
                      onValueChange={(value) => {
                        setValue("targetMaxFollowers", getValue("is_transaction_count") ? 0 : Number(value))
                        setValue("target_max_transaction_count", getValue("is_transaction_count") ? Number(value) : 0)
                      }}
                      value={getValue("is_transaction_count") ? getValue("target_max_transaction_count") as string : getValue("targetMaxFollowers") as string}
                      label={getValue("is_transaction_count") ? "Target Max Transactions" : "Target Max Followers"}
                      placeholder="Enter Value"
                      labelPlacement="outside"
                      variant='bordered'
                      radius="sm"
                      isInvalid={getValue("is_transaction_count") ? !!isFormError("target_max_transaction_count") : !!isFormError("targetMaxFollowers")}
                      errorMessage={getValue("is_transaction_count") ? isFormError("target_max_transaction_count") : isFormError("targetMaxFollowers")}
                    />
                    <div className="flex w-full flex-wrap items-end md:flex-nowrap mt-6 mb-6 md:mb-0 gap-4">
                      <ThemeInput
                        type="text"
                        onValueChange={(value) => setValue("value", Number(value))}
                        value={getValue("value") as string}
                        label="Enter Reward Amount"
                        placeholder="Enter Value"
                        labelPlacement="outside"
                        variant='bordered'
                        radius="sm"
                        isInvalid={!!isFormError("value")}
                        errorMessage={isFormError("value")}
                      />
                      <ThemeSelect
                        selectedKeys={getValue("rewardLookup") ? new Set([getValue("rewardLookup") as string]) : undefined}
                        onSelectionChange={(selections) => {
                          if(selections instanceof Set) {
                            const value = selections.values()
                            const finalValue = value.next().value
                            if(typeof finalValue === "string") setValue("rewardLookup", finalValue)
                          }
                        }}
                        placeholder="Enter Value"
                        label={<Fragment />}
                        labelPlacement="outside"
                        variant='bordered'
                        radius="sm"                
                      >
                        {lookup.map((l) =>
                          <SelectItem key={l.symbol} value={l.symbol} textValue={l.symbol}>
                            {l.symbol || "None"}
                          </SelectItem>
                        )}
                      </ThemeSelect>
                    </div>
                    <ThemeColorPicker
                      onValueChange={(value) => setValue("backgroundColor", value)}
                      value={getValue("backgroundColor") as string}
                      label="Select Background"
                      placeholder="Enter Value"
                      labelPlacement="outside"
                      variant='bordered'
                      radius="sm"
                    />
                  </div>
                  <ThemeDropzone 
                    label="Milestone Reward Preview"
                    supportedMimes={["image/png","image/jpeg"]}
                    maxByteSize={5e+6}
                    multiple={false}
                    onChange={(values) => setValue("icon", values)}
                    values={getValue("icon") as DropzoneReturnValues | undefined}
                    contentLabel={
                      <div className="flex flex-row items-center gap-2">
                        <InfoTooltip title="It is recommended to upload images with the same length and width dimensions" />
                        <span className="text-xs">You can upload your custom icon here!</span>
                      </div>
                    }
                    customRender={(getRootProps, getInputProps, values) =>
                      <div className={`flex items-center justify-center ${isLight ? "bg-[#F1F1F1]" : "bg-[#111111]"} p-10 rounded-lg`} {...getRootProps()}>
                        <input {...getInputProps()} />
                        <div className={`transition-all w-[150px] h-[150px] bg-gradient-to-r from-purple-800 to-yellow-400 rounded-full flex items-center justify-center`}>
                          <div className="w-[148px] h-[148px] bg-[#3b0764] rounded-full flex items-center justify-center">
                            <div className="w-[140px] h-[140px] bg-gradient-to-r from-purple-800 to-yellow-400 rounded-full flex items-center justify-center">
                              <div className="w-[135px] h-[135px] bg-[#3b0764] rounded-full flex flex-col items-center justify-center gap-6 p-2 overflow-hidden text-ellipsis">
                                <span className={`${manrope800.className} text-[#FFC627] text-2xl`}>{getValue("value") as string | undefined}{(getValue("rewardLookup") as string | undefined)?.toUpperCase()}</span>
                                <CustomMilestoneRewardIcon 
                                  imgHref={getImgByRewardType(values)}
                                  background={getBgColor()}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </div>
                <ThemeButton className="w-fit" color="warning" radius="full" onClick={() => submitFormikForm(MRformik)}>Save</ThemeButton>
              </div>
            }
          </div>
          :
          <ThemeAlert
            title="Warning"
            type={ThemeAlertType.WARNING}
          >
            You can&apos;t update this stages, because you are not the Owner.
          </ThemeAlert>
        }
      </CardBody>
    </ThemeCard>
  )
}

export default MilestoneAndRewardsPage