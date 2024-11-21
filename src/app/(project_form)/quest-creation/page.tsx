"use client"
import { CloseIcon, DiscordIcon2, PlusIcon, TelegramIcon2, XIcon, ZealySmallIcon } from "@/components/assets/icons";
import EmailIcon from "@/components/assets/icons/EmailIcon";
import NFTIcon from "@/components/assets/icons/NFTIcon";
import WalletIcon from "@/components/assets/icons/WalletIcon";
import { CustomMilestoneRewardIcon } from "@/components/reusables";
import CustomCalendar from "@/components/reusables/CustomCalendar";
import CustomNavigation from "@/components/reusables/CustomNavigationQuest";
import { DropzoneReturnValues, ThemeAccordion, ThemeAvatar, ThemeButton, ThemeChip, ThemeDropzone, ThemeInput, ThemeSelect, ThemeSwitch, ThemeTextarea } from "@/components/reusables/NextuiTheme";
import { addSearchParams, capitalizeEveryWord, getListDescription, submitFormikForm, useDebounce, useMinimizedState } from "@/helper";
import { TabEnum, menuNavigationQuest } from "@/localeData/menuNavigationQuest";
import { useFormContext } from "@/providers/project-form-stores";
import { useGlobalContext } from "@/providers/stores";
import { AccordionItem, SelectItem, cn } from "@nextui-org/react";
import { NextPage } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import NextImage from "next/image";
import React, { Fragment, ReactNode, useEffect } from "react";
import Xp from '@/components/assets/images/XP.png'
import { useFormik } from "formik";
import { IClient, ICreateQuestboard, IMission, ITemplatePlatform, IUpdateQuestboard, ListContentTemplate, ListContentTemplateItem, MissionTypesEnum, RewardServeEnum, StageRewardTypeEnum } from "@/types/service-types";
import CustomDatePicker from "@/components/reusables/CustomDatePicker";
import { useRouter, useSearchParams } from "next/navigation";
import { DateObject } from "react-multi-date-picker";
import * as yup from "yup"
import { AlertModalType, useModal } from "@/providers/modal";
import useQuestService from "@/services/quest-service";
import { DateTime } from "luxon";
import { createProfilePath, marketplacePath, questboardPath } from "@/helper/route-path";
import useClientService from "@/services/client-service";
import { v4 } from "uuid";
import YoutubeIcon from "@/components/assets/icons/YoutubeIcon";

const dmSans900 = DM_Sans({weight: "900", subsets: ["latin"]})
const manrope800 = Manrope({weight: "800", subsets: ["latin"]})

interface ICustomCreateQuestboard extends Omit<IUpdateQuestboard, "missions" | "questBoardId"> {
  questBoardId?: string;
  redemptionTime?: Date[] | null;
  distributionTime?: Date | null;
  isNoEndTime?: boolean;
  selectedQuestTypePlatform?: string;
  missions: Array<Partial<IMission>>;
  deletedMissions: Array<Partial<IMission>>;
  questboardThumbnail?: DropzoneReturnValues;
}

// const listChooseTemplate = [
//   {
//     title: 'X',
//     icon: <XIcon />
//   },
//   {
//     title: 'Discord',
//     icon: <DiscordIcon2 />
//   },
//   {
//     title: 'Telegram',
//     icon: <TelegramIcon2 />
//   },
//   {
//     title: 'Email',
//     icon: <EmailIcon />
//   },
//   {
//     title: 'Wallet',
//     icon: <WalletIcon />
//   },
//   {
//     title: 'NFT',
//     icon: <NFTIcon />
//   },
// ]

interface LocalState {
  activeTab: TabEnum;
  isLoading: boolean;
  clientProject?: IClient;
  alreadyCreatedPlatform: Array<MissionTypesEnum>;
}

const CreateQuestCreation: NextPage = () => {
  const router = useRouter()
  const openModal = useModal()
  const params = useSearchParams()
  const formContext = useFormContext()
  const { getClientDetail } = useClientService()
  const { createQuestboard, updateQuestboard, getDetailQuestboard, checkIsAlreadyConnect, deleteMission, updateThumbnailQuestboard } = useQuestService()
  const { state: { isLight, token } } = useGlobalContext()
  const [localState, setLocalState] = useMinimizedState<LocalState>({
    activeTab: TabEnum.SETUP,
    isLoading: false,
    alreadyCreatedPlatform: []
  })
  const clientProjectId = params.get("clientProjectId")
  const isCreate = params.get("isCreate")
  const questBoardId = params.get("questBoardId")
  
  const formik = useFormik<Partial<ICustomCreateQuestboard>>({
    initialValues: {},
    onSubmit: (vals) => {
      Promise.all((vals.deletedMissions ?? []).map(dm => {
        if(dm._id) return deleteMission({missionId: dm._id})
        else return null
      }))

      if(clientProjectId && vals.title) {
        const payload: ICreateQuestboard = {
          clientProjectId,
          title: vals.title,
          description: vals.description,
          extra_reward_point: vals.extra_reward_point,
          extra_reward_type: vals.extra_reward_type,
          reward_name: vals.reward_name,
          number_of_rewards: vals.number_of_rewards,
          distribute_reward_epoch: vals.distributionTime ? DateTime.fromJSDate(new Date(vals.distributionTime as Date)).toMillis() : undefined,
          reward_serve_type: vals.reward_serve_type,
          background_color: vals.background_color,
          start_redemption_epoch: vals.redemptionTime?.[0] ? DateTime.fromJSDate(new Date(vals.redemptionTime[0])).toMillis() : undefined,
          end_redemption_epoch: vals.redemptionTime?.[1] ? DateTime.fromJSDate(new Date(vals.redemptionTime[1])).toMillis() : undefined,
          extra_max_joiner: vals.extra_max_joiner,
          missions: (vals.missions ?? []).map(mission => ({
            clientProjectId,
            _id: mission._id,
            missionId: mission._id,
            title: mission.title,
            description: mission.description,
            point_reward: mission.point_reward,
            usdt_reward: mission.usdt_reward,
            is_deleted: false,
            object: {
              ...mission.data,
              label: mission.title,
              title: vals.title,
              description: vals.description,
              extra_reward_point: vals.extra_reward_point,
              extra_reward_type: vals.extra_reward_type,
              reward_name: vals.reward_name,
              number_of_rewards: vals.number_of_rewards,
              distribute_reward_epoch: vals.distributionTime ? DateTime.fromJSDate(new Date(vals.distributionTime as Date)).toMillis() : undefined,
              reward_serve_type: vals.reward_serve_type,
              background_color: vals.background_color,
              start_redemption_date: vals.isNoEndTime ? undefined : (vals.redemptionTime?.[0] ? new Date(vals.redemptionTime?.[0]).toISOString() : undefined),
              end_redemption_date: vals.isNoEndTime ? undefined : (vals.redemptionTime?.[1] ? new Date(vals.redemptionTime?.[1]).toISOString() : undefined),
              start_redemption_epoch: vals.redemptionTime?.[0] ? DateTime.fromJSDate(new Date(vals.redemptionTime[0])).toMillis() : undefined,
              end_redemption_epoch: vals.redemptionTime?.[1] ? DateTime.fromJSDate(new Date(vals.redemptionTime[1])).toMillis() : undefined,
              extra_max_joiner: vals.extra_max_joiner,
            },
            type: mission.type,
            start_redemption_date: vals.isNoEndTime ? undefined : (vals.redemptionTime?.[0] ? new Date(vals.redemptionTime?.[0]).toISOString() : undefined),
            end_redemption_date: vals.isNoEndTime ? undefined : (vals.redemptionTime?.[1] ? new Date(vals.redemptionTime?.[1]).toISOString() : undefined),
          } as IMission)),
        }
  
        setLocalState({isLoading: true})
        if(questBoardId) {
          updateQuestboard({
            ...payload,
            questBoardId
          })
            .then(async (res) => {
              try {
                if(vals.questboardThumbnail?.rawFiles?.[0] && res.data.data.questBoardId) await updateThumbnailQuestboard({
                  questBoardId: res.data.data.questBoardId,
                  questboardThumbnail: vals.questboardThumbnail.rawFiles[0]
                })
  
                openModal({
                  type: AlertModalType.SUCCESS,
                  title: "Success!",
                  description: "Successfully updated Questboard!"
                })
  
                router.push(questboardPath + `/${localState.clientProject?.username}`)
              }
              catch(err) {
                openModal({
                  type: AlertModalType.WARNING,
                  title: "Warning!",
                  description: "Successfully updated Questboard, but update the thumbnail is failed!"
                })
              }
            })
            .catch(err => {
              console.log(err)
              if(err?.response?.data?.message) openModal({
                type: AlertModalType.ERROR,
                title: "Oops!",
                description: err.response.data.message
              })
            })
            .finally(()=>setLocalState({isLoading: false}))
        }
        else {
          createQuestboard({
            ...payload,
            questBoardId: v4()
          })
            .then(async (res) => {
              try {
                if(vals.questboardThumbnail?.rawFiles?.[0] && res.data.data.questBoardId) await updateThumbnailQuestboard({
                  questBoardId: res.data.data.questBoardId,
                  questboardThumbnail: vals.questboardThumbnail.rawFiles[0]
                })
                openModal({
                  type: AlertModalType.SUCCESS,
                  title: "Successfully!",
                  description: "Successfully created Questboard!"
                })
    
                if(isCreate && localState.clientProject?.username) router.push(`${questboardPath}/${localState.clientProject?.username}`)
                else router.push(addSearchParams(marketplacePath, {clientProjectId}))
              }
              catch(err) {
                openModal({
                  type: AlertModalType.WARNING,
                  title: "Warning!",
                  description: "Successfully created Questboard, but update the thumbnail is failed!"
                })
              }
            })
            .catch(err => {
              console.log(err)
              if(err?.response?.data?.message) openModal({
                type: AlertModalType.ERROR,
                title: "Oops!",
                description: err.response.data.message
              })
            })
            .finally(()=>setLocalState({isLoading: false}))
        }
      }
    },
    validationSchema: yup.object().shape({
      title: yup.string().required("Title must be fill!"),
      missions: yup.array().required("Missions must be fill!").min(1, "Mission at least one item!"),
      reward_serve_type: yup.string(),
      extra_max_joiner: yup.number().when('reward_serve_type', {
        is: (rst: string) => !!rst,
        then: (schema) => schema.required('Max Joiner must be filled!'),
        otherwise: (schema) => schema.notRequired()
      })
    })
  })

  const templateFormik = useFormik<Partial<ITemplatePlatform>>({
    initialValues: {},
    onSubmit: (vals, fHelper) => {
      const { title, description, rewardType, rewardValue, type, ...anotherVals  } = vals
      const missions = formik.values.missions ?? []
      const getTitle = (() => {
        if(title) return title
        else {
          const getAllTemplates = listContentTemplate.map(lct => lct.templates).flat()
          const finder = getAllTemplates.find(gat => gat.type === type)

          return finder?.label?.toString() ?? "Complete Your Mission"
        }
      })()

      if(clientProjectId && type) missions.push({
        clientProjectId,
        title: getTitle,
        description: description,
        point_reward: rewardType === StageRewardTypeEnum.XP ? rewardValue : 0,
        usdt_reward: rewardType === StageRewardTypeEnum.USDT ? rewardValue : 0,
        is_deleted: false,
        data: {
          rewardType,
          ...anotherVals
        },
        type, 
      })

      openModal({
        type: AlertModalType.SUCCESS,
        title: "Successfully!",
        description: "Successfully created mission!"
      })

      formik.setFieldValue("missions", missions)

      fHelper.resetForm()
    },
    validationSchema: yup.object().shape({
      rewardType: yup.string().required("Reward type must be fill!"),
      rewardValue: yup.number().required("Reward Value must be fill!")
    })
  })

  useDebounce<[string, string | null, string | null]>((t, cpId, qBId)=>{
    if(t && cpId) {
      getClientDetail({clientProjectId: cpId}, {Authorization: "Bearer " + t})
        .then(res => setLocalState({clientProject: res.data.data}))
        .catch(err => console.log(err))

      if(qBId) {
        getDetailQuestboard({questBoardId: qBId}, {Authorization: "Bearer " + t})
          .then(res => {
            formik.setValues({
              ...res.data.data,
              missions: res.data.data.missions.map(mission => ({
                ...mission,
                title: mission?.data?.label ?? mission.type
              })),
              questBoardId: qBId,
              redemptionTime: (res.data.data.start_redemption_date && res.data.data.end_redemption_date) ? [new Date(res.data.data.start_redemption_date), new Date(res.data.data.end_redemption_date)] : null,
              distributionTime: res.data.data.distribute_reward_date ? new Date(res.data.data.distribute_reward_date) : null,
              isNoEndTime: !res.data.data.end_redemption_date,
              clientProjectId: cpId,
              questboardThumbnail: res.data.data.questboard_thumbnail ? {files: [res.data.data.questboard_thumbnail], rawFiles: []} : undefined
            })
          })
          .catch(err => console.log(err))
      }

        checkIsAlreadyConnect({clientProjectId: cpId}, {Authorization: "Bearer " + t})
          .then(res => setLocalState({alreadyCreatedPlatform: res.data.data}))
          .catch(err => console.log(err))
    }
  }, [token, clientProjectId, questBoardId])

  const isCanAddedBool = (template: ListContentTemplateItem) => {
    const missions = formik.values.missions
    const selectedFinder = missions?.find(m => m.type === template.type)
    const isAlreadyCreated = localState.alreadyCreatedPlatform.find(cp => cp === template.type)

    if(template.isCreatedOnce && (selectedFinder || !!isAlreadyCreated)) return false
    else return true
  }

  const listContentTemplate: Array<ListContentTemplate> = [
    {
      platformName: "Project",
      platformIcon: <ThemeAvatar src="/hypequest.png" className="bg-black w-[26px] h-[26px] p-0.5" alt="Hypequest_Logo" size="sm" />,
      templates: [
        // {
        //   isCreatedOnce: true,
        //   label: "Referral Mission",
        //   type: MissionTypesEnum.REFERRAL,
        //   form: null
        // }
      ]
    },
    {
      platformName: "X",
      platformIcon: <XIcon />,
      templates: [
        // {
        //   isCreatedOnce: true,
        //   label: "Connect Twitter Account",
        //   type: MissionTypesEnum.CONNECT_TWITTER,
        //   form: (
        //     <ThemeInput 
        //       isDisabled={!!localState.alreadyCreatedPlatform.find(cp => cp === MissionTypesEnum.CONNECT_TWITTER)}
        //       label="Twitter Username"
        //       labelPlacement="outside"
        //       placeholder="Enter Twitter Username"
        //       formik={{
        //         config: templateFormik,
        //         name: "username"
        //       }}
        //     />
        //   )
        // },
        {
          label: "Tweet this template",
          type: MissionTypesEnum.QUOTE_POST_TWITTER,
          form: (
            <ThemeTextarea
              label="Template Text"
              labelPlacement="outside"
              placeholder="Enter Template"
              formik={{
                config: templateFormik,
                name: "text"
              }}
            />
          )
        },
        {
          label: 'Like a tweet',
          type: MissionTypesEnum.LIKE_TWEET_TWITTER,
          form: (
            <Fragment>
              <ThemeInput 
                label="Twitter Username"
                labelPlacement="outside"
                placeholder="Enter Twitter Username"
                formik={{
                  config: templateFormik,
                  name: "username"
                }}
              />
              <ThemeInput 
                label="ID Tweet"
                labelPlacement="outside"
                startContent="https://twitter.com/your_username/"
                placeholder="[id_tweet]"
                formik={{
                  config: templateFormik,
                  name: "id_tweet"
                }}
              />
            </Fragment>
          )
        },
        {
          label: 'Retweet a post',
          type: MissionTypesEnum.RETWEET_TWITTER,
          form: (
            <Fragment>
              <ThemeInput 
                label="Twitter Username"
                labelPlacement="outside"
                placeholder="Enter Twitter Username"
                formik={{
                  config: templateFormik,
                  name: "username"
                }}
              />
              <ThemeInput 
                label="ID Tweet"
                labelPlacement="outside"
                startContent="https://twitter.com/your_username/"
                placeholder="[id_tweet]"
                formik={{
                  config: templateFormik,
                  name: "id_tweet"
                }}
              />
            </Fragment>
          )
        },
        {
          label: 'Follow account on X',
          type: MissionTypesEnum.FOLLOW_TWITTER,
          form: (
            <ThemeInput 
              label="Twitter Username"
              labelPlacement="outside"
              placeholder="Enter Twitter Username"
              formik={{
                config: templateFormik,
                name: "username"
              }}
            />
          )
        },
      ]
    },
    {
      platformName: "Discord",
      platformIcon: <DiscordIcon2 />,
      templates: [
        // {
        //   isCreatedOnce: true,
        //   label: "Connect Discord Account",
        //   type: MissionTypesEnum.CONNECT_DISCORD,
        //   form: (
        //     <ThemeInput 
        //     isDisabled={!!localState.alreadyCreatedPlatform.find(cp => cp === MissionTypesEnum.CONNECT_DISCORD)}
        //       label="Server ID"
        //       labelPlacement="outside"
        //       placeholder="https://discord.com/channels/[server_id]"
        //       formik={{
        //         config: templateFormik,
        //         name: "server_id"
        //       }}
        //     />
        //   )
        // },
        {
          label: "Join Discord",
          type: MissionTypesEnum.JOIN_DISCORD,
          form: (
            <ThemeInput 
              label="Server ID"
              labelPlacement="outside"
              startContent="https://discord.com/channels/"
              placeholder="[server_id]"
              formik={{
                config: templateFormik,
                name: "server_id"
              }}
            />
          )
        },
      ]
    },
    {
      platformName: "Telegram",
      platformIcon: <TelegramIcon2 />,
      templates: [
        // {
        //   isCreatedOnce: true,
        //   label: "Connect Telegram Account",
        //   type: MissionTypesEnum.CONNECT_TELEGRAM,
        //   form: null
        // },
        {
          label: "Join Telegram Group",
          type: MissionTypesEnum.JOIN_GROUP_TELEGRAM,
          form: (
            <ThemeInput 
              label="Username Group"
              labelPlacement="outside"
              startContent="https://t.me/"
              placeholder="[username_group]"
              formik={{
                config: templateFormik,
                name: "username_group"
              }}
            />
          )
        },
        {
          label: "Join Telegram Channel",
          type: MissionTypesEnum.JOIN_CHANNEL_TELEGRAM,
          form: (
            <ThemeInput 
              label="Username Group"
              labelPlacement="outside"
              startContent="https://t.me/"
              placeholder="[username_group]"
              formik={{
                config: templateFormik,
                name: "username_group"
              }}
            />
          )
        },
      ]
    },
    {
      platformName: "Zealy",
      platformIcon: <ZealySmallIcon width="25" height="25" />,
      templates: [
        // {
        //   isCreatedOnce: true,
        //   label: "Connect Zealy Account",
        //   type: MissionTypesEnum.CONNECT_ZEALY,
        //   form: null
        // },
      ]
    },
    {
      platformName: "Youtube",
      platformIcon: <YoutubeIcon width="25" height="25" />,
      templates: [
        {
          label: "Watch Video Youtube",
          type: MissionTypesEnum.WATCH_VIDEO_YOUTUBE,
          form: (
            <ThemeInput 
              label="Youtube URL"
              labelPlacement="outside"
              placeholder="URL"
              formik={{
                config: templateFormik,
                name: "url"
              }}
            />
          )
        },
        {
          label: "Visit Channel Youtube",
          type: MissionTypesEnum.VISIT_CHANNEL_YOUTUBE,
          form: (
            <ThemeInput 
              label="Youtube URL"
              labelPlacement="outside"
              placeholder="URL"
              formik={{
                config: templateFormik,
                name: "url"
              }}
            />
          )
        },
      ]
    },
  ]

  useEffect(()=>{
    formContext.dispatch({title: "Campaign Creation"})

    if(!clientProjectId) {
      openModal({
        type: AlertModalType.WARNING,
        title: "Opps!",
        description: "You're not authorized to access this page!"
      })
      router.push(createProfilePath)
    }
  }, [])

  const onClickTab = (type: TabEnum) => {
    setLocalState({
      activeTab: type
    })
  }

  const getImgByRewardType = (values: DropzoneReturnValues) => {
    if(values.files[0]?.toString()) return values.files[0].toString()
    else {
      if(formik.values.extra_reward_type === StageRewardTypeEnum.USDT) return "/usdt.svg"
      else if(formik.values.extra_reward_type === StageRewardTypeEnum.XP) return "/xp.png"
      else return undefined
    }
  }

  const getBgColor = () => {
    if(formik.values.background_color) return formik.values.background_color
    else {
      if(formik.values.extra_reward_type === StageRewardTypeEnum.USDT) return "green"
      else return "purple"
    }
  }

  const getLabelOfMission = (template: ListContentTemplateItem) => {
    if(template.isCreatedOnce || template.isSocialRaidSetting) {
      const isCreated = !!localState.alreadyCreatedPlatform.find(cp => cp === template.type)

      return (
        <div className="flex flex-row items-center justify-between">
          {template.label}
          <div className="flex flex-row items-center gap-2">
            {template.isCreatedOnce && (
              <ThemeChip color={isCreated ? "success" : "primary"}>{isCreated ? 'Already created in diff. QuestBoard' : 'Only created once'}</ThemeChip>
            )}
            {template.isSocialRaidSetting && <ThemeChip color="warning">Social raid settings required</ThemeChip>}
          </div>
        </div>
      )
    }
    else return template.label
  }

  const addButtonRenderer = (template: ListContentTemplateItem) => {
    if(isCanAddedBool(template)) return (
      <ThemeButton 
        onClick={async ()=>{
          await templateFormik.setFieldValue("type", template.type)
          await submitFormikForm(templateFormik)
        }}
        radius="full"
        color="warning"
      >
        Add
      </ThemeButton>
    )
    else return null
  }

  const listContentRenderer = () => {
    const finder = listContentTemplate.find(lct => lct.platformName === formik.values.selectedQuestTypePlatform)

    return (finder?.templates ?? []).map((template, idx) =>
      <AccordionItem
        key={idx + 1}
        indicator={({ isOpen }) => (!isOpen ? <PlusIcon /> : <CloseIcon />)}
        classNames={{
          startContent: isLight ? "text-black" : "text-white"
        }}
        startContent={finder?.platformIcon}
        title={getLabelOfMission(template)}
        textValue={template.label?.toString()}
      >
        <div className="flex flex-col gap-2">
          <ThemeInput 
            isDisabled={!isCanAddedBool(template)}
            label="Mission Title (No Required)"
            labelPlacement="outside"
            placeholder="Enter Mission Title"
            formik={{
              config: templateFormik,
              name: "title"
            }}
          />
          <ThemeTextarea
            isDisabled={!isCanAddedBool(template)}
            label="Mission Description (No Required)"
            labelPlacement="outside"
            placeholder="Enter Mission Description"
            formik={{
              config: templateFormik,
              name: "description"
            }}
          />
          <ThemeSelect
            isDisabled={!isCanAddedBool(template)}
            label="Reward Type"
            labelPlacement="outside"
            placeholder="Enter Reward Type"
            formik={{
              config: templateFormik,
              name: "rewardType"
            }}
          >
            {Object.entries(StageRewardTypeEnum).map(([label,value]) =>
              <SelectItem key={value} value={value} textValue={value}>{label}</SelectItem>
            )}
          </ThemeSelect>
          <ThemeInput 
            isDisabled={!isCanAddedBool(template)}
            type="text"
            label="Reward Value"
            labelPlacement="outside"
            placeholder="Enter Reward Value"
            formik={{
              config: templateFormik,
              name: "rewardValue"
            }}
            endContent={templateFormik.values.rewardType ?
              <CustomMilestoneRewardIcon 
                imgId={`questboard_mission_reward_type_${templateFormik.values.rewardType}`}
                imgHref={templateFormik.values.rewardType === StageRewardTypeEnum.USDT ? "/usdt.png" : "/xp.png"}
                background={templateFormik.values.rewardType === StageRewardTypeEnum.USDT ? "green" : "purple"}
                width="25"
                height="25"
              />
              : undefined
            }
          />
          {template.form}
          {addButtonRenderer(template)}
        </div>
      </AccordionItem>
    )
  }

  return (
    <div className="flex flex-col w-full gap-5">
      <CustomNavigation
        dataNavigation={menuNavigationQuest}
        onClick={onClickTab}
        activeTab={localState.activeTab}
      />
      {
        localState.activeTab === 'setup' &&
        <div className="flex flex-col lg:flex-row gap-4">
          <ThemeDropzone 
            label="Thumbnail"
            supportedMimes={["image/png","image/jpg","image/jpeg", "image/svg", "image/svg+xml"]}
            maxByteSize={5e+6}
            formik={{
              config: formik,
              name: "questboardThumbnail"
            }}
          />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row w-full gap-4">
              <ThemeInput
                formik={{
                  config: formik,
                  name: "title"
                }}
                type="input"
                label="Campaign Name"
                labelPlacement="outside"
                variant='bordered'
                className='basis-1/2'
                radius="sm"
              />
              <div className="flex flex-col basis-1/2">
                <label className={`${isLight ? 'text-black' : 'text-white'} text-[0.875rem] pb-[0.375rem]`}>Campaign Schedule</label>
                <CustomCalendar
                  placeholder="Start date > End date"
                  formik={{
                    config: formik,
                    name: "redemptionTime"
                  }}
                />
                <ThemeSwitch
                  formik={{
                    config: formik,
                    name: "isNoEndTime"
                  }}
                  classNames={{
                    base: cn(
                      "justify-between cursor-pointer rounded-lg gap-2 border-2 border-transparent mt-2",
                      // "data-[selected=true]:border-primary",
                      "data-[selected=false]:border-[#232323]"
                    ),
                    wrapper: "p-0 h-4 overflow-visible bg-[#232323]",
                    thumb: cn("w-4 h-4 border-2 shadow-lg",
                      "group-data-[hover=true]:group-data-[selected=false]:group-data-[pressed=false]:!border-[#232323]",
                      "group-data-[hover=true]:border-primary",
                      //selected
                      "group-data-[selected=true]:ml-6",
                      // pressed
                      "group-data-[pressed=true]:w-6",
                      "group-data-[selected]:group-data-[pressed]:ml-6",
                    ),
                  }}
                  size="sm"
                  aria-label="Automatic updates"
                >
                  <span className={isLight ? 'text-black' : 'text-white'}>No end time</span>
                </ThemeSwitch>
              </div>
              {/* <ThemeInput
                type="input"
                label="Available time for redemption"
                placeholder="XP Boost"
                labelPlacement="outside"
                variant='bordered'
                className='basis-1/2'
                radius="sm"
              /> */}
            </div>
            <ThemeTextarea
              formik={{
                config: formik,
                name: "description"
              }}
              label="Campaign Description"
              labelPlacement="outside"
              placeholder="Enter your description"
              className="w-full"
              radius="sm"
            />
          </div>
        </div>
      }
      {
        localState.activeTab === 'quest-type' &&
        <>
          <div className={`w-full ${isLight ? 'text-black-900' : 'text-white'} ${dmSans900.className} text-2xl mt-5`}>
            Create a quest
          </div>
          <div className='mt-3 flex flex-row flex-nowrap overflow-x-auto gap-1 max-w-[980px]'>
            {listContentTemplate.map((x, index) => (
              <ThemeChip
                classNames={{
                  base: "px-2 py-5 cursor-pointer",
                  content: 'flex gap-2 justify-center items-center',
                }}
                key={index}
                color={x.platformName === formik.values.selectedQuestTypePlatform ? "warning" : "default"}
                onClick={()=>formik.setFieldValue("selectedQuestTypePlatform", x.platformName)}
              >
                {x.platformIcon}
                {x.platformName}
              </ThemeChip>
            ))}
          </div>
          <div className="flex w-full flex-wrap items-end md:flex-nowrap mt-6 mb-6 md:mb-0 gap-4">
            <ThemeAccordion 
              variant="splitted"
              onSelectionChange={()=>templateFormik.resetForm()}
            >
              {listContentRenderer()}
            </ThemeAccordion>
          </div>
          <div className={`w-full ${isLight ? 'text-black-900' : 'text-white'} ${dmSans900.className} text-2xl mt-5`}>
            Created Quests ({(formik.values.missions ?? []).length})
          </div>
          {formik.errors.missions && <div className="text-danger text-[0.75rem]">{formik.errors.missions}</div>}
          <div className="flex w-full flex-wrap items-end md:flex-nowrap mt-6 mb-6 md:mb-0 gap-4">
            <ThemeAccordion variant="splitted">
              {(formik.values.missions ?? []).map((mission, index) =>
                <AccordionItem
                  key={index}
                  indicator={({ isOpen }) => (!isOpen ? <PlusIcon /> : <CloseIcon />)}
                  startContent={(() => {
                    const finder = listContentTemplate.find(lct => lct.templates.find(t => t.type === mission.type))

                    return finder?.platformIcon
                  })()}
                  title={
                    <div className="flex flex-row justify-between items-center">
                      <span className="text-foreground text-large">{mission.title}</span>
                      <div className="py-[4px] px-[20px] bg-[#763AF5] rounded-[500px] flex flex-row items-center gap-2">
                        <CustomMilestoneRewardIcon 
                          imgId={(mission.title ?? "" + mission.type ?? "" + mission.data?.rewardType ?? "" + index).replace(/ /g, "_")}
                          width="29"
                          height="29"
                          imgHref={mission.data?.rewardType === StageRewardTypeEnum.USDT ? "/usdt.png" : "/xp.png"}
                          background={mission.data?.rewardType === StageRewardTypeEnum.USDT ? "green" : "purple"}
                        />
                        <div className="flex flex-row items-center gap-2 text-white">
                          <span className="text-[#FFD700]">+{mission.data?.rewardType === StageRewardTypeEnum.USDT ? mission.usdt_reward : mission.point_reward}</span>
                          {mission.data?.rewardType}
                        </div>
                      </div>
                    </div>
                  }
                  textValue={mission.title ?? "" + mission.type ?? "" + index}
                >
                  <div className="flex flex-col gap-4">
                    {getListDescription("Type", capitalizeEveryWord(mission.type?.toLowerCase()?.replace(/_/g, " ") ?? ""))}
                    {getListDescription("Description", mission.data?.description)}
                    {getListDescription("Template", mission.data?.text)}
                    <ThemeButton 
                      color="danger" 
                      onClick={()=>{
                        openModal({
                          type: AlertModalType.WARNING,
                          title: "Delete Confirmation",
                          description: "Are you sure want to delete this mission?",
                          okButtonProps: {
                            children: "Delete",
                            color: "danger"
                          },
                          isCancelButton: true,
                          onOk: () => {
                            const deletedMissions = (formik.values.deletedMissions ?? []).concat(mission)
                            const missions = (formik.values.missions ?? []).filter((_, idx) => index !== idx)
  
                            formik.setFieldValue("missions", missions)
                            formik.setFieldValue("deletedMissions", deletedMissions)
                          }
                        })
                      }}
                    >
                      Delete Mission
                    </ThemeButton>
                  </div>
                </AccordionItem>
              )}
            </ThemeAccordion>
          </div>
        </>
      }
      {
        localState.activeTab === 'reward' &&
        <div className="flex flex-row gap-5 mt-5">
          <div className="w-full flex flex-col gap-4">
            <ThemeInput
              formik={{
                config: formik,
                name: "reward_name"
              }}
              type="input"
              label="Reward Name"
              labelPlacement="outside"
              placeholder="Enter reward name"
              className="w-full"
              radius="sm"
            />
            <ThemeInput
              formik={{
                config: formik,
                name: "number_of_rewards"
              }}
              type="number"
              label="Number of Rewards"
              labelPlacement="outside"
              placeholder="Enter number of rewards"
              className="w-full"
              radius="sm"
            />
            <ThemeSelect 
              formik={{
                config: formik,
                name: "extra_reward_type"
              }}
              label="Extra Reward Type"
              labelPlacement="outside"
              placeholder="Extra Reward Type"
              className="w-full"
              radius="sm"
            >
              {Object.entries(StageRewardTypeEnum).map(([label, value]) =>
                <SelectItem key={value} textValue={value} aria-label={label}>{value}</SelectItem>
              )}
            </ThemeSelect>
            <ThemeInput 
              formik={{
                config: formik,
                name: "extra_reward_point"
              }}
              type="number"
              label="Extra Reward Point"
              labelPlacement="outside"
              placeholder="Extra Reward Point"
              className="w-full"
              radius="sm"
              endContent={formik.values.extra_reward_type ?
                <CustomMilestoneRewardIcon 
                  imgId={`extra_reward_type_${formik.values.extra_reward_type}`}
                  imgHref={formik.values.extra_reward_type === StageRewardTypeEnum.USDT ? "/usdt.png" : "/xp.png"}
                  background={formik.values.extra_reward_type === StageRewardTypeEnum.USDT ? "green" : "purple"}
                  width="25"
                  height="25"
                />
                : undefined
              }
            />
            <div className="flex flex-col w-full">
              <label className={`${isLight ? 'text-black' : 'text-white'} text-[0.875rem] pb-[0.375rem]`}>Date to Distribute Rewards</label>
              <CustomDatePicker
                placeholder="Select Date"
                formik={{
                  config: formik,
                  name: "distributionTime"
                }}
              />
            </div>
            <div className="flex flex-row w-full flex-nowrap gap-2">
              <ThemeButton 
                className="w-full"
                onClick={()=>formik.setFieldValue("reward_serve_type", formik.values.reward_serve_type === RewardServeEnum.RANDOW_DRAW_WINNER ? undefined : RewardServeEnum.RANDOW_DRAW_WINNER)}
                color={formik.values.reward_serve_type === RewardServeEnum.RANDOW_DRAW_WINNER ? "warning" : "default"}
              >
                Randow Draw Winner
              </ThemeButton>
              <ThemeButton 
                className="w-full"
                onClick={()=>formik.setFieldValue("reward_serve_type", formik.values.reward_serve_type === RewardServeEnum.FIRST_COME_FIRST_SERVE ? undefined : RewardServeEnum.FIRST_COME_FIRST_SERVE)}
                color={formik.values.reward_serve_type === RewardServeEnum.FIRST_COME_FIRST_SERVE ? "warning" : "default"}
              >
                First Come First Serve
              </ThemeButton>
            </div>
            {formik.values.reward_serve_type &&
              <ThemeInput 
                type="number"
                formik={{
                  config: formik,
                  name: "extra_max_joiner"
                }}
                label="Max Joiner"
                labelPlacement="outside"
                placeholder="Max Joiner"
              />
            }
          </div>
          {/* <div className="min-w-[300px]">
            <ThemeDropzone
              label="Milestone Reward Preview"
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
                <div className={`flex items-center justify-center ${isLight ? "bg-[#F1F1F1]" : "bg-[#111111]"} p-10 rounded-lg`} {...getRootProps()}>
                  <input {...getInputProps()} />
                  <div className={`transition-all w-[150px] h-[150px] bg-gradient-to-r from-purple-800 to-yellow-400 rounded-full flex items-center justify-center`}>
                    <div className="w-[148px] h-[148px] bg-[#3b0764] rounded-full flex items-center justify-center">
                      <div className="w-[140px] h-[140px] bg-gradient-to-r from-purple-800 to-yellow-400 rounded-full flex items-center justify-center">
                        <div className="w-[135px] h-[135px] bg-[#3b0764] rounded-full flex flex-col items-center justify-center gap-6 p-2">
                          <span className={`${manrope800.className} text-[#FFC627] text-2xl`}>800K</span>
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
            <div className="flex w-full flex-wrap items-end md:flex-nowrap my-6">
              <ThemeTextarea
                // formik={{
                //   config: formik,
                //   name: "rewardDescription"
                // }}
                label="Description(optional)"
                placeholder="Enter the template"
                labelPlacement="outside"
                variant='bordered'
                radius="sm"
              />
            </div>
          </div> */}
        </div>
      }
      {localState.activeTab.toLowerCase() !== TabEnum.REWARD.toLowerCase() ?
        <div className="flex flex-row items-center gap-2 mt-4">
          {localState.activeTab !== TabEnum.SETUP &&
            <ThemeButton 
              radius="full" 
              size="sm"
              onClick={()=>{
                if(localState.activeTab === TabEnum.QUEST_TYPE) setLocalState({activeTab: TabEnum.SETUP})
                else if(localState.activeTab === TabEnum.REWARD) setLocalState({activeTab: TabEnum.QUEST_TYPE})
                else setLocalState({activeTab: TabEnum.REWARD})
              }}
            >
              Back
            </ThemeButton>
          }
          <ThemeButton 
            radius="full" 
            size="sm" 
            color="warning"
            onClick={()=>{
              if(localState.activeTab === TabEnum.SETUP) setLocalState({activeTab: TabEnum.QUEST_TYPE})
              else if(localState.activeTab === TabEnum.QUEST_TYPE) setLocalState({activeTab: TabEnum.REWARD})
              else setLocalState({activeTab: TabEnum.SETUP})
            }}
          >
            Next
          </ThemeButton>
        </div>
        :
        <ThemeButton 
          className="mt-4 w-fit" 
          radius="full" 
          color="warning" 
          onClick={() => submitFormikForm(formik)}
          isLoading={localState.isLoading}
          isDisabled={localState.isLoading}
        >
          {params.get("questBoardId") ? "Update Quest" : "Create Quest"}
        </ThemeButton>
      }
    </div>
  )
}

export default CreateQuestCreation