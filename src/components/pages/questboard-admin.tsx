"use client"
import { InnerWrapper, OuterWrapper } from "@/components/reusables";
import { ThemeButton, ThemeChip, ThemePagination, ThemeTable } from "@/components/reusables/NextuiTheme";
import { addSearchParams, capitalizeFirstLetter, useDebounce, useMinimizedState } from "@/helper";
import { useGlobalContext } from "@/providers/stores";
import usePublicClientService from "@/services/public-client-service";
import useQuestService from "@/services/quest-service";
import { IClient, IQuestboard, QuestboardTypeEnum } from "@/types/service-types";
import { TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { DateTime } from "luxon";
import { NextPage } from "next";
import { Manrope } from "next/font/google";
import { FC, useEffect } from "react";
import NextLink from "next/link"
import { questCreationPath } from "@/helper/route-path";
import { useRouter } from "next/navigation";
import { PencilIcon } from "@/components/assets/icons";

const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope400 = Manrope({weight: "400", subsets: ["latin"]})

interface InitialState {
  origin: string;
  data: Array<IQuestboard>;
  page: number;
  total_data: number;
  type?: QuestboardTypeEnum;
  clientProject?: IClient;
}

const QuestboardAdminPage: FC<{ params: { username: string } }> = (props) => {
  const { getAllQuestboard } = useQuestService()
  const router = useRouter()
  const LIMIT = 10
  const [state, dispatch] = useMinimizedState<InitialState>({
    origin: "",
    data: [],
    total_data: 0,
    page: 1,
  })
  const { state: { isLight, token } } = useGlobalContext()
  const { getProjectByUsername } = usePublicClientService()

  useEffect(()=>{
    dispatch({
      origin: window.origin,
      page: 1
    })
  }, [])

  useDebounce<[string, string | undefined]>((t, u)=>{
    if(t && u) getProjectByUsername(u, {Authorization: "Bearer " + t})
      .then(res => dispatch({clientProject: res.data.data}))
      .catch(err => console.log(err))
  }, [token, props.params?.username])

  const getAllQuestboards = (page: number, token: string, type?: QuestboardTypeEnum) => {
    getAllQuestboard({
      username: props.params.username,
      type,
      limit: LIMIT,
      page
    }, token ? {Authorization: "Bearer " + token} : undefined)
      .then(res => dispatch({
        data: res.data.data.data,
        total_data: res.data.data.meta?.total
      }))
      .catch(err => console.log(err))
  }

  useDebounce<[number, string, QuestboardTypeEnum | undefined]>(getAllQuestboards, [state.page, token, state.type], 400)

  return (
    <OuterWrapper>
      <InnerWrapper className="flex flex-col items-center justify-center gap-4">
        <h1 className={`${isLight ? "text-black" : "text-white"} ${manrope800.className} text-4xl lg:text-4xl`}>Quest Board</h1>
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex gap-2">
            {Object.entries(QuestboardTypeEnum).map(([label,value], index) =>
              <ThemeChip 
                className="cursor-pointer"
                key={index} 
                color={state.type === value ? "warning" : "default"}
                onClick={()=> dispatch({
                  type: state.type === value ? undefined : value,
                  page: 1
                })}
              >
                {capitalizeFirstLetter(label.toLowerCase())}
              </ThemeChip>
            )}
          </div> 
          {state.clientProject?._id &&
            <ThemeButton
              size="sm"
              radius="full"
              color="primary"
              onClick={()=>router.push(addSearchParams(questCreationPath, {clientProjectId: state.clientProject?._id, isCreate: true}))}
            >
              Create a Campaign
            </ThemeButton>
          }
        </div>
        <ThemeTable
          bottomContent={
            <ThemePagination
              showControls
              classNames={{
                cursor: "bg-foreground text-background",
              }}
              color="default"
              isDisabled={false}
              page={state.page}
              total={state.total_data / LIMIT}
              variant="light"
              onChange={(page)=>dispatch({page})}
            />
          }
          bottomContentPlacement="inside"
        >
          <TableHeader>
            <TableColumn>Name</TableColumn>
            <TableColumn>Quester</TableColumn>
            <TableColumn>Reward</TableColumn>
            <TableColumn>Timeline</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody emptyContent="There's nothing here yet!">
            {state.data.map((d, index) =>
              <TableRow key={index}>
                <TableCell>
                  {state.clientProject?._id &&
                    <NextLink href={addSearchParams(questCreationPath, {clientProjectId: state.clientProject?._id, questBoardId: d._id})}>
                      <h3 className={`${manrope800.className} text-[16px]`}>{d.title}</h3>
                      <span className={`${manrope400.className} text-[13px]`}>{state.origin}/{props?.params?.username}</span>
                    </NextLink>
                  }
                </TableCell>
                <TableCell>{d.quester}</TableCell>
                <TableCell>{d.reward_name}</TableCell>
                <TableCell>{d.start_redemption_date ? DateTime.fromJSDate(new Date(d.start_redemption_date)).toFormat('yyyy LLL dd HH:mm') : "-"} ~ {d.end_redemption_date ? DateTime.fromJSDate(new Date(d.end_redemption_date)).toFormat('yyyy LLL dd HH:mm') : "-"}</TableCell>
                <TableCell>
                  <ThemeButton
                    startContent={<PencilIcon width="15" height="15" />}
                    radius="full"
                    size="sm"
                    isLoading={!state.clientProject?._id}
                    onClick={()=>router.push(addSearchParams(questCreationPath, {clientProjectId: state.clientProject?._id, questBoardId: d._id}))}
                  >
                    Edit
                  </ThemeButton>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </ThemeTable>
      </InnerWrapper>
    </OuterWrapper>
  )
}

export default QuestboardAdminPage