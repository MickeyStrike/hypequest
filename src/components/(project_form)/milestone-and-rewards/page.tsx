"use client"
import ErrorIcon from "@/components/assets/icons/ErrorIcon";
import { CustomMilestoneRewardIcon } from "@/components/reusables";
import InfoTooltip from "@/components/reusables/InfoTooltip";
import { DropzoneReturnValues, ThemeButton, ThemeCard, ThemeCardBody, ThemeCardHeader, ThemeCheckbox, ThemeChip, ThemeColorPicker, ThemeDivider, ThemeDropzone, ThemeInput, ThemeRadio, ThemeRadioGroup, ThemeSelect, ThemeTooltip } from "@/components/reusables/NextuiTheme";
import { addSearchParams, capitalizeEveryWord, capitalizeFirstLetter, lookup, submitFormikForm, useDebounce, useMinimizedState } from "@/helper";
import { createProfilePath, questCreationPath } from "@/helper/route-path";
import { AlertModalType, useModal } from "@/providers/modal";
import { useFormContext } from "@/providers/project-form-stores";
import { useGlobalContext } from "@/providers/stores";
import useClientService from "@/services/client-service";
import { IChainSupportResponse, ICreateClientStage, IUpdateClientStage, MilestoneAndRewardOptions, StageRewardTypeEnum } from "@/types/service-types";
import { CardBody, SelectItem } from "@nextui-org/react";
import { AxiosError } from "axios";
import { FormikErrors, useFormik } from "formik";
import { NextPage } from "next";
import { Manrope } from "@next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Fragment, useEffect } from "react";
import { toast } from "react-toastify";
import * as yup from "yup";

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})

interface ICustomStageForm extends Omit<IUpdateClientStage, "icon" | "clientProjectStageId"> {
  clientProjectStageId?: string;
  icon?: DropzoneReturnValues;
  rewardLookup?: string;
}

interface IForm {
  items: Array<ICustomStageForm>;
  selectedStage: number;
}

interface InitialState {
  selectedTotalStage?: number;
  supportedChains: Array<IChainSupportResponse>;
}

const CreateMilestoneAndRewardsPage: NextPage = () => {
  const { createStageClient, updateStageClient, getClientDetail, getContractChainSupport } = useClientService()
  const [state, dispatch] = useMinimizedState<InitialState>({
    supportedChains: []
  })
  const openModal = useModal()
  const router = useRouter()
  const params = useSearchParams()
  const clientProjectId = params.get("clientProjectId")
  const formik = useFormik<IForm>({
    initialValues: {
      selectedStage: 1,
      items: [],
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
            description: `Successfully ${clientProjectId ? "updated" : "created"} stages!`
          })

          router.push(addSearchParams(questCreationPath, {clientProjectId}))
        })
        .catch((err: AxiosError<ResponseAPI<null>>) => toast.error(err?.response?.data?.message))
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
  const formContext = useFormContext()
  const {state: {isLight, token}} = useGlobalContext()

  useEffect(()=>{
    formContext.dispatch({title: "Milestone & Rewards"})

    if(!clientProjectId) {
      router.push(createProfilePath)
      openModal({
        type: AlertModalType.WARNING,
        title: "Not Allowed!",
        description: "You are not allowed to access this page!"
      })
    }
  }, [])

  useDebounce<[string, string | null]>((t, cpId)=>{
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
              clientProjectStageId: anotherStage._id,
              is_transaction_count: anotherStage.is_transaction_count ?? false,
              targetMaxFollowers: anotherStage.target_max_followers,
              target_max_transaction_count: anotherStage.target_max_transaction_count ?? 0,
              icon: anotherStage.icon ? {
                files: [anotherStage.icon],
                rawFiles: []
              } : undefined,
            }
          })

          dispatch({selectedTotalStage: items.length})
          
          formik.setValues({
            items,
            selectedStage: 1,
          })
        })
        .catch(err => console.log(err))
    }
  }, [token, clientProjectId])

  const getImgByRewardType = (values: DropzoneReturnValues) => {
    if(values.files[0]?.toString()) return values.files[0].toString()
    else {
      if(formik.values.items[formik.values.selectedStage - 1]?.type === StageRewardTypeEnum.USDT) return "/usdt.svg"
      else if(formik.values.items[formik.values.selectedStage - 1]?.type === StageRewardTypeEnum.XP) return "/xp.png"
      else return undefined
    }
  }

  const getBgColor = () => {
    if(formik.values.items[formik.values.selectedStage - 1]?.backgroundColor) return formik.values.items[formik.values.selectedStage - 1].backgroundColor
    else {
      if(formik.values.items[formik.values.selectedStage - 1]?.type === StageRewardTypeEnum.USDT) return "green"
      else return "purple"
    }
  }

  const getValue = (properties: keyof ICustomStageForm) => {
    return formik.values.items?.[formik.values.selectedStage - 1]?.[properties]
  }

  const setValue = <T extends any>(properties: keyof ICustomStageForm, nv: T) => {
    let currentValues = formik.values.items
    currentValues[formik.values.selectedStage - 1][properties] = nv as never

    return formik.setFieldValue("items", currentValues)
  }

  const isFormError = (properties: keyof ICustomStageForm) => {
    return (formik.errors.items?.[formik.values.selectedStage - 1] as FormikErrors<ICustomStageForm> | undefined)?.[properties]
  }

  const contract_address_values = Array.isArray(getValue("contract_address")) ? getValue("contract_address") as Array<string> : [""]
  const chains_values = Array.isArray(getValue("chains")) ? (getValue("chains") as Array<string>).map(c => c.toString()) : ["1"]

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className={`w-full flex items-center gap-1 mt-6 md:mb-0 ${isLight ? 'text-black' : 'text-white'}`}>
        Set Your Project Milestones <InfoTooltip title="The number of stages will appear on the progress bar" />
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
                dispatch({selectedTotalStage: index + 3})
                formik.setFieldValue("items", [...Array(index + 3).keys()].map((index) => ({
                  clientProjectId: clientProjectId ?? "",
                  is_transaction_count: false,
                  contract_address: [""],
                  chains: [1],
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
              }}
            >
              {index + 3}
            </ThemeChip>
          ))
        }
      </div>
      {state.selectedTotalStage &&
        <div className="flex flex-col gap-4">
          <ThemeDivider />
          <div className="flex flex-col lg:flex-row gap-5">
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
                        color={formik.values.selectedStage === index + 1 ? "warning" : "default"}
                        onClick={()=>formik.setFieldValue("selectedStage", index + 1)}
                      >
                        {index + 1}
                      </ThemeChip>
                    ))
                  }
                </div>
              </div>
              <div className="flex w-full flex-wrap md:flex-nowrap mt-6 mb-6 md:mb-0 gap-4">
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
                  // className='basis-3/4'
                  radius="sm"
                >
                  {Object.entries(StageRewardTypeEnum).map(([label,value]) =>
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )}
                </ThemeSelect>
              </div>
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
              <div className="flex items-center gap-4">
                <ThemeInput
                  type="text"
                  onValueChange={(value) => setValue("value", Number(value))}
                  value={getValue("value") as string}
                  label="Reward Amount"
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
          <ThemeButton className="w-fit" color="warning" radius="full" onClick={async () => await submitFormikForm(formik)}>Submit</ThemeButton>
        </div>
      }
    </div>
  )
}

export default CreateMilestoneAndRewardsPage