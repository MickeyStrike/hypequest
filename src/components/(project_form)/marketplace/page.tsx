"use client"
import { MainXp2SmallIcon } from "@/components/assets/icons";
import { CustomRangePicker, InfoTooltip } from "@/components/reusables";
import CustomCalendar from "@/components/reusables/CustomCalendar";
import { DropzoneReturnValues, ThemeAvatar, ThemeButton, ThemeCard, ThemeCheckbox, ThemeChip, ThemeDropzone, ThemeInput, ThemeModal, ThemePagination, ThemeSelect, ThemeTabs, ThemeTextarea } from "@/components/reusables/NextuiTheme";
import { incrementDay, submitFormikForm, useDebounce, useMinimizedState } from "@/helper";
import { createProfilePath, defaultPath } from "@/helper/route-path";
import { AlertModalType, useModal } from "@/providers/modal";
import { useFormContext } from "@/providers/project-form-stores";
import { useGlobalContext } from "@/providers/stores";
import useMarketplaceService from "@/services/marketplace-service";
import { ICreateMarketplace, IUpdateMarketplace } from "@/types/service-types";
import { CardBody, CardHeader, ModalBody, ModalContent, ModalHeader, SelectItem, Tab, useDisclosure } from "@nextui-org/react";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { NextPage } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import NextImage from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Fragment, useEffect, useMemo } from "react";
import { v4 } from "uuid";
import * as yup from "yup";

const manrope400 = Manrope({weight: "400", subsets: ["latin"]})
const manrope700 = Manrope({weight: "700", subsets: ["latin"]})
const dmSans900 = DM_Sans({weight: "900", subsets: ["latin"]})
const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})
const dmSans400 = DM_Sans({weight: "400", subsets: ["latin"]})
const manrope800 = Manrope({weight: "800", subsets: ["latin"]})

interface IForm extends Omit<IUpdateMarketplace, "photo" | "tags" | "marketplaceId" | "created_date" | "updated_date" | "created_by" | "created_by"> {
  marketplaceId?: string;
  randomId?: string;
  photo?: DropzoneReturnValues;
  tags?: string;
  redemptionTime?: Array<Date> | null;
}

interface IMarketplaceState {
  page: number;
  isPreviewItems: boolean;
  isLoading: boolean;
  marketplaces: Array<Partial<IForm>>;
  selectedMarketplace?: Partial<IForm>;
}

const MarketplacePage: NextPage = () => {
  const LIMIT = 15
  const params = useSearchParams()
  const router = useRouter()
  const { createMarketplace, updateMarketplace, getAllMarketplaces } = useMarketplaceService()
  const [state, dispatch] = useMinimizedState<IMarketplaceState>({
    page: 1,
    isPreviewItems: false,
    isLoading: false,
    marketplaces: []
  })
  const { state: { isLight, token } } = useGlobalContext()
  const openModal = useModal()
  const {isOpen, onOpen, onClose} = useDisclosure({
    isOpen: !!state.selectedMarketplace,
    onClose: () => {
      dispatch({selectedMarketplace: undefined})
    },
  });

  const formContext = useFormContext()

  const formik = useFormik<Partial<IForm>>({
    initialValues: {},
    onSubmit: (vals, fHelper) => {
      dispatch({marketplaces: [...state.marketplaces, vals]})

      openModal({
        type: AlertModalType.SUCCESS,
        title: "Successfully!",
        description: "Successfully created Marketplace Item!"
      })

      fHelper.resetForm()
    },
    validationSchema: yup.object().shape({
      name: yup.string().required("Name must be fill!"),
      xp_cost: yup.number().required("XP Cost must be fill!"),
      qty: yup.number().required("Quantity must be fill!"),
      photo: yup.object().shape({
        files: yup.array(),
        rawFiles: yup.array(),
      }).required("Photo must be fill")
    })
  })

  useDebounce<[string, string | null]>((t, cpId)=>{
    if(t && cpId){
      getAllMarketplaces({clientProjectId: cpId},{Authorization: "Bearer " + t})
        .then(res => {
          const marketplaces: Array<IForm> = (res.data.data?.data ?? []).map((d) => {
            return {
              ...d,
              marketplaceId: d._id,
              randomId: v4(),
              photo: d.photo ? {
                files: [d.photo],
                rawFiles: []
              } : undefined,
              tags: d.tags.join(","),
              redemptionTime: d.start_redemption_date && d.end_redemption_date ? [new Date(d.start_redemption_date), new Date(d.end_redemption_date)] : null, 
              _id: d._id,
              clientProjectId: d.clientProjectId,
            }
          })
          dispatch({marketplaces, isPreviewItems: true})
        })
    }
  }, [token, params.get("clientProjectId")])

  useEffect(()=>{
    formContext.dispatch({title: "Marketplace"})

    if(!params.get("clientProjectId")) {
      openModal({
        type: AlertModalType.WARNING,
        title: "Warning",
        description: "You are not allowed to access this page!"
      })
      router.push(createProfilePath)
    }
  }, [])

  const addToMarketplaceHandler = () => {
    const clientProjectId = params.get("clientProjectId")

    if(clientProjectId && state.marketplaces.length > 0) {
      dispatch({isLoading: true})
      Promise.all(state.marketplaces.map(marketplace => {
        const payload: ICreateMarketplace = {
          clientProjectId,
          name: marketplace.name ?? "Item Name",
          xp_cost: marketplace.xp_cost ?? 0,
          qty: marketplace.qty ?? 0,
          available_count: marketplace.available_count ?? 0,
          description: marketplace.description,
          is_redeem_once: marketplace.is_redeem_once ? true : false,
          tags: marketplace.tags?.split(",") ?? [],
          photo: marketplace.photo?.rawFiles?.[0],
          start_redemption_epoch: marketplace.redemptionTime?.[0] ? DateTime.fromJSDate(new Date(marketplace.redemptionTime[0])).toMillis() : undefined,
          end_redemption_epoch: marketplace.redemptionTime?.[1] ? DateTime.fromJSDate(new Date(marketplace.redemptionTime[1])).toMillis() : undefined,
        }
        if(marketplace.marketplaceId) return updateMarketplace({
          ...payload,
          marketplaceId: marketplace.marketplaceId
        })
        else return createMarketplace(payload)
      }))
        .then(() => {
          openModal({
            type: AlertModalType.SUCCESS,
            title: "Successfully!",
            description: `Successfully created or updated all marketplace items!`
          })
          router.push(defaultPath)
        })
        .catch(err => console.log(err))
        .finally(()=>dispatch({isLoading: false}))
    }
    else openModal({
      type: AlertModalType.WARNING,
      title: "Warning",
      description: "You haven't add marketplace items yet!"
    })
  }

  const getRendererMarketplace = useMemo(()=>{
    const MIN_LIMIT = (state.page - 1) * LIMIT
    const MAX_LIMIT = state.page * LIMIT

    return state.marketplaces.slice(MIN_LIMIT, MAX_LIMIT)
  }, [state.marketplaces, state.page])

  return (
    <ThemeCard className="w-full lg:p-4">
      <CardHeader>
        <ThemeTabs
          isDisabled={state.isLoading}
          selectedKey={String(state.isPreviewItems)}
          onSelectionChange={(key) => dispatch({isPreviewItems: key === "true"})}
        >
          <Tab key="false" title="Add Item" />
          <Tab key="true" title="Preview Items" />
        </ThemeTabs>
      </CardHeader>
      <CardBody className="w-full">
        <div className={`${state.isPreviewItems && "hidden"} flex flex-col w-full gap-4`}>
          <div className="flex flex-row justify-between w-full gap-4">
            <ThemeDropzone 
              label="Item Photo"
              supportedMimes={["image/png","image/jpeg"]}
              maxByteSize={5e+6}
              formik={{
                config: formik,
                name: "photo"
              }}
              width={undefined}
              height={300}
            />
            <div className="w-full flex flex-col gap-2">
              <ThemeInput
                formik={{
                  config: formik,
                  name: "name"
                }}
                type="input"
                label="Item Name"
                placeholder="Enter Name"
                labelPlacement="outside"
                variant='bordered'
                radius="sm"
              />
              <div className="flex flex-row gap-2 justify-between w-full">
                <ThemeInput
                  formik={{
                    config: formik,
                    name: "xp_cost"
                  }}
                  type="text"
                  label="XP Cost"
                  placeholder="Enter Value"
                  labelPlacement="outside"
                  variant='bordered'
                  radius="sm"
                />
                <ThemeInput
                  formik={{
                    config: formik,
                    name: "qty"
                  }}
                  type="text"
                  label="Quantity"
                  placeholder="Enter Value"
                  labelPlacement="outside"
                  variant='bordered'
                  radius="sm"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-2 justify-between">
            {/* <ThemeInput
              formik={{
                config: formik,
                name: "available_count"
              }}
              type="text"
              label="Available Count"
              placeholder="Enter Value"
              labelPlacement="outside"
              variant='bordered'
              radius="sm"
            /> */}
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col w-full">
                <label className={`${isLight ? "text-black-900" : "text-white"} text-[0.875rem] pb-[0.375rem]`}>
                  Redemption Period
                </label>
                <CustomCalendar 
                  placeholder="Start > End" 
                  formik={{
                    config: formik,
                    name: "redemptionTime"
                  }} 
                />
              </div>
              <ThemeCheckbox
                formik={{
                  config: formik,
                  name: "is_redeem_once"
                }}
              >
                Redeem Once
              </ThemeCheckbox>
            </div>
          </div>
          <ThemeTextarea 
            formik={{
              config: formik,
              name: "description"
            }}
            label="Description"
            placeholder="Enter Value"
            labelPlacement="outside"
            variant='bordered'
            radius="sm"
          />
          <ThemeTextarea 
            formik={{
              config: formik,
              name: "tags"
            }}
            label={<div className="flex flex-row items-center gap-2">Tags <InfoTooltip title="Separated with commas, example: #NFT,#Airdrop" /></div>}
            placeholder="Enter Tags: #NFT,#Airdrop"
            labelPlacement="outside"
            variant='bordered'
            radius="sm"
          />
          <ThemeButton 
            className="my-6 w-full" 
            radius="full" 
            color="warning"
            onClick={async ()=>{
              await formik.setFieldValue("randomId", v4())
              await submitFormikForm(formik)
            }}
          >
            Add Item
          </ThemeButton>
        </div>
        <div className={`${!state.isPreviewItems && "hidden"} flex flex-col w-full gap-8`}>
          <div className={`${isLight ? "text-black-900" : "text-white"} text-[28px] ${manrope800.className}`}>Added Items</div>
          {state.marketplaces.length === 0 &&
            <div className={`flex items-center justify-center p-12 border-1 rounded-lg border-gray-600 border-dashed ${isLight ? "text-black" : "text-white"}`}>No Marketplace items to display</div>
          }
          <div className="flex flex-col w-full gap-2">
            {getRendererMarketplace.map((marketplace, index) =>
              <div 
                key={index}
                className={`cursor-pointer border ${isLight ? 'border-black' : 'border-[rgba(255, 255, 255, 0.07)]'} p-3 flex flex-row gap-2 justify-between items-center`}
                onClick={()=>dispatch({selectedMarketplace: marketplace})}
              >
                <div className="flex flex-row gap-4 items-center">
                  <ThemeAvatar 
                    isBordered 
                    radius="sm" 
                    icon={
                      <div className="w-full h-full flex items-center justify-center">
                        <NextImage 
                          src={marketplace.photo?.files?.[0]?.toString() ?? "/placeholder.png"}
                          alt={`items-${index}`}
                          width={20}
                          height={20}
                          className="drop-shadow-sm"
                        />
                      </div>
                    }
                    color="warning"
                    className="w-[40px] h-[40px] pointer-events-none z-0" 
                  />
                  <span className={`${manrope700.className} ${isLight ? "text-black-900" : "text-white"} text-[20px]`}>{marketplace.name}</span>
                </div>
                <span className={`${manrope700.className} text-[#6F7176]`}>{marketplace.qty}</span>
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <ThemePagination
              total={state.marketplaces.length / LIMIT}
              page={state.page}
              onChange={(page) => dispatch({page})}
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <ThemeButton 
              radius="full" 
              color="default" 
              onClick={() => dispatch({isPreviewItems: false})}
              isLoading={state.isLoading}
              isDisabled={state.isLoading}
            >
              Add More
            </ThemeButton>
            <ThemeButton 
              radius="full" 
              color="warning" 
              onClick={()=>addToMarketplaceHandler()}
              isLoading={state.isLoading}
              isDisabled={state.isLoading}
            >
              Add To Marketplace
            </ThemeButton>
          </div>
          <ThemeModal backdrop="blur" isOpen={isOpen} onClose={onClose} size="xl">
            <ModalContent>
              {(onClose) => (
                <Fragment>
                  <ModalHeader>&nbsp;</ModalHeader>
                  <ModalBody className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-row gap-4">
                      <div className="w-[5rem] h-[5rem]">
                        <ThemeAvatar 
                          isBordered 
                          radius="sm" 
                          icon={
                            <div className="w-full h-full flex items-center justify-center">
                              <NextImage 
                                src={state.selectedMarketplace?.photo?.files?.[0]?.toString() ?? "/placeholder.png"}
                                alt="Selected marketplace item photo"
                                width={30}
                                height={30}
                                className="drop-shadow-sm"
                              />
                            </div>
                          }
                          color="warning"
                          className="w-[5rem] h-[5rem] pointer-events-none z-0" 
                        />
                      </div>
                      <div className="flex flex-col gap-4 w-full">
                        <div className={`font-extrabold ${dmSans700.className} ${isLight ? "text-black-900" : "text-white"} text-xl`}>{state.selectedMarketplace?.name}</div>
                        <div className="flex flex-row gap-2 items-center">
                          <MainXp2SmallIcon />
                          <span className={`${dmSans700.className} ${isLight ? "text-black-900" : "text-white"} text-[34px]`}>{state.selectedMarketplace?.xp_cost}</span>
                        </div>
                        <CustomRangePicker 
                          value={state.selectedMarketplace?.redemptionTime?.map(rt => new Date(rt))}
                          disabled
                        />
                        <ul className="list-none p-0 m-0 inline overflow-hidden">
                          {state.selectedMarketplace?.tags?.split(",").map((tag,index) =>
                            <li className="float-left mr-2 mb-2" key={index}>
                              <ThemeChip radius="sm">{tag}</ThemeChip>
                            </li>
                          )}
                        </ul>
                        <div className={`my-2 ${dmSans400.className} text-sm ${isLight ? "text-black-900" : "text-white"}`}>
                          {state.selectedMarketplace?.description}
                        </div>
                        <ThemeInput
                          type="text"
                          label="Available Count"
                          placeholder="Enter Value"
                          labelPlacement="outside"
                          variant='bordered'
                          radius="sm"
                          value={state.selectedMarketplace?.available_count?.toString()}
                          onValueChange={(value) => {
                            const newMarketplace = state.marketplaces.map(m => {
                              if(m.randomId === state.selectedMarketplace?.randomId) m.available_count = Number(value)

                              return m
                            })

                            dispatch({
                              marketplaces: newMarketplace,
                              selectedMarketplace: {
                                ...state.selectedMarketplace,
                                available_count: Number(value)
                              }
                            })
                          }}
                        />
                        <ThemeButton 
                          color="default" 
                          radius="full" 
                          className={`min-w-[160px] ${manrope800.className}`}
                          onClick={()=>{
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
                                dispatch({
                                  marketplaces: state.marketplaces.filter(marketplace => marketplace.randomId !== state.selectedMarketplace?.randomId),
                                  selectedMarketplace: undefined
                                })
                              }
                            })
                          }}
                        >
                          Remove Item
                        </ThemeButton>
                      </div>
                    </div>
                  </ModalBody>
                </Fragment>
              )}
            </ModalContent>
          </ThemeModal>
        </div>
      </CardBody>
    </ThemeCard>
  )
}

export default MarketplacePage