"use client"
import { ClockIcon, GraphicElementIcon, MarketplaceXP2Icon, MarketplaceXP2SmallIcon, MarketplaceXPIcon, ProfileUploadIcon, ZealySmallIcon } from "@/components/assets/icons";
import ErrorIcon from "@/components/assets/icons/ErrorIcon";
import InfoTooltip from "@/components/reusables/InfoTooltip";
import { ThemeButton, ThemeCard, ThemeCheckbox, ThemeChip, ThemeInput } from "@/components/reusables/NextuiTheme";
import { useFormContext } from "@/providers/project-form-stores";
import { useGlobalContext } from "@/providers/stores";
import { Avatar, Button, Card, CardBody, Checkbox, Chip, Input, Listbox, ListboxItem, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress, Switch, Textarea, Tooltip, useDisclosure } from "@nextui-org/react";
import { NextPage } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import NextImage from "next/image";
import React, { Fragment, useEffect } from "react";

const dmSans900 = DM_Sans({weight: "900", subsets: ["latin"]})
const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})
const dmSans400 = DM_Sans({weight: "400", subsets: ["latin"]})
const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope400 = Manrope({weight: "400", subsets: ["latin"]})

const CreateMilestonePage: NextPage = () => {
  const { state } = useGlobalContext()
  const formContext = useFormContext()
  useEffect(()=>{
    formContext.dispatch({title: "Milestone & Rewards"})
  }, [])
  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <div className={`w-full mb-6 md:mb-0 ${state.isLight ? 'text-black' : 'text-white'} block flex items-center gap-1`}>
        <span>
          How many Airdrop Token Jackpots would you like to unlock this time? 
        </span>
        <InfoTooltip title="I'm a tooltip" />
      </div>
      <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
        <div className='flex flex-col gap-2 w-[270px]'>
          <ThemeCard className="rounded-md">
            <CardBody className="py-4 pl-3 pr-2">
              <div className="flex flex-row items-start">
                <ThemeCheckbox defaultSelected />
                <div>
                  <p className="font-bold">XP Boost</p>
                  <span className="text-xs">your one-stop for marketing, growth and analysis for Web3</span>
                </div>
              </div>
            </CardBody>
          </ThemeCard>
        </div>
        <div className='flex flex-col gap-2 w-[270px]'>
          <ThemeCard className="rounded-md">
            <CardBody className="py-4 pl-3 pr-2">
              <div className="flex flex-row items-start">
                <ThemeCheckbox />
                <div>
                  <p className="font-bold">USDT</p>
                  <span className="text-xs">your one-stop for marketing, growth and analysis for Web3</span>
                </div>
              </div>
            </CardBody>
          </ThemeCard>
        </div>
      </div>
      <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
        <ThemeInput
          type="input"
          placeholder="Enter Value"
          labelPlacement="outside"
          variant='bordered'
          className='basis-3/4'
          radius="sm"
        />
      </div>
      <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4 mt-6">
        <ThemeInput
          type="input"
          label={<div className="flex items-center gap-1">Target Max Followers <InfoTooltip title="I'm a tooltip" /></div>}
          placeholder="Enter Value"
          labelPlacement="outside"
          variant='bordered'
          className='basis-3/4'
          radius="sm"
          errorMessage={
            <div className="flex flex-row gap-1">
              <ErrorIcon />
              <span>
                Invalid value! please ensure it is rounded to the nearest thousand for accurate display to your community!
              </span>
            </div>
          }
        />
      </div>
      <div className={`w-full flex items-center gap-1 mt-6 md:mb-0 ${state.isLight ? 'text-black' : 'text-white'}`}>
        Set Your Project Milestones <InfoTooltip title="I'm a tooltip" />
      </div>
      <div className='flex flex-row flex-nowrap overflow-x-auto gap-1'>
        {
          [...Array(5).keys()].map((_, index) => (
            <ThemeChip
              radius="sm"
              classNames={{
                content: 'w-[50px] text-center'
              }}
              key={index}
            >
              {index + 1}
            </ThemeChip>
          ))
        }
      </div>
      <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4 mt-6">
        <ThemeButton radius="full" size="sm">
          Back
        </ThemeButton>
        <ThemeButton radius="full" size="sm" color="warning">
          Next
        </ThemeButton>
      </div>
    </div>
  )
}

export default CreateMilestonePage