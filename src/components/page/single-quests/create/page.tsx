"use client"
import { CloseIcon, DiscordIcon2, PlusIcon, TelegramIcon2, XIcon, ZealySmallIcon } from "@/components/assets/icons";
import YoutubeIcon from "@/components/assets/icons/YoutubeIcon";
import { CustomMilestoneRewardIcon, InnerWrapper, OuterWrapper } from "@/components/reusables";
import { ThemeAccordion, ThemeAvatar, ThemeButton, ThemeChip, ThemeDropzone, ThemeInput, ThemeSelect, ThemeTextarea } from "@/components/reusables/NextuiTheme";
import { addSearchParams, capitalizeFirstLetter, redirectToNewPage, submitFormikForm, useDebounce, useMinimizedState } from "@/helper";
import { singleQuestsPath } from "@/helper/route-path";
import { AlertModalType, useModal } from "@/providers/modal";
import { useGlobalContext } from "@/providers/stores";
import useQuestService from "@/services/quest-service";
import useSocmedAdminAuthService from "@/services/socmed-admin-auth-service";
import useSocmedAuthService from "@/services/socmed-auth-service";
import { IGetDiscordRolesResponse, ITemplatePlatform, ListContentTemplate, ListContentTemplateItem, MissionTypesEnum, StageRewardTypeEnum } from "@/types/service-types";
import { AccordionItem, SelectItem } from "@nextui-org/react";
import { useFormik } from "formik";
import { NextPage } from "next";
import { DM_Sans } from "@next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo } from "react";
import * as yup from "yup";

const dmSans900 = DM_Sans({weight: "900", subsets: ["latin"]})

interface InitialState {
  alreadyCreatedPlatform: Array<MissionTypesEnum>;
  selectedQuestTypePlatform?: string;
  href: string;
  roles: Array<IGetDiscordRolesResponse>;
}

const CreateSingleQuestPage: NextPage = () => {
  const { telegramAuth: telegramAdminAuth, discordBotAuth } = useSocmedAdminAuthService()
  const openModal = useModal()
  const router = useRouter()
  const params = useSearchParams()
  const { state: { token, isLight } } = useGlobalContext()
  const clientProjectId = params.get("clientProjectId")
  const missionId = params.get("missionId")
  const auth_type = params.get("auth_type")

  const { checkIsAlreadyConnect, createMission, updateMission, getSingleMissionDetail, getDiscordRoles } = useQuestService()

  const [state, dispatch] = useMinimizedState<InitialState>({
    alreadyCreatedPlatform: [],
    href: "",
    roles: []
  })

  useEffect(()=>{
    dispatch({href: window.location.href})
  }, [])

  useEffect(()=>{
    if(auth_type) dispatch({selectedQuestTypePlatform: capitalizeFirstLetter(auth_type)})
  }, [auth_type])

  const templateFormik = useFormik<Partial<ITemplatePlatform>>({
    initialValues: {},
    onSubmit: (vals, fHelper) => {
      const { title, description, rewardType, rewardValue, type, ...anotherVals  } = vals
      const getTitle = (() => {
        if(title) return title
        else {
          const getAllTemplates = listContentTemplate.map(lct => lct.templates).flat()
          const finder = getAllTemplates.find(gat => gat.type === type)

          return finder?.label?.toString() ?? "Complete Your Mission"
        }
      })()

      if(clientProjectId && type) {
        if(missionId) updateMission({
          missionId,
          clientProjectId,
          label: getTitle,
          description: description,
          point_reward: rewardType === StageRewardTypeEnum.XP ? (rewardValue ?? 0) : 0,
          usdt_reward: rewardType === StageRewardTypeEnum.USDT ? (rewardValue ?? 0) : 0,
          is_deleted: false,
          object: {
            rewardType,
            ...anotherVals
          },
          type,
        })
          .then(() => {
            openModal({
              type: AlertModalType.SUCCESS,
              title: "Success",
              description: "Successfully updated mission!"
            })

            router.push(addSearchParams(singleQuestsPath, {clientProjectId}))
          })
        else createMission({
          clientProjectId,
          label: getTitle,
          description: description,
          point_reward: rewardType === StageRewardTypeEnum.XP ? (rewardValue ?? 0) : 0,
          usdt_reward: rewardType === StageRewardTypeEnum.USDT ? (rewardValue ?? 0) : 0,
          is_deleted: false,
          object: {
            rewardType,
            ...anotherVals
          },
          type, 
        })
          .then(() => {
            openModal({
              type: AlertModalType.SUCCESS,
              title: "Success",
              description: "Successfully created mission!"
            })

            router.push(addSearchParams(singleQuestsPath, {clientProjectId}))
          })
      }
      else openModal({
        type: AlertModalType.WARNING,
        title: "Warning",
        description: "Please fill the forms correctly!"
      })
    },
    validationSchema: yup.object().shape({
      rewardType: yup.string().required("Reward type must be fill!"),
      rewardValue: yup.number().required("Reward Value must be fill!")
    })
  })

  const server_id = params.get("server_id") ?? templateFormik.values.server_id

  useDebounce<[string | undefined | null, string]>((si, t)=>{
    if(si && t) {
      getDiscordRoles({server_id: si}, {Authorization: "Bearer " + t})
        .then(res => dispatch({roles: res.data.data}))
        .catch(err => console.log(err))
    }
  }, [server_id, token], 400)

  useDebounce<[string, string | null, string | null]>((t, cpId, mId)=>{
    if(t && cpId) {
      checkIsAlreadyConnect({clientProjectId: cpId}, {Authorization: "Bearer " + t})
        .then(res => dispatch({alreadyCreatedPlatform: res.data.data}))
        .catch(err => console.log(err))

      if(mId) getSingleMissionDetail({clientProjectId: cpId, missionId: mId}, {Authorization: "Bearer " + t})
        .then(res => {
          templateFormik.setFieldValue("title", res.data.data.data?.label)
          templateFormik.setFieldValue("description", res.data.data.data?.description)
          templateFormik.setFieldValue("type", res.data.data.type)
          if(res.data.data.data?.thumbnail) templateFormik.setFieldValue("thumbnail", {
            files: [res.data.data.data.thumbnail],
            rawFiles: []
          })
          templateFormik.setFieldValue("rewardType", res.data.data.data?.rewardType)
          templateFormik.setFieldValue("rewardValue", res.data.data.data?.rewardType === StageRewardTypeEnum.USDT ? res.data.data.usdt_reward : res.data.data.point_reward)
          templateFormik.setFieldValue("text", res.data.data.data?.text)
          templateFormik.setFieldValue("username_group", res.data.data.data?.username_group)
          templateFormik.setFieldValue("username", res.data.data.data?.username)
          templateFormik.setFieldValue("id_tweet", res.data.data.data?.id_tweet)
          templateFormik.setFieldValue("server_id", res.data.data.data?.server_id)
          templateFormik.setFieldValue("role", res.data.data.data?.role)

          const platformType = listContentTemplate.find(lct => lct.templates.find(t => t.type === res.data.data.type))
          if(platformType?.platformName) dispatch({
            selectedQuestTypePlatform: platformType?.platformName
          })
        })
        .catch(err => console.log(err))
    }
  }, [token, clientProjectId, missionId])

  const listContentTemplate: Array<ListContentTemplate> = [
    {
      platformName: "Project",
      platformIcon: <ThemeAvatar src="/hypequest.png" className="bg-black w-[26px] h-[26px] p-0.5" alt="Hypequest_Logo" size="sm" />,
      templates: [
        {
          isCreatedOnce: true,
          label: "Referral Mission",
          type: MissionTypesEnum.REFERRAL,
          form: null
        },
        {
          isCreatedOnce: true,
          label: "Connect Wallet",
          type: MissionTypesEnum.CONNECT_WALLET,
          form: null
        },
        {
          isCreatedOnce: true,
          label: "Daily Checkin",
          type: MissionTypesEnum.DAILY_CHECKIN,
          form: null
        },
      ]
    },
    {
      platformName: "X",
      platformIcon: <XIcon />,
      templates: [
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
          label: 'Retweet a tweet',
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
          label: 'Comment on a tweet ',
          type: MissionTypesEnum.RETWEET_TWITTER,
          form: (
            <Fragment>
              <ThemeInput 
                label="Post URL"
                labelPlacement="outside"
                placeholder="Enter Post URL"
                formik={{
                  config: templateFormik,
                  name: "username"
                }}
              />
              <ThemeInput 
                label="Required Hastag / Keyword (if any)"
                labelPlacement="outside"
                placeholder="Enter Required Hastag / Keyword (if any)"
                formik={{
                  config: templateFormik,
                  name: "username"
                }}
              />
            </Fragment>
          )
        },
        {
          isCreatedOnce: true,
          label: "Connect X Account",
          type: MissionTypesEnum.CONNECT_TWITTER,
          form: (
            <ThemeInput 
              isDisabled={!!state.alreadyCreatedPlatform.find(cp => cp === MissionTypesEnum.CONNECT_TWITTER)}
              label="X Username"
              labelPlacement="outside"
              placeholder="Enter X Username"
              formik={{
                config: templateFormik,
                name: "username"
              }}
            />
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
        {
          label: "Quote Retweet a tweet",
          type: MissionTypesEnum.QUOTE_POST_TWITTER,
          form: (
            <>
              <ThemeInput 
                label="Post URL"
                labelPlacement="outside"
                placeholder="Enter Post URL"
                formik={{
                  config: templateFormik,
                  name: "username"
                }}
              />
              <ThemeTextarea
                label="Template Text"
                labelPlacement="outside"
                placeholder="Enter template of quote retweet context (if any)"
                formik={{
                  config: templateFormik,
                  name: "text"
                }}
              />
            </>
          )
        },
      ]
    },
    {
      platformName: "Discord",
      platformIcon: <DiscordIcon2 />,
      templates: [
        {
          isCreatedOnce: true,
          label: "Join a Discord Server",
          type: MissionTypesEnum.CONNECT_DISCORD,
          form: server_id && auth_type === "discord" ?
            <ThemeInput
              label="Discord Server URL"
              labelPlacement="outside"
              startContent="https://discord.com/channels/"
              placeholder="[server_id]"
              value={server_id ?? ""}
              isDisabled={!!server_id}
            />
            :
            <div className="flex flex-col ">
              <label className="text-small">Add QuestN support bot as an admin to your Discord server (How to invite?)</label>
              {clientProjectId &&
                <ThemeButton
                  radius="lg"
                  color="default"
                  className="w-32 mt-2"
                  startContent={<><DiscordIcon2 fillCircle="#5865F2" /> Invite Bot</>}
                  onClick={()=>discordBotAuth({
                    authorization: "Bearer " + token,
                    redirect_url: state.href,
                    client_project_id: clientProjectId
                  })}
                />
              }
            </div>
        },
        {
          label: "Verify Role in Discord Server",
          type: MissionTypesEnum.JOIN_DISCORD,
          form: (
            <>
              {server_id ?
                <ThemeInput
                  label="Discord Server URL"
                  labelPlacement="outside"
                  startContent="https://discord.com/channels/"
                  placeholder="[server_id]"
                  value={server_id ?? ""}
                  isDisabled={!!server_id}
                />
                :
                <div className="flex flex-col ">
                  <label className="text-small">Add QuestN support bot as an admin to your Discord server (How to invite?)</label>
                  {clientProjectId &&
                    <ThemeButton
                      radius="lg"
                      color="default"
                      className="w-32 mt-2"
                      startContent={<><DiscordIcon2 fillCircle="#5865F2" /> Invite Bot</>}
                      onClick={()=>discordBotAuth({
                        authorization: "Bearer " + token,
                        redirect_url: state.href,
                        client_project_id: clientProjectId
                      })}
                    />
                  }
                </div>
              }
              <ThemeSelect
                label="Role Name"
                labelPlacement="outside"
                placeholder="Choose a role"
                formik={{
                  config: templateFormik,
                  name: "role"
                }}
              >
                {state.roles.map((role) =>
                  <SelectItem key={role.id} value={role.id} textValue={role.name}>{role.name}</SelectItem>
                )}
              </ThemeSelect>
            </>
          )
        },
      ]
    },
    {
      platformName: "Telegram",
      platformIcon: <TelegramIcon2 />,
      templates: [
        {
          label: "Connect Telegram",
          type: MissionTypesEnum.CONNECT_TELEGRAM,
          isCreatedOnce: true,
        },
        {
          label: "Join Telegram group or channel",
          type: MissionTypesEnum.JOIN_GROUP_TELEGRAM,
          form: (
            <>
              <div className="flex flex-col ">
                <label className="text-small">Add QuestN support bot as an admin to your group or channel (How to invite?)</label>
                <ThemeButton
                  radius="lg"
                  color="default"
                  className="w-32 mt-2"
                  startContent={<><TelegramIcon2 fillCircle="#0088CC" /> Invite Bot</>}
                  onClick={()=>redirectToNewPage(telegramAdminAuth(), true)}
                />
              </div>
              <ThemeInput 
                label="Public group or channel link"
                labelPlacement="outside"
                startContent="https://t.me/"
                placeholder="[username_group]"
                formik={{
                  config: templateFormik,
                  name: "username_group"
                }}
              />
            </>
          )
        },
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
              placeholder="Enter a video URL"
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
              placeholder="Enter a channel URL"
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

  const getLabelOfMission = (template: ListContentTemplateItem) => {
    if(template.isCreatedOnce || template.isSocialRaidSetting) {
      const isCreated = !!state.alreadyCreatedPlatform.find(cp => cp === template.type)

      return (
        <div className="flex flex-row items-center justify-between">
          {template.label}
          <div className="flex flex-row items-center gap-2">
            {template.isCreatedOnce && (
              <ThemeChip color={isCreated ? "success" : "primary"}>{isCreated ? 'Already created in diff. Mission' : 'Only created once'}</ThemeChip>
            )}
            {template.isSocialRaidSetting && <ThemeChip color="warning">Social raid settings required</ThemeChip>}
          </div>
        </div>
      )
    }
    else return template.label
  }

  const getListContentTemplate = useMemo(()=>{
    if(missionId) {
      const platformType = listContentTemplate.find(lct => lct.templates.find(t => t.type === templateFormik.values.type))
      if(platformType) {
        const selectedTemplate = platformType.templates.find(t => t.type === templateFormik.values.type)
        if(selectedTemplate) return [{
          ...platformType,
          templates: [selectedTemplate]
        }]
        else return listContentTemplate
      }
      else return listContentTemplate
    }
    else return listContentTemplate
  }, [missionId, templateFormik.values.type, templateFormik])

  const isDisableSingleMission = (template: ListContentTemplateItem) => {
    const isCreated = !!state.alreadyCreatedPlatform.find(cp => cp === template.type)

    if(isCreated) return true
    else return !token || !params.get('clientProjectId')
  }

  const listContentRenderer = () => {
    const finder = getListContentTemplate.find(lct => lct.platformName === state.selectedQuestTypePlatform)

    return (finder?.templates ?? []).map((template, idx) =>
      <AccordionItem
        key={idx + 1}
        indicator={({ isOpen }) => (!isOpen ? <PlusIcon /> : <CloseIcon />)}
        startContent={finder?.platformIcon}
        title={getLabelOfMission(template)}
        textValue={template.label?.toString()}
      >
        <div className="flex flex-col gap-4">
          {template.form}
          <ThemeSelect
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
                imgId={`single_mission_reward_type_${templateFormik.values.rewardType}`}
                imgHref={templateFormik.values.rewardType === StageRewardTypeEnum.USDT ? "/usdt.png" : "/xp.png"}
                background={templateFormik.values.rewardType === StageRewardTypeEnum.USDT ? "green" : "purple"}
                width="25"
                height="25"
              />
              : undefined
            }
          />
          <ThemeButton 
            onClick={async ()=>{
              await templateFormik.setFieldValue("type", template.type)
              if(server_id) await templateFormik.setFieldValue("server_id", server_id)
              await submitFormikForm(templateFormik)
            }}
            radius="full"
            color="warning"
            isDisabled={isDisableSingleMission(template)}
          >
            {missionId ? "Update" : "Create"}
          </ThemeButton>
        </div>
      </AccordionItem>
    )
  }

  return (
    <OuterWrapper className={`${isLight ? "text-black" : "text-white"}`}>
      <InnerWrapper className={`flex flex-col gap-8 mt-8`}>
        <h1 className={`${dmSans900.className} text-4xl lg:text-4xl`}>{missionId ? "Update" : "Create"} a Single Quest</h1>
        {!missionId &&
          <div className="flex flex-col">
            <div className={`${dmSans900.className} text-2xl`}>Choose a Template</div>
            <div className='mt-3 flex flex-row flex-nowrap overflow-x-auto gap-1 max-w-[980px]'>
              {getListContentTemplate.map((x, index) => (
                <ThemeChip
                  classNames={{
                    base: "px-2 py-5 cursor-pointer",
                    content: 'flex gap-2 justify-center items-center',
                  }}
                  key={index}
                  color={x.platformName === state.selectedQuestTypePlatform ? "warning" : "default"}
                  onClick={()=>dispatch({selectedQuestTypePlatform: x.platformName})}
                >
                  {x.platformIcon}
                  {x.platformName}
                </ThemeChip>
              ))}
            </div>
          </div>
        }
        <ThemeAccordion 
          variant="splitted"
          onSelectionChange={()=>!missionId && templateFormik.resetForm()}
        >
          {listContentRenderer()}
        </ThemeAccordion>
      </InnerWrapper>
    </OuterWrapper>
  )
}

export default CreateSingleQuestPage