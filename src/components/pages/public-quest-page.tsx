"use client"
import { NewPostIcon, RightArrow, SearchIcon, TopQuestIcon, TrendingIcon } from "@/components/assets/icons";
import { CustomMilestoneRewardIcon, InnerWrapper, OuterWrapper } from "@/components/reusables";
import { ThemeAvatar, ThemeBadge, ThemeButton, ThemeCard, ThemeCardBody, ThemeChip, ThemeImage, ThemeInput, ThemeSelect } from "@/components/reusables/NextuiTheme";
import { useGlobalContext } from "@/providers/stores";
import { ILastMissionResponse, LastMissionEnum } from "@/types/service-types";
import { AvatarGroup, SelectItem } from "@nextui-org/react";
import { useFormik } from "formik";
import { NextPage } from "next";
import { Manrope } from "next/font/google";
import CheckIcon from "@/components/assets/images/check.png"
import NextImage from "next/image"
import XP1 from "@/components/assets/images/quests/xp/xp_1.png"
import XP2 from "@/components/assets/images/quests/xp/xp_2.png"
import XP3 from "@/components/assets/images/quests/xp/xp_3.png"
import USDT1 from "@/components/assets/images/quests/usdt/usdt_1.png"
import USDT2 from "@/components/assets/images/quests/usdt/usdt_2.png"
import USDT3 from "@/components/assets/images/quests/usdt/usdt_3.png"
import USDT4 from "@/components/assets/images/quests/usdt/usdt_4.png"
import { getRandomInt, numFormatter, useDebounce, useMinimizedState } from "@/helper";
import usePublicClientService from "@/services/public-client-service";
import { FC } from "react";

interface IFilterForm {
  type: LastMissionEnum;
  search: string;
  is_available: string;
}

interface InitialState {
  lastMission?: ILastMissionResponse;
}

const manrope400 = Manrope({weight: "400", subsets: ["latin"]})
const manrope800 = Manrope({weight: "800", subsets: ["latin"]})

interface GlobalQuestsProps {
  project: string;
}

const GlobalQuestsPage: FC<GlobalQuestsProps> = (props) => {
  const [state, dispatch] = useMinimizedState<InitialState>({

  })

  const { getLastMission, getQuesterAvatars } = usePublicClientService()

  const { state: { isLight } } = useGlobalContext()

  const formik = useFormik<Partial<IFilterForm>>({
    initialValues: {
      type: LastMissionEnum.TRENDING,
      search: "",
      is_available: "true"
    },
    onSubmit: () => {}
  })

  useDebounce<[string | undefined, string | undefined, LastMissionEnum | undefined]>((is_available, search, type)=>{
    if(type) getLastMission(props.project, {
      search: search ?? "",
      type,
      is_available: is_available === "true"
    })
      .then(async (res) => {
        dispatch({
          lastMission: res.data.data ? {
            ...res.data.data,
            data_usdt: Array.isArray(res.data.data.data_usdt) ? await Promise.all(res.data.data.data_usdt.map(async (d) => {
              const questerAvatars = await getQuesterAvatars(props.project, {
                missionId: d.id,
                limit: 3,
                page: 1
              })
              return {
                ...d,
                questers: questerAvatars.data.data.data,
                total_quester: (d.total_quester ?? 0) - 3
              }
            })) : [],
            data_xp: Array.isArray(res.data.data.data_xp) ? await Promise.all(res.data.data.data_xp.map(async (d) => {
              const questerAvatars = await getQuesterAvatars(props.project, {
                missionId: d.id,
                limit: 3,
                page: 1
              })
              return {
                ...d,
                questers: questerAvatars.data.data.data,
                total_quester: (d.total_quester ?? 0) - 3
              }
            })) : [],
          } : undefined
        })
      })
      .catch(err => console.log(err))
  }, [formik.values.is_available, formik.values.search, formik.values.type], 400)

  const filterButtons = [
    {
      label: "Trending",
      type: LastMissionEnum.TRENDING,
      icon: <TrendingIcon />
    },
    {
      label: "Top Quests",
      type: LastMissionEnum.TOP_QUEST,
      icon: <TopQuestIcon />
    },
    {
      label: "New Posts",
      type: LastMissionEnum.NEW_POST,
      icon: <NewPostIcon />
    }
  ]
  const itemContent = [
    {
      title: "XP Quests",
      type: "XP",
      content: state.lastMission?.data_xp
    },
    {
      title: "USDT Rewards",
      type: "USDT",
      content: state.lastMission?.data_usdt
    },
  ]

  const getThumbnail = (type: string, thumbnail?: string) => {
    const xps = [XP1, XP2, XP3]
    const usdts = [USDT1, USDT2, USDT3, USDT4]
    
    if(thumbnail) return thumbnail
    else {
      if(type === "XP") return xps[getRandomInt(0, xps.length - 1)]
      else return usdts[getRandomInt(0, usdts.length - 1)]
    }
  }

  return (
    <OuterWrapper>
      <InnerWrapper className={`my-6 flex flex-col gap-10 ${isLight ? "text-black" : "text-white"}`}>
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex flex-row items-center gap-2">
            {filterButtons.map((fb, index) =>
              <ThemeButton
                key={index}
                startContent={fb.icon}
                color={formik.values.type === fb.type ? "warning" : "default"}
                onClick={()=>formik.setFieldValue("type", fb.type)}
                radius="full"
              >
                {fb.label}
              </ThemeButton>
            )}
            <ThemeInput 
              className="max-w-[250px]"
              placeholder="Search Here"
              size="sm"
              startContent={<SearchIcon />}
              isClearable
              formik={{
                config: formik,
                name: "search"
              }}
            />
          </div>
          <ThemeSelect
            formik={{
              config: formik,
              name: "is_available"
            }}
            className="max-w-[150px]"
            size="sm"
          >
            <SelectItem key="false" value="false" textValue="Claimed">
              Claimed
            </SelectItem>
            <SelectItem key="true" value="true" textValue="Available">
              Available
            </SelectItem>
          </ThemeSelect>
        </div>
        {itemContent.map((ic, index) => 
          <div key={index} className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between gap-2">
              <h1 className={`${manrope800.className} text-3xl`}>{ic.title}</h1>
              <ThemeButton
                endContent={<RightArrow />}
                radius="full"
                variant="light"
              >
                View All
              </ThemeButton>
            </div>
            {(ic.content ?? []).length > 0 ?
              <div className="grid grid-cols-questItem gap-2">
                {ic.content?.map((c, i) =>
                  <ThemeButton
                    key={i}
                    className="flex flex-col items-start gap-4 py-4 h-full bg-[#1E1E1E]"
                  >
                    <div className="flex flex-row items-center gap-4">
                      <ThemeBadge 
                        content={
                          <NextImage 
                            src={CheckIcon}
                            alt="check-icon"
                            width={23}
                            height={23}
                            className="rounded-full"
                          />
                        }
                        className="rounded-full p-0 m-0"
                        color="warning" 
                        placement="bottom-right"
                      >
                        <ThemeAvatar
                          isBordered
                          className="w-[40px] h-[40px]"
                          radius="full"
                          src={c.logo ?? "/placeholder.png"}
                        />
                      </ThemeBadge>
                      <h2 className={`${manrope800.className} text-2xl`}>{c.name}</h2>
                    </div>
                    <NextImage 
                      src={getThumbnail(ic.type, c.thumbnail)}
                      alt={c.name}
                      className="w-full rounded-lg"
                    />
                    <div className="flex flex-row items-center gap-4">
                      <AvatarGroup 
                        isBordered
                        size="sm"
                      >
                        {c.questers?.map((quester, index) =>
                          <ThemeAvatar src={quester} key={index} />
                        )}
                      </AvatarGroup>
                      <h3>{c.total_quester >= 0 ? `+${c.total_quester}` : c.total_quester}</h3>
                    </div>
                    <div className="text-start flex flex-col gap-4">
                      <h2 className={`${manrope800.className} text-2xl w-full`}>{c.title ?? "-"}</h2>
                      <h3 className={`${manrope400.className} w-full`}>{c.description ?? "-"}</h3>
                    </div>
                    <ThemeChip
                      startContent={
                        <CustomMilestoneRewardIcon 
                          imgHref={ic.type === "XP" ? "/xp.png" : "/usdt.png"}
                          imgId={ic.type === "XP" ? "img-xp-quest" : "img-usdt-quest"}
                          background={ic.type === "XP" ? "purple" : "green"}
                          width="28"
                          height="28"
                        />
                      }
                      className={`p-5 ${ic.type === "XP" ? "bg-purple-900" : "bg-green-900"}`}
                    >
                      <div className={`flex flex-row items-center gap-1 ${manrope800.className} text-[16px]`}>
                        <span className="text-[#FFD700]">+{numFormatter((ic.type === "XP" ? c.point_reward : c.usdt_reward) ?? 0)}</span>
                        <span>{ic.type}</span>
                      </div>
                    </ThemeChip>
                  </ThemeButton>
                )}
              </div>
              :
              <div className="text-center w-full py-[200px] border rounded-xl border-dashed">No items to display.</div>
            }
          </div>
        )}
      </InnerWrapper>
    </OuterWrapper>
  )
}

export default GlobalQuestsPage