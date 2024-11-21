"use client"
import { AntdInfoIcon, FreeSpinIcon, GoodLuckIcon, MinusIcon, ProfileCustomIcon } from "@/components/assets/icons";
import { CustomMilestoneRewardIcon, InfoTooltip } from "@/components/reusables";
import { DropzoneReturnValues, ThemeAlert, ThemeAlertType, ThemeAvatar, ThemeButton, ThemeCard, ThemeCheckbox, ThemeChip, ThemeColorPicker, ThemeDivider, ThemeDropzone, ThemeInput, ThemeSelect, ThemeSlider, ThemeSwitch, ThemeTextarea } from "@/components/reusables/NextuiTheme";
import { reorder, submitFormikForm, useDebounce, useMinimizedState, lookup, addSearchParams } from "@/helper";
import { AlertModalType, useModal } from "@/providers/modal";
import { useGlobalContext } from "@/providers/stores";
import useSocialRaidAdminService from "@/services/admin-social-raid-service";
import useClientService from "@/services/client-service";
import useLuckyWheelService from "@/services/lucky-wheel-admin-service";
import useMarketplaceService from "@/services/marketplace-service";
import { UpdateLuckyWheelRequest, IClient, IConvertionConsumptionSpin, ICreateConvertionConsumptionSpin, IMarketplace, ISocialRaidPayload, LuckyWheelTypesEnum, IActivateZealyAdmin, IUpdateClientStage, StageRewardTypeEnum } from "@/types/service-types";
import { CardBody, CardHeader, SelectItem } from "@nextui-org/react";
import { useFormik, FormikErrors } from "formik";
import { Manrope, Roboto } from "@next/font/google";
import { FC, Fragment, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from "react-beautiful-dnd"
import { toast } from "react-toastify";
import { v4 } from "uuid";
import * as yup from "yup";
import { useSearchParams, useRouter } from "next/navigation";
import { questCreationPath } from "@/helper/route-path";
import NextLink from "next/link"

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope400 = Roboto({weight: "400", subsets: ["latin"]})

interface ILuckyWheelForm extends Omit<UpdateLuckyWheelRequest, "icon" | "id"> {
  id?: string
  is_activate?: boolean;
  is_free_spin?: boolean;
  draggableId: string;
  icon?:  DropzoneReturnValues;
}

interface ISocialRaidPayloadCustom extends ISocialRaidPayload {
  uuid: string;
  _id?: string;
}

interface ISocialRaidForm {
  is_activate?: boolean;
  items: Array<ISocialRaidPayloadCustom>;
  totalFamous: number;
}

interface InitState {
  rewards: Array<ILuckyWheelForm>;
  marketplaces: Array<IMarketplace>;
  isLoading: boolean;
  selectedTotalStage?: number
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

export interface SettingComponentPageProps {
  clientProject?: IClient;
  onUpdated?: (clientProject: IClient) => void;
}

const SettingComponentPage: FC<SettingComponentPageProps> = (props) => {
  const openModal = useModal()
  const { activateZealyAdmin } = useClientService()
  const { getAllMarketplaces } = useMarketplaceService()
  const { createLuckyWheel, updateLuckyWheel, activateLuckyWheel, updateConvertionSpin, activateFreeSpin, getAllLuckyWheel } = useLuckyWheelService()
  const { createSocialRaids, getAllSocialRaids, activateSocialRaid } = useSocialRaidAdminService()
  const [state, dispatch] = useMinimizedState<InitState>({
    rewards: [],
    marketplaces: [],
    isLoading: false
  })
  const ZFformik = useFormik<Partial<IActivateZealyAdmin>>({
    initialValues: {},
    onSubmit: (vals) => {
      if(vals.zealy_subdomain && vals.zealy_api_key && props.clientProject?._id) {
        dispatch({isLoading: true})
        activateZealyAdmin({
          clientProjectId: props.clientProject?._id,
          is_active: !!vals.is_active,
          zealy_subdomain: vals.zealy_subdomain,
          zealy_api_key: vals.zealy_api_key
        })
          .then(res => {
            toast.success(`Successfully Updated Zealy Quest Configuration!`)
  
            if(props.clientProject) props.onUpdated?.({
              ...props.clientProject,
              zealy_feature: !!vals.is_active,
              zealy_subdomain: vals.zealy_subdomain
            })
          })
          .catch(err => console.log(err))
          .finally(() => dispatch({isLoading: false}))
      }
    },
    validationSchema: yup.object().shape({
      zealy_subdomain: yup.string().required("Zealy Subdomain must be filled!"),
      zealy_api_key: yup.string().required("Zealy API Key must be filled!"),
    })
  })
  const SRformik = useFormik<ISocialRaidForm>({
    initialValues: {
      items: props.clientProject?._id ? [
        {
          uuid: v4(),
          clientProjectId: props.clientProject._id,
          account: "",
          keywords: []
        }
      ] : [],
      totalFamous: 0
    },
    onSubmit: (val) => {
      if(Array.isArray(val.items) && val.items.length > 0) {
        dispatch({isLoading: true})
        createSocialRaids(val.items.map(i => ({...i, id: i._id ?? i.id})))
          .then(res => {
            openModal({
              type: AlertModalType.SUCCESS,
              title: "Success",
              description: "We've saved your changes",
              okButtonProps: {
                children: "Next"
              }
            })
          })
          .catch(err => console.log(err))
          .finally(() => dispatch({isLoading: false}))
      }
      else toast.warning('Social Raid Target must be fill, at least more than one!')
    },
    validationSchema: yup.object().shape({
      items: yup.array().of(
        yup.object().shape({
          account: yup.string().required("Account must be filled!"),
          keywords: yup.array().of(yup.string().required("Keyword must be filled!")).test({
            message: "Keyword at least must be more than 0",
            test: (arr) => Array.isArray(arr) && arr.length > 0
          })
        })
      )
    })
  })

  const LWformik = useFormik<Partial<ILuckyWheelForm>>({
    initialValues: {},
    onSubmit: (val) => {
      const cloned = structuredClone(state.rewards).map(r => ({...r, percentage: 0}))

      if(props.clientProject?._id && val.type_reward) cloned.push({
        ...val,
        draggableId: v4(),
        value: val.value ? Number(val.value) : undefined,
        clientProjectId: props.clientProject?._id,
        type_reward: val.type_reward,
        percentage: 0
      })
      else toast.warning('You must fill the form!')

      dispatch({ rewards: cloned })
    },
    validationSchema: yup.object().shape({
      type_reward: yup.mixed().oneOf(Object.entries(LuckyWheelTypesEnum).map(([_,value]) => value)).required("Type Reward must be fill!"),
      value: yup.number().when('type_reward', (type_reward, schema) => {
        const isRequiredTypes: Array<LuckyWheelTypesEnum> = [LuckyWheelTypesEnum.XP, LuckyWheelTypesEnum.USDT]
        if(isRequiredTypes.find(t => t === type_reward[0])) return schema.required("Reward Value must be filled!")
        else return schema.notRequired()
      }),
      marketplaceId: yup.string().when('type_reward', (type_reward, schema) => {
        const isRequiredTypes: Array<LuckyWheelTypesEnum> = [LuckyWheelTypesEnum.CUSTOM]
        if(isRequiredTypes.find(t => t === type_reward[0])) return schema.required("Marketplace Item must be filled!")
        else return schema.notRequired()
      }),
      qty: yup.number().required('Quantity must be filled!')
    })
  })

  const convertionFormik = useFormik<Partial<ICreateConvertionConsumptionSpin>>({
    initialValues: {},
    onSubmit: (vals) => {
      if(props.clientProject?._id) {
        dispatch({isLoading: true})
        updateConvertionSpin({
          clientProjectId: props.clientProject._id,
          items: vals.items ?? []
        })
          .then(()=>{
            toast.success(`Successfully Updated Convertion Configuration!`)

            if(props.onUpdated && props.clientProject) props.onUpdated({
              ...props.clientProject,
              convertion_consumption_spin: vals.items ?? []
            })
          })
          .catch(err => {
            console.log(err)
          })
          .finally(() => dispatch({isLoading: false}))
      }
    },
    validationSchema: yup.object().shape({
      items: yup.array().of(yup.object().shape({
        amount_consumption: yup.number().required("Amount Consumption must be filled!"),
        amount_spin: yup.number().required("Amount Spin must be filled!"),
      })).min(1, 'You must fill at least one item')
    })
  })

  const {state: { isLight, token }} = useGlobalContext()
  const chips = [
    {
      type: LuckyWheelTypesEnum.XP,
      icon: (
        <CustomMilestoneRewardIcon 
          width="25"
          height="25"
          imgHref='/xp.png'
          background='purple'
          imgId='xp_icon'
        />
      ),
      label: "XP Boost"
    },
    {
      type: LuckyWheelTypesEnum.USDT,
      icon: (
        <CustomMilestoneRewardIcon 
          width="25"
          height="25"
          imgHref='/usdt.svg'
          background='green'
          imgId='usdt_icon'
        />
      ),
      label: "USDT"
    },
    {
      type: LuckyWheelTypesEnum.GOOD_LUCK,
      icon: <GoodLuckIcon />,
      label: "Good Luck"
    },
    {
      type: LuckyWheelTypesEnum.FREE_SPIN,
      icon: <FreeSpinIcon />,
      label: "Free Spin"
    },
    {
      type: LuckyWheelTypesEnum.CUSTOM,
      icon: <ProfileCustomIcon width="25" height="25" />,
      label: "Custom"
    },
  ]

  const totalRewardRenderer = () => {
    if(LWformik.values.type_reward === LuckyWheelTypesEnum.XP || LWformik.values.type_reward === LuckyWheelTypesEnum.USDT) {
      if(LWformik.values.type_reward === LuckyWheelTypesEnum.XP && LWformik.values.is_multiply) return (
        <ThemeSelect
          formik={{config: LWformik, name: "value"}}
          label="Select XP Multiplier"
          labelPlacement="outside"
        >
          <SelectItem key={1} value={1}>X1</SelectItem>
          <SelectItem key={2} value={2}>X2</SelectItem>
          <SelectItem key={3} value={3}>X3</SelectItem>
        </ThemeSelect>
      )
      else return (
        <ThemeInput 
          label="Input Total Reward"
          placeholder="Input Total Reward"
          labelPlacement="outside"
          formik={{config: LWformik, name: "value"}}
        />
      )
    }
    else return null
  }

  useDebounce<[string, IClient | undefined]>((t, cp)=>{
    if(t && cp?._id) {
      LWformik.setFieldValue("is_free_spin", cp.is_free_spin)
      getAllLuckyWheel({clientProjectId: cp._id}, {Authorization: "Bearer " + t})
        .then(res => {
          const rewards: Array<ILuckyWheelForm> = res.data.data.map(d => {
            return {
              ...d,
              marketplaceId: d.marketplaceId?._id,
              id: d._id,
              draggableId: v4(),
              icon: d.icon ? {
                files: [d.icon],
                rawFiles: []
              } : undefined,
            }
          })

          dispatch({rewards})
        })
        .catch(err => console.log(err))
    }
  }, [token, props.clientProject], 400)

  useEffect(()=>{
    LWformik.setFieldValue("is_multiply", false)
    LWformik.setFieldValue("value", undefined)
    LWformik.setFieldValue("qty", undefined)
    LWformik.setFieldValue("max_spin", undefined)
    LWformik.setFieldValue("marketplaceId", undefined)
    LWformik.setFieldValue("icon", undefined)
  }, [LWformik.values.type_reward])

  useEffect(()=>{
    LWformik.setFieldValue("value", undefined)
  }, [LWformik.values.is_multiply])

  useDebounce<[string, IClient | undefined]>((t, cp)=>{
    if(t && cp?._id) {
      getAllMarketplaces({
        clientProjectId: cp._id
      }, {Authorization: "Bearer " + t})
        .then(res => dispatch({marketplaces: res.data.data?.data}))
        .catch(err => console.log(err))

      getAllSocialRaids({clientProjectId: cp._id})
        .then(res => {
          SRformik.setFieldValue("items", res.data.data.map(d => ({
            ...d,
            uuid: v4()
          })))
          .catch(err => console.log(err))
        })
    }

    SRformik.setFieldValue("is_activate", cp?.is_social_raid_feature ?? false)
    LWformik.setFieldValue("is_activate", cp?.is_lucky_wheel_feature ?? false)

    if(cp?.convertion_consumption_spin) convertionFormik.setFieldValue("items", cp?.convertion_consumption_spin)
  }, [token, props.clientProject])

  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) return;

    const items = reorder(
      state.rewards,
      result.source.index,
      result.destination.index
    );

    dispatch({ rewards: items })
  }

  const getImgHref = (values: DropzoneReturnValues) => {
    if(values.files[0]?.toString()) return values.files[0].toString()
    else {
      if(LWformik.values.type_reward === LuckyWheelTypesEnum.USDT) return "/usdt.svg"
      else if(LWformik.values.type_reward === LuckyWheelTypesEnum.XP) return "/xp.png"
      else return undefined
    }
  }

  const checkIsErrorItemsForm = (key: number, selectedProp: keyof ISocialRaidPayloadCustom) => {
    if(Array.isArray(SRformik.errors.items) && SRformik.touched.items) {
      const selectedError = SRformik.errors.items[key]
      if(typeof selectedError === "object") return selectedError[selectedProp]
      else return selectedError
    }
    else return ""
  }

  const isErrorMessageConvertion = (index: number, property: keyof IConvertionConsumptionSpin) => {
    if(Array.isArray(convertionFormik.errors.items)) return convertionFormik.errors.items[index]?.[property]
    else return convertionFormik.errors.items
  }

  const dropzoneRenderer = () => {
    const typesAllowed = [LuckyWheelTypesEnum.USDT, LuckyWheelTypesEnum.XP, LuckyWheelTypesEnum.CUSTOM]

    if(typesAllowed.find(t => t === LWformik.values.type_reward)) return (
      <ThemeDropzone
        formik={{config: LWformik, name: "icon"}}
        label="Icon Preview"
        supportedMimes={["image/png","image/jpeg"]}
        maxByteSize={5e+6}
        multiple={false}
        position="horizontal"
        contentLabel={
          <div className="flex flex-row items-center gap-2">
            <span className="text-xs">You can upload your custom icon here!</span>
          </div>
        }
        customRender={(getRootProps, getInputProps, values) =>
          <div className={`flex items-center justify-center ${isLight ? "bg-[#F1F1F1]" : "bg-[#111111]"} p-4 rounded-lg`} {...getRootProps()}>
            <input {...getInputProps()} />
            <CustomMilestoneRewardIcon
              imgHref={getImgHref(values)}
              background={LWformik.values.type_reward === LuckyWheelTypesEnum.XP ? 'purple' : 'green'}
              imgId={(values.files[0]?.toString() ?? LWformik.values.type_reward)?.replace(/ /g,"_")}
            />
          </div>
        }
      />
    )
    else return null
  }

  const saveHandler = () => {
    Promise.all(state.rewards.map(reward => {
      if(reward.id) updateLuckyWheel({
        ...reward,
        id: reward.id,
        icon: reward.icon?.rawFiles[0]
      })
      else return createLuckyWheel({
        ...reward,
        icon: reward.icon?.rawFiles[0]
      })
    }))
      .then(()=>toast.success("Successfully created or updated datas!"))
      .catch(err => console.log(err))
  }

  const { createStageClient, updateStageClient, getClientDetail } = useClientService()
  const router = useRouter()
  const params = useSearchParams()
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
            description: `Successfully ${params.get("clientProjectId") ? "updated" : "created"} stages!`
          })

          router.push(addSearchParams(questCreationPath, {clientProjectId: params.get("clientProjectId")}))
        })
    },
    validationSchema: yup.array().of(yup.object().shape({
      type: yup.string().required("Reward Type must be fill!"),
      targetMaxFollowers: yup.number().min(1, "Value must be more than equal 1").required("Target Max Followers must be fill!"),
      value: yup.number().min(1, "Value must be more than equal 1").required("Amount must be fill!"),
    }))
  })

  useDebounce<[string, string | null]>((t, cpId)=>{
    if(t && cpId) {
      getClientDetail({clientProjectId: cpId}, {Authorization: "Bearer " + t})
        .then(res => {
          const items: Array<ICustomStageForm> = res.data.data.stages.map(stage => {
            const { created_by, created_date, updated_date, updated_by, ...anotherStage } = stage
            return {
              ...anotherStage,
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
          
          MRformik.setValues({
            items,
            selectedStage: 1
          })
        })
        .catch(err => console.log(err))
    }
  }, [token, params.get("clientProjectId")])

  const totalPercentages = state.rewards.map(r => r.percentage).reduce((a,b) => a+b, 0)
  
  return (
    <div className="flex flex-col gap-4 w-full mb-8">
      <ThemeCard>
        <CardHeader className="flex flex-row justify-between gap-2 lg:p-8">
          <h1 className={`${manrope800.className} text-[30px]`}>Zealy Integration</h1>
          <ThemeSwitch 
            color="warning" 
            size="sm"
            formik={{config: ZFformik, name: "is_active"}}
            onValueChange={(is_active: boolean) => {
              if(is_active === false && props.clientProject?._id && ZFformik.values.zealy_subdomain && ZFformik.values.zealy_api_key) {
                activateZealyAdmin({
                  clientProjectId: props.clientProject?._id,
                  is_active,
                  zealy_subdomain: ZFformik.values.zealy_subdomain,
                  zealy_api_key: ZFformik.values.zealy_api_key
                })
                  .then(res => {
                    toast.success(`Successfully ${is_active ? "activated" : "deactivated"} the Zealy integration!`)

                    if(props.clientProject) props.onUpdated?.({
                      ...props.clientProject,
                      zealy_feature: is_active,
                      zealy_subdomain: ZFformik.values.zealy_subdomain
                    })
                  })
                  .catch(err => console.log(err))
              }
            }}
          >
            Enable
          </ThemeSwitch>
        </CardHeader>
        {ZFformik.values.is_active &&
          <CardBody className="flex flex-col gap-4 lg:p-8">
            <ThemeInput 
              formik={{
                config: ZFformik,
                name: "zealy_subdomain"
              }}
              label="Zealy Subdomain"
              labelPlacement="outside"
              startContent="https://zealy.io/c/"
              placeholder="[subdomain]"
            />
            <ThemeInput 
              formik={{
                config: ZFformik,
                name: "zealy_api_key"
              }}
              label="Zealy API Key"
              labelPlacement="outside"
              placeholder="API Key"
            />
            {ZFformik.values.zealy_subdomain &&
              <ThemeAlert
                title="Notes"
                type={ThemeAlertType.SUCCESS}
              >
                You can get the API key by following the instructions from this page <NextLink className="underline underline-offset-2" href={`https://zealy.io/cw/${ZFformik.values.zealy_subdomain ?? "[your_subdomain]"}/settings/integrations/api-keys`} target="_blank">https://zealy.io/cw/{ZFformik.values.zealy_subdomain ?? "[your_subdomain]"}/settings/integrations/api-keys</NextLink>
              </ThemeAlert>
            }
            <ThemeButton
              onClick={async () => await submitFormikForm(ZFformik)}
              radius="full"
              isLoading={state.isLoading}
              isDisabled={state.isLoading}
              color="primary"
            >
              Submit
            </ThemeButton>
          </CardBody>
        }
      </ThemeCard>
      <ThemeCard>
        <CardHeader className="flex flex-row justify-between gap-2 lg:p-8">
          <h1 className={`${manrope800.className} text-[30px]`}>Social Raid</h1>
          <ThemeSwitch 
            color="warning" 
            size="sm"
            formik={{config: SRformik, name: "is_activate"}}
            onValueChange={(is_active: boolean) => {
              if(typeof is_active === "boolean" && props.clientProject?._id) {
                activateSocialRaid({
                  clientProjectId: props.clientProject?._id,
                  is_active
                })
                  .then(res => {
                    toast.success(`Successfully ${is_active ? "Activate" : "Inactivate"} Social Raid!`)

                    if(props.clientProject) props.onUpdated?.({
                      ...props.clientProject,
                      is_social_raid_feature: is_active
                    })
                  })
                  .catch(err => console.log(err))
              }
            }}
          >
            Activate
          </ThemeSwitch>
        </CardHeader>
        {SRformik.values.is_activate &&
          <CardBody className="flex flex-col gap-4 lg:p-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between gap-2">
                <h2 className={`${manrope800.className} text-[25px]`}>Social Raid Target</h2>
                {props.clientProject?._id &&
                  <ThemeButton
                    onClick={()=>{
                      if(props.clientProject?._id) SRformik.setFieldValue("items", [...SRformik.values.items, {
                        clientProjectId: props.clientProject?._id,
                        account: "",
                        keywords: [],
                        uuid: v4(),
                      }])
                      else openModal({
                        type: AlertModalType.WARNING,
                        title: "Alert!",
                        description: "You must select project first!"
                      })
                    }}
                  >
                    Add Target
                  </ThemeButton>
                }
              </div>
              {SRformik.values.items.map((item, index) => 
                <div key={item.uuid} className="flex flex-row gap-4 justify-between">
                  <ThemeInput 
                    placeholder="Twitter Account"
                    label="Twitter Account"
                    labelPlacement="outside"
                    value={item.account}
                    onValueChange={(v) => {
                      const deepClone = structuredClone(SRformik.values.items).map(i => {
                        if(i.uuid === item.uuid) i.account = v

                        return i
                      })
                      SRformik.setFieldValue("items", deepClone)
                    }}
                    isInvalid={!!checkIsErrorItemsForm(index, "account")}
                    errorMessage={checkIsErrorItemsForm(index, "account")}
                  />
                  <ThemeTextarea 
                    placeholder="#NFT,#Airdrop,..."
                    label={<div className="flex flex-row items-center gap-2">List of Keywords <InfoTooltip title="Separate each keyword without spacing with commas, for example: #NFT,#Airdrop,..." /></div>}
                    labelPlacement="outside"
                    value={item.keywords.join(",")}
                    onValueChange={(v) => {
                      const deepClone = structuredClone(SRformik.values.items).map(i => {
                        if(i.uuid === item.uuid) i.keywords = v.split(",")

                        return i
                      })
                      SRformik.setFieldValue("items", deepClone)
                    }}
                    isInvalid={!!checkIsErrorItemsForm(index, "keywords")}
                    errorMessage={checkIsErrorItemsForm(index, "keywords")}
                  />
                  {(SRformik.values.items ?? []).length > 1 &&
                    <ThemeButton 
                      color="danger"
                      onClick={()=> {
                        openModal({
                          type: AlertModalType.WARNING,
                          title: "Confirmation",
                          description: "Are you sure want to delete this item?",
                          okButtonProps: {
                            children: "Delete",
                            color: "danger"
                          },
                          isCancelButton: true,
                          onOk: () => {
                            const items = (SRformik.values.items ?? []).filter(i => i.uuid !== item.uuid)
                        
                            SRformik.setFieldValue("items", items)
                          }
                        })
                      }}
                      size="sm"
                      radius="full"
                    >
                      Remove
                    </ThemeButton>
                  }
                </div>
              )}
              <ThemeButton 
                radius="full"
                color="primary" 
                onClick={async () => await submitFormikForm(SRformik)}
                isLoading={state.isLoading}
                isDisabled={state.isLoading}
              >
                Save
              </ThemeButton>
            </div>
          </CardBody>
        }
      </ThemeCard>
      {/* <ThemeCard>
        <CardHeader className="flex flex-row justify-between gap-2 lg:p-8">
          <h1 className={`${manrope800.className} text-[30px]`}>Lucky Spin</h1>
          <ThemeSwitch 
            color="warning" 
            size="sm"
            formik={{config: LWformik, name: "is_activate"}}
            onValueChange={(is_active: boolean) => {
              if(typeof is_active === "boolean" && props.clientProject?._id) {
                activateLuckyWheel({
                  clientProjectId: props.clientProject?._id,
                  is_active
                })
                  .then(res => {
                    toast.success(`Successfully ${is_active ? "Activate" : "Inactivate"} Lucky Wheel!`)

                    if(props.clientProject) props.onUpdated?.({
                      ...props.clientProject,
                      is_lucky_wheel_feature: is_active
                    })
                  })
                  .catch(err => console.log(err))
              }
            }}
          >
            Activate
          </ThemeSwitch>
        </CardHeader>
        {LWformik.values.is_activate &&
          <CardBody className="flex flex-col gap-4 lg:p-8">
            <div className="flex flex-row items-center justify-between">
              <h2>Activate Free Spin per Day</h2>
              <ThemeSwitch 
                color="warning" 
                size="sm"
                formik={{config: LWformik, name: "is_free_spin"}}
                onValueChange={(value: boolean) => {
                  if(typeof value === "boolean" && props.clientProject?._id) {
                    activateFreeSpin({
                      clientProjectId: props.clientProject?._id,
                      value
                    })
                      .then(res => {
                        toast.success(`Successfully ${value ? "Activate" : "Inactivate"} Free Spin!`)

                        if(props.clientProject) props.onUpdated?.({
                          ...props.clientProject,
                          is_free_spin: value
                        })
                      })
                      .catch(err => console.log(err))
                  }
                }}
              >
                Activate Free Spin
              </ThemeSwitch>
            </div>
            <ThemeDivider />
            <div className="flex flex-col lg:flex-row justify-between w-full gap-8">
              <div className="flex flex-col gap-6 w-3/5">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-row items-center gap-2">
                    <h3 className={`${manrope800.className} text-[15px]`}>List of Rewards</h3>
                    <InfoTooltip title="List of Rewards!" />
                  </div>
                  <div className="flex gap-4">
                    {chips.map((chip, index) =>
                      <ThemeChip 
                        key={index}
                        color={LWformik.values.type_reward === chip.type ? "warning" : "default"}
                        className="cursor-pointer"
                        onClick={()=>{
                          LWformik.setFieldValue("type_reward", chip.type)
                          LWformik.setTouched({}, false)
                        }}
                        startContent={chip.icon}
                      >
                        {chip.label}
                      </ThemeChip>
                    )}
                  </div>
                </div>
                {LWformik.values.type_reward === LuckyWheelTypesEnum.XP &&
                  <ThemeCheckbox formik={{config: LWformik, name: "is_multiply"}}>Is Multiply</ThemeCheckbox>
                }
                {LWformik.values.type_reward === LuckyWheelTypesEnum.CUSTOM &&
                  <ThemeSelect
                    formik={{config: LWformik, name: "marketplaceId"}}
                    items={state.marketplaces}
                    label="Select Marketplace Item"
                    labelPlacement="outside"
                    placeholder="Select Marketplace Item"
                    classNames={{
                      label: "group-data-[filled=true]:-translate-y-16",
                      trigger: "min-h-unit-16",
                      listboxWrapper: "max-h-[400px]",
                    }}
                    listboxProps={{
                      itemClasses: {
                        base: [
                          "rounded-md",
                          "text-default-500",
                          "transition-opacity",
                          "data-[hover=true]:text-foreground",
                          "data-[hover=true]:bg-default-100",
                          "dark:data-[hover=true]:bg-default-50",
                          "data-[selectable=true]:focus:bg-default-50",
                          "data-[pressed=true]:opacity-70",
                          "data-[focus-visible=true]:ring-default-500",
                        ],
                      },
                    }}
                    popoverProps={{
                      classNames: {
                        base: "before:bg-default-200",
                        content: "p-0 border-small border-divider bg-background",
                      },
                    }}
                    renderValue={(items) => {
                      return items.map((item) => {
                        const { data } = item as { data: IMarketplace }
                        return (
                          <div key={item.key} className="flex items-center gap-2">
                            <ThemeAvatar
                              alt={data.photo}
                              className="flex-shrink-0"
                              size="sm"
                              src={data.photo}
                            />
                            <div className="flex flex-col">
                              <span>{data.name}</span>
                              <span className="text-default-500 text-tiny">{data.description}</span>
                            </div>
                          </div>
                        )
                      });
                    }}
                  >
                    {(marketplace) => {
                      const m = marketplace as IMarketplace
                      return (
                        <SelectItem key={m._id!!} textValue={m.name}>
                          <div className="flex gap-2 items-center">
                            <ThemeAvatar alt={m.photo} className="flex-shrink-0" size="sm" src={m.photo} />
                            <div className="flex flex-col">
                              <span className="text-small">{m.name}</span>
                              <span className="text-tiny text-default-400">{m.description}</span>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    }}
                  </ThemeSelect>
                }
                {totalRewardRenderer()}
                {LWformik.values.type_reward &&
                  <Fragment>
                    <ThemeInput 
                      formik={{config: LWformik, name: "qty"}}
                      type="text"
                      placeholder="Quantity"
                      labelPlacement="outside"
                      label={
                        <div className="flex flex-row items-center gap-2">
                          <span>Quantity</span>
                          <InfoTooltip title="Set to 0 for Unlimited Quantity" />
                        </div>
                      }
                    />
                    <ThemeInput 
                      formik={{config: LWformik, name: "max_spin"}}
                      type="text"
                      placeholder="Max Spin"
                      labelPlacement="outside"
                      label={
                        <div className="flex flex-row items-center gap-2">
                          <span>Max Spin</span>
                          <InfoTooltip title="Max Spin per Day" />
                        </div>
                      }
                    />
                  </Fragment>
                }
              </div>
              {dropzoneRenderer()}
            </div>
            {LWformik.values.type_reward &&
              <ThemeButton 
                size="sm"
                radius="full"
                color="primary" 
                onClick={async () => await submitFormikForm(LWformik)}
                isLoading={state.isLoading}
                isDisabled={state.isLoading}
                className="w-max"
              >
                Add Reward to List
              </ThemeButton>
            }
            <ThemeDivider />
            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between w-full">
                <h3 className={`${manrope800.className} text-[15px]`}>Active Rewards ({state.rewards.length})</h3>
                {totalPercentages > 100 ?
                  <h3 className={`${manrope800.className} text-[15px] text-danger`}>
                    The maximum total percentage is 100
                  </h3>
                  :
                  <h3 className={`${manrope800.className} text-[15px]`}>
                    Total Percentage ({totalPercentages}%)
                  </h3>
                }
              </div>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, _snapshot) =>
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-col gap-2 w-full"
                    >
                      {state.rewards.length === 0 &&
                        <div className="text-center rounded border-1 border-gray-400 p-4 opacity-25">No Active Rewards</div>
                      }
                      {state.rewards.map((reward, index) =>
                        <Draggable key={reward.draggableId} draggableId={reward.draggableId} index={index}>
                          {(p, s) => 
                            <ThemeCard
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              className={`transition-all ${s.isDragging ? 'drop-shadow-2xl' : ''}`}
                            >
                              <CardBody className="flex flex-col justify-between gap-2">
                                <div className="flex flex-row items-center justify-between gap-2 w-full">
                                  <div className="flex flex-row items-center gap-2">
                                    {chips.find(chip => chip.type === reward.type_reward)?.icon}
                                    <h3>
                                      {(reward.type_reward === LuckyWheelTypesEnum.XP || reward.type_reward === LuckyWheelTypesEnum.USDT) && reward.is_multiply ?
                                        `X${reward.value}` : reward.value
                                      } {reward.type_reward}
                                    </h3>
                                  </div>
                                  <ThemeButton 
                                    isIconOnly 
                                    variant="light"
                                    onClick={()=>openModal({
                                      type: AlertModalType.INFO,
                                      title: "Discard this item",
                                      description: "Are you sure to discard this item ?",
                                      okButtonProps: {
                                        children: "Discard",
                                        color: "danger"
                                      },
                                      isCancelButton: true,
                                      onOk: () => dispatch({
                                        rewards: structuredClone(state.rewards).filter(c => c.draggableId !== reward.draggableId)
                                      }),
                                    })}
                                  >
                                    <MinusIcon />
                                  </ThemeButton>
                                </div>
                                <ThemeSlider 
                                  minValue={0} 
                                  maxValue={100} 
                                  step={0.001} 
                                  size="sm" 
                                  label="Set Percentage" 
                                  value={reward.percentage}
                                  onChange={(value)=>{
                                    let cloned = structuredClone(state.rewards)
                                    cloned[index].percentage = Number(value)
                                    dispatch({rewards: cloned})
                                  }}
                                />
                              </CardBody>
                            </ThemeCard>
                          }
                        </Draggable>
                      )}
                    </div>
                  }
                </Droppable>
              </DragDropContext>
            </div>
            {state.rewards.length > 0 && 
            <ThemeButton 
              color="warning" 
              radius="full" 
              onClick={()=>saveHandler()}
              size="sm"
              className="w-max"
              isDisabled={totalPercentages > 100}
            >
              Save
            </ThemeButton>}
            <ThemeDivider />
            <h3 className={`${manrope800.className} text-[15px]`}>Convertion Spin Setting</h3>
            {(convertionFormik.values.items ?? []).map((item, index) => 
              <div className="flex flex-row items-center justify-between w-full" key={index}>
                <div className="flex flex-row gap-2">
                  <ThemeInput 
                    type="text"
                    label="XP Consumption"
                    labelPlacement="outside"
                    value={item.amount_consumption.toString()}
                    onValueChange={(value) => {
                      let items = convertionFormik.values.items ?? []
                      items[index].amount_consumption = Number(value)
                      convertionFormik.setFieldValue("items", items)
                    }}
                    isInvalid={!!isErrorMessageConvertion(index, "amount_consumption")}
                    errorMessage={isErrorMessageConvertion(index, "amount_consumption")}
                    endContent={
                      <CustomMilestoneRewardIcon 
                        imgHref="/xp.png"
                        imgId="amount-consumption-xp"
                        background="purple"
                        width="25"
                        height="25"
                      />
                    }
                  />
                  <ThemeInput 
                    type="text"
                    label="Amount Spin"
                    labelPlacement="outside"
                    value={item.amount_spin.toString()}
                    onValueChange={(value) => {
                      let items = convertionFormik.values.items ?? []
                      items[index].amount_spin = Number(value)
                      convertionFormik.setFieldValue("items", items)
                    }}
                    isInvalid={!!isErrorMessageConvertion(index, "amount_spin")}
                    errorMessage={isErrorMessageConvertion(index, "amount_spin")}
                  />
                </div>
                {(convertionFormik.values.items ?? []).length > 1 &&
                  <ThemeButton
                    color="danger"
                    onClick={()=>{
                      openModal({
                        type: AlertModalType.WARNING,
                        title: "Confirmation",
                        description: "Are you sure want to delete this item ?",
                        okButtonProps: {
                          children: "Delete",
                          color: "danger"
                        },
                        isCancelButton: true,
                        onOk: () => {
                          let items = (convertionFormik.values.items ?? []).filter((_, idx) => idx !== index)
                          convertionFormik.setFieldValue("items", items)
                        }
                      })
                    }}
                    size="sm"
                    radius="full"
                  >
                    Remove
                  </ThemeButton>
                }
              </div>
            )}
            {convertionFormik.errors.items && <div className="text-danger text-[0.75rem]">{convertionFormik.errors.items}</div>}
            <div className="flex flex-row items-center justify-between w-full">
              <ThemeButton
                onClick={()=>{
                  let items = (convertionFormik.values.items ?? [])
                  items.push({amount_consumption: 0, amount_spin: 0})

                  convertionFormik.setFieldValue("items", items)
                }}
                size="sm"
                radius="full"
              >
                Add Convertion Spin
              </ThemeButton>
              <ThemeButton
                color="warning"
                onClick={async () => await submitFormikForm(convertionFormik)}
                size="sm"
                radius="full"
              >
                Update Convertion Spin
              </ThemeButton>
            </div>
          </CardBody>
        }
      </ThemeCard> */}
      {/* <ThemeCard>
        <CardHeader className="flex flex-row justify-between gap-2 lg:p-8">
          <h1 className={`${manrope800.className} text-[30px]`}>Milestone & Rewards</h1>
          <ThemeSwitch 
            color="warning" 
            size="sm"
            formik={{config: MRformik, name: "is_activate"}}
            onValueChange={(is_active: boolean) => {
              if(typeof is_active === "boolean" && props.clientProject?._id) {
                activateLuckyWheel({
                  clientProjectId: props.clientProject?._id,
                  is_active
                })
                  .then(res => {
                    toast.success(`Successfully ${is_active ? "Activate" : "Inactivate"} Lucky Wheel!`)

                    if(props.clientProject) props.onUpdated?.({
                      ...props.clientProject,
                      is_lucky_wheel_feature: is_active
                    })
                  })
                  .catch(err => console.log(err))
              }
            }}
          >
            Activate
          </ThemeSwitch>
        </CardHeader>
        {MRformik.values.is_activate &&
          <CardBody className="flex flex-col gap-4 lg:p-8">
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
                        dispatch({selectedTotalStage: index + 3})
                        MRformik.setFieldValue("items", [...Array(index + 3).keys()].map((index) => ({
                          clientProjectId: params.get("clientProjectId") ?? "",
                          icon: {
                            files: [],
                            rawFiles: [],
                          },
                          type: StageRewardTypeEnum.XP,
                          targetMaxFollowers: 0,
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
                    <div className="min-w-[15rem]">
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
                      <br />
                      <ThemeInput
                        type="number"
                        onValueChange={(value) => setValue("targetMaxFollowers", Number(value))}
                        value={getValue("targetMaxFollowers") as string}
                        label="Twitter Followers Goal"
                        placeholder="Enter Value"
                        labelPlacement="outside"
                        variant='bordered'
                        className='basis-3/5'
                        radius="sm"
                        isInvalid={!!isFormError("targetMaxFollowers")}
                        errorMessage={isFormError("targetMaxFollowers")}
                      />
                      <div className="flex w-full flex-wrap items-end md:flex-nowrap mt-6 mb-6 md:mb-0 gap-4">
                        <ThemeInput
                          type="number"
                          onValueChange={(value) => setValue("value", Number(value))}
                          value={getValue("value") as string}
                          label="Reward Amount"
                          placeholder="Enter Value"
                          labelPlacement="outside"
                          variant='bordered'
                          className='basis-3/5'
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
                          labelPlacement="outside"
                          variant='bordered'
                          className='basis-2/5'
                          radius="sm"                
                        >
                          {lookup.map((l) =>
                            <SelectItem key={l.symbol} value={l.symbol} textValue={l.symbol}>
                              {l.symbol || "None"}
                            </SelectItem>
                          )}
                        </ThemeSelect>
                      </div>
                      <div className="flex w-full flex-wrap items-end md:flex-nowrap mt-6 mb-6 md:mb-0 gap-4">
                        <ThemeColorPicker 
                          onValueChange={(value) => setValue("backgroundColor", value)}
                          value={getValue("backgroundColor") as string}
                          label="Select Background"
                          placeholder="Enter Value"
                          labelPlacement="outside"
                          variant='bordered'
                          className='basis-3/4'
                          radius="sm"
                        />
                      </div>
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
                  <div className="">
                    <ThemeButton color="warning" radius="full" onClick={async () => await submitFormikForm(MRformik)}>Save</ThemeButton>
                  </div>
                </div>
              }
            </div>
          </CardBody>
        }
      </ThemeCard> */}
    </div>
  )
}

export default SettingComponentPage