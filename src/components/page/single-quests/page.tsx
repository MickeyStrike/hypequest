"use client"
import { InnerWrapper, OuterWrapper } from "@/components/reusables";
import { ThemeButton, ThemePagination, ThemeTable } from "@/components/reusables/NextuiTheme";
import { addSearchParams, numFormatter, useDebounce, useMinimizedState, userByRenderer } from "@/helper";
import { useGlobalContext } from "@/providers/stores";
import useQuestService from "@/services/quest-service";
import { IMission, StageRewardTypeEnum } from "@/types/service-types";
import { TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { NextPage } from "next";
import { Manrope } from "@next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link"
import { createSingleQuestPath } from "@/helper/route-path";
import NextImage from "next/image"
import { PencilIcon } from "@/components/assets/icons";
import { Fragment } from "react";

const manrope400 = Manrope({weight: "400", subsets: ["latin"]})
const manrope800 = Manrope({weight: "800", subsets: ["latin"]})

interface InitialState {
  data: Array<IMission>;
  page: number;
  total_data: number;
  search: string;
}

const SingleQuestsPage: NextPage = () => {
  const LIMIT = 10
  const params = useSearchParams()
  const router = useRouter()
  const [state, dispatch] = useMinimizedState<InitialState>({
    data: [],
    page: 1,
    total_data: 0,
    search: ""
  })
  const { state: { isLight, token } } = useGlobalContext()
  const { getAllSingleMission } = useQuestService()
  const clientProjectId = params.get("clientProjectId")

  useDebounce<[number, string, string, string | null]>((page, search, t, cpId)=>{
    if(t && cpId) getAllSingleMission({
      limit: LIMIT,
      page,
      search,
      clientProjectId: cpId
    })
      .then(res => dispatch({
        data: res.data.data.data,
        total_data: res.data.data.meta.total
      }))
      .catch(err => console.log(err))
  }, [state.page, state.search, token, clientProjectId])

  return (
    <OuterWrapper>
      <InnerWrapper className={`${isLight ? "text-black" : "text-white"} mt-8 flex flex-col items-center justify-center gap-4`}>
        <div className="flex flex-row justify-between w-full">
          <h1 className={`${manrope800.className} text-3xl`}>Single Quest</h1>
          <ThemeButton
            size="sm"
            color="primary"
            radius="full"
            onClick={()=>router.push(addSearchParams(createSingleQuestPath, {clientProjectId}))}
          >
            Create a Quest
          </ThemeButton>
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
            <TableColumn>Reward</TableColumn>
            <TableColumn>Action</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Your quest list is empty!">
            {state.data.map((d, index) =>
              <TableRow key={index}>
                <TableCell>
                  <NextLink href={addSearchParams(createSingleQuestPath, {clientProjectId, missionId: d._id})}>
                    <h3 className={`${manrope800.className} text-[16px]`}>{d.data?.label}</h3>
                  </NextLink>
                </TableCell>
                <TableCell>{numFormatter(d.data?.rewardType === StageRewardTypeEnum.USDT ? d.usdt_reward : d.point_reward)} {d.data?.rewardType}</TableCell>
                <TableCell>
                  <ThemeButton
                    startContent={<PencilIcon width="15" height="15" />}
                    radius="full"
                    size="sm"
                    onClick={()=>router.push(addSearchParams(createSingleQuestPath, {clientProjectId, missionId: d._id}))}
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

export default SingleQuestsPage