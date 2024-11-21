"use client"
import { FC, Fragment, useEffect } from "react";
import { IApprovalRedeemListRequest, IClient, IGetRedeemListResponse, IGetRedeemListStatus } from "@/types/service-types";
import { DM_Sans, Manrope } from "@next/font/google";
import { DropzoneReturnValues, ThemeButton, ThemeChip, ThemeDivider, ThemeDropzone, ThemeInput, ThemeModal, ThemeModalBody, ThemeModalHeader, ThemePagination, ThemeSwitch, ThemeTable, ThemeTextarea, ThemeWYSIWYG } from "../reusables/NextuiTheme";
import { capitalizeFirstLetter, downloadFile, getListDescription, useDebounce, useMinimizedState } from "@/helper";
import { ModalContent, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import NextImage from "next/image"
import MetamaskIcon from "@/components/assets/images/metamask.png"
import PlaceholderIcon from "@/components/assets/images/placeholder.png"
import { useGlobalContext } from "@/providers/stores";
import { AntdEyeIcon } from "../assets/icons";
import { v4 } from "uuid";
import { DateTime } from "luxon";
import { useFormik } from "formik";
import useAdminRedeemService from "@/services/admin-redeem";
import sanitize from "sanitize-html";
import { toast } from "react-toastify";
import CONSTANT from "@/Constant";

interface IRedeemedListAdminPageProps {
  clientProject?: IClient;
}

const dmSans600 = DM_Sans({weight: "600", subsets: ["latin"]})
const manrope400 = Manrope({weight: "400", subsets: ["latin"]})
const manrope600 = Manrope({weight: "800", subsets: ["latin"]})

interface IApprovalForm extends Omit<IApprovalRedeemListRequest, "file_data_proof"> {
  isFile?: boolean;
  file_data_proof?: DropzoneReturnValues;
}

interface InitialState {
  approvalMode?: "APPROVE" | "REJECT";
  selectedRedemption?: IGetRedeemListResponse;
  redemptionList: Array<IGetRedeemListResponse>;
  page: number;
  total: number;
  isLoading: boolean;
  statusFilter: IGetRedeemListStatus;
  search: string;
}

const RedeemedListAdminPage: FC<IRedeemedListAdminPageProps> = (props) => {
  const { state: { isLight, token } } = useGlobalContext()
  const { approvalRedeem, rejectRedeem, getRedeemList, updateRedeem } = useAdminRedeemService()
  const [state, dispatch] = useMinimizedState<InitialState>({
    redemptionList: [],
    page: 1,
    total: 0,
    isLoading: false,
    statusFilter: IGetRedeemListStatus.ALL,
    search: ""
  })

  useEffect(()=>{
    dispatch({page: 1})
  }, [state.search, state.statusFilter, props.clientProject])

  const getRedeemListService = (token: string, status: IGetRedeemListStatus, page: number, search?: string, clientProject?: IClient) => {
    if(clientProject?.username) {
      getRedeemList({
        username: clientProject?.username,
        status,
        limit: CONSTANT.PAGINATION_DEFAULT_LIMIT,
        page,
        search
      }, { Authorization: "Bearer " + token })
        .then(res => {
          dispatch({
            redemptionList: res.data.data.data,
            total: res.data.data.meta?.total
          })
        })
        .catch(err => console.log(err))
    }
  }

  const approvalFormik = useFormik<Partial<IApprovalForm>>({
    initialValues: {},
    onSubmit: (values) => {
      if(props.clientProject?.username && state.selectedRedemption?.id) {
        dispatch({isLoading: true})
        if(state.approvalMode === "APPROVE") {
          approvalRedeem({
            username: props.clientProject.username,
            inventoryId: state.selectedRedemption.id,
            note: values.note ? sanitize(values.note) : undefined,
            data_proof: values.isFile ? undefined : (values.data_proof ? sanitize(values.data_proof) : undefined),
            file_data_proof: values.isFile ? values.file_data_proof?.rawFiles[0] : undefined
          })
            .then(() => {
              dispatch({
                approvalMode: undefined,
                redemptionList: undefined
              })

              toast.success("Successfully approve this request!")
              getRedeemListService(token, state.statusFilter, state.page, state.search, props.clientProject)
            })
            .catch(err => console.log(err))
            .finally(()=>dispatch({isLoading: false}))
        }
        else {
          rejectRedeem({
            username: props.clientProject.username,
            inventoryId: state.selectedRedemption.id,
            note: values.note ? sanitize(values.note) : undefined,
          })
            .then(() => {
              dispatch({
                approvalMode: undefined,
                redemptionList: undefined
              })

              toast.success("Successfully reject this request!")
              getRedeemListService(token, state.statusFilter, state.page, state.search, props.clientProject)
            })
            .catch(err => console.log(err))
            .finally(()=>dispatch({isLoading: false}))
        }
      }
    }
  })

  useDebounce<[string, IGetRedeemListStatus, number, string | undefined, IClient | undefined]>(getRedeemListService, [token, state.statusFilter, state.page, state.search, props.clientProject], 400)

  const proofDownloader = () => {
    if(state.selectedRedemption?.data_proof) downloadFile(state.selectedRedemption.data_proof, v4())
  }

  const getStatusRedemption = () => {
    if(state.selectedRedemption?.approve_date) return <ThemeChip color="success" size="sm">Approved</ThemeChip>
    else if(state.selectedRedemption?.reject_date) return <ThemeChip color="danger" size="sm">Rejected</ThemeChip>
    else return <ThemeChip color="warning" size="sm">Pending</ThemeChip>
  }

  useEffect(()=>{
    if(!state.selectedRedemption || state.approvalMode) approvalFormik.resetForm()
  }, [state.approvalMode, state.selectedRedemption])

  const approvalRenderer = () => {
    if(!state.selectedRedemption?.approve_date && !state.selectedRedemption?.reject_date) {
      const conditionalRenderer = () => {
        if(state.approvalMode) return (
          <div className="flex flex-col gap-4">
            <h1 className={`${manrope600.className} text-[20px]`}>Redemption Approval</h1>
            {state.approvalMode === "APPROVE" &&
            <Fragment>
              <div className="flex flex-row items-center gap-2">
                <h3 className={`${dmSans600.className} text-[14px]`}>File Proof</h3>
                <ThemeSwitch 
                  size="sm"
                  formik={{
                    config: approvalFormik,
                    name: "isFile"
                  }}
                />
              </div>
              {approvalFormik.values.isFile ?
                <ThemeDropzone 
                  label="File Proof"
                  formik={{
                    config: approvalFormik,
                    name: "file_data_proof"
                  }}
                  maxFiles={1}
                  supportedMimes={["image/png","image/jpg","image/jpeg", "image/svg"]}
                  maxByteSize={5e+6}
                />
                :
                <ThemeWYSIWYG 
                  placeholder="Data Proof"
                  label="Data Proof"
                  formik={{
                    config: approvalFormik,
                    name: "data_proof"
                  }}
                />
              }
            </Fragment>
            }
            <ThemeWYSIWYG 
              placeholder={state.approvalMode === "REJECT" ? "Reason Note" : "Note"}
              label={state.approvalMode === "REJECT" ? "Reason Note" : "Note"}
              formik={{
                config: approvalFormik,
                name: "note"
              }}
            />
            <div className="flex flex-row items-center gap-2">
              <ThemeButton
                radius="full"
                className="w-full"
                onClick={()=>dispatch({approvalMode: undefined})}
                isDisabled={state.isLoading}
                isLoading={state.isLoading}
              >
                Cancel
              </ThemeButton>
              <ThemeButton
                radius="full"
                color={state.approvalMode === "APPROVE" ? "success" : "danger"}
                className="w-full"
                isDisabled={state.isLoading}
                isLoading={state.isLoading}
              >
                Submit {state.approvalMode === "APPROVE" ? 'Approve' : 'Reject'}
              </ThemeButton>
            </div>
          </div>
        )
        else return (
          <div className="flex flex-row items-center gap-2">
            <ThemeButton
              radius="full"
              color="success"
              className="w-full"
              onClick={()=>dispatch({approvalMode: "APPROVE"})}
            >
              Approve
            </ThemeButton>
            <ThemeButton
              radius="full"
              color="danger"
              className="w-full"
              onClick={()=>dispatch({approvalMode: "REJECT"})}
            >
              Reject
            </ThemeButton>
          </div>
        )
      }

      return conditionalRenderer()
    }
    else return null
  }

  return (
    <div className={`${isLight ? "text-black" : "text-white"} flex flex-col gap-4`}>
      <h1 className={`${dmSans600.className} text-[32px]`}>Redemption Records</h1>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <ThemeInput 
          size="sm"
          className="lg:max-w-[500px]"
          radius="md"
          placeholder="Search by keyword"
          value={state.search}
          onValueChange={(search) => dispatch({search})}
        />
        <div className="flex flex-row items-center gap-2">
          {Object.entries(IGetRedeemListStatus).map(([_key,val], index) =>
            <ThemeButton
              key={index}
              size="sm"
              radius="full"
              color={state.statusFilter === val ? "warning" : "default"}
              onClick={()=> dispatch({statusFilter: val})}
            >
              {capitalizeFirstLetter(val)}
            </ThemeButton>
          )}
        </div>
      </div>
      <ThemeTable 
        aria-label="Redemption Records Table"
        removeWrapper 
        bottomContent={
          <ThemePagination
            showControls
            classNames={{
              cursor: "bg-foreground text-background",
            }}
            color="default"
            isDisabled={false}
            page={state.page}
            total={state.total / CONSTANT.PAGINATION_DEFAULT_LIMIT}
            variant="light"
            onChange={(page)=>dispatch({page})}
          />
        }
        bottomContentPlacement="inside"
      >
        <TableHeader>
          <TableColumn key="rank">Date</TableColumn>
          <TableColumn key="name">User</TableColumn>
          <TableColumn key="wallet">Wallet</TableColumn>
          <TableColumn key="item">Item</TableColumn>
          <TableColumn key="status">Status</TableColumn>
          <TableColumn key="action">Action</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent="No rows to display."
          items={state.redemptionList}
        >
          {(data) => 
            <TableRow key={data.id}>
              <TableCell>{data.id}</TableCell>
              <TableCell className="flex items-center gap-2">
                <NextImage 
                  className="rounded-full"
                  width={46}
                  height={46}
                  src={data.user?.avatar ?? MetamaskIcon} 
                  alt="user_icon" 
                />
                <div>{data.user?.name ?? data.user?.wallet_address}</div>
              </TableCell>
              <TableCell>{data.user?.wallet_address}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 h-full">
                  <NextImage 
                    className="rounded-xl"
                    width={30}
                    height={30}
                    src={data.marketplace?.photo ?? PlaceholderIcon} 
                    alt="marketplace_icon" 
                  />
                  <h2 className={`${manrope400.className} text-[16px]`}>Smooth Potion</h2>
                </div>
              </TableCell>
              <TableCell><ThemeChip>Completed</ThemeChip></TableCell>
              <TableCell>
                <ThemeButton 
                  size="sm"
                  radius="full"
                  startContent={<AntdEyeIcon />}
                  color="primary"
                  onClick={()=>dispatch({selectedRedemption: data})}
                >
                  Detail
                </ThemeButton>
              </TableCell>
            </TableRow>
          }
        </TableBody>
      </ThemeTable>
      <ThemeModal
        isOpen={!!state.selectedRedemption}
        onClose={()=>dispatch({selectedRedemption: undefined, approvalMode: undefined})}
      >
        <ModalContent>
          <ThemeModalHeader>Redemption Detail</ThemeModalHeader>
          <ThemeModalBody className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className={`${manrope600.className} text-[20px]`}>User Detail</h2>
              {getListDescription("Name", state.selectedRedemption?.user?.name)}
              {getListDescription("Email", state.selectedRedemption?.user?.email)}
              {getListDescription("Wallet Address", state.selectedRedemption?.user?.wallet_address)}
            </div>
            <div className="flex flex-col gap-2">
              <h2 className={`${manrope600.className} text-[20px]`}>Redemption Detail</h2>
              {getListDescription("Marketplace Item", state.selectedRedemption?.marketplace?.name)}
              {getListDescription("Item Description", state.selectedRedemption?.marketplace?.description)}
              {getListDescription("File Proof", state.selectedRedemption?.is_file_proof ? <ThemeButton size="sm" radius="full" color="primary" onClick={()=>proofDownloader()}>Download</ThemeButton> : state.selectedRedemption?.data_proof)}
              {getListDescription("Approval Date", state.selectedRedemption?.approve_date ? DateTime.fromJSDate(new Date(state.selectedRedemption.approve_date)).toFormat("yyyy, LLLL dd") : undefined)}
              {getListDescription("Reject Date", state.selectedRedemption?.reject_date ? DateTime.fromJSDate(new Date(state.selectedRedemption.reject_date)).toFormat("yyyy, LLLL dd") : undefined)}
              {getListDescription("Note", state.selectedRedemption?.note)}
              {getListDescription("Status", getStatusRedemption())}
            </div>
            {approvalRenderer()}
          </ThemeModalBody>
        </ModalContent>
      </ThemeModal>
    </div>
  )
}

export default RedeemedListAdminPage