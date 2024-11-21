"use client"
import { ClockIcon, GraphicElementIcon, MarketplaceXP2Icon, MarketplaceXP2SmallIcon, MarketplaceXPIcon, ProfileUploadIcon, ZealySmallIcon } from "@/components/assets/icons";
import ErrorIcon from "@/components/assets/icons/ErrorIcon";
import { CustomRangePicker, InnerWrapper, OuterWrapper } from "@/components/reusables";
import CustomCalendar from "@/components/reusables/CustomCalendar";
import InfoTooltip from "@/components/reusables/InfoTooltip";
import { ThemeAccordion, ThemeAccordionItem, ThemeButton, ThemeInput, ThemeSwitch, ThemeTable, ThemeTableColumn, ThemeTableHeader, ThemeTextarea } from "@/components/reusables/NextuiTheme";
import { useMinimizedState } from "@/helper";
import { useFormContext } from "@/providers/project-form-stores";
import { useGlobalContext } from "@/providers/stores";
import { Avatar, Button, Card, CardBody, Checkbox, Chip, Input, Listbox, ListboxItem, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress, Select, SelectItem, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea, Tooltip, cn, useDisclosure } from "@nextui-org/react";
import { NextPage } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import NextImage from "next/image";
import React, { Fragment, useEffect } from "react";

const dmSans900 = DM_Sans({weight: "900", subsets: ["latin"]})
const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})
const dmSans400 = DM_Sans({weight: "400", subsets: ["latin"]})
const manrope800 = Manrope({weight: "800", subsets: ["latin"]})
const manrope400 = Manrope({weight: "400", subsets: ["latin"]})

const CreateQuestBoard: NextPage = () => {
  const formContext = useFormContext()
  const { state } = useGlobalContext()

  useEffect(()=>{
    formContext.dispatch({title: "Quest Board"})
  }, [])
  return (
    <div className="flex flex-col lg:flex-row gap-5">
      <div className="min-w-[40rem]">
        <div className={`w-full flex gap-3 items-center gap-1 md:mb-0 ${state.isLight ? 'text-black' : 'text-white'}`}>
        <Table
          className="dark"
          aria-label="Example static collection table"
          classNames={{
            base: 'bg-transparent',
            wrapper: 'bg-transparent',
            td: [
              'bg-default-100',
              // first
              "group-data-[first=true]:first:rounded-tl-md",
              "group-data-[first=true]:last:rounded-tr-md",
              // // middle
              // "group-data-[middle=true]:rounded-none",
              // // last
              "group-data-[last=true]:first:rounded-bl-md",
              "group-data-[last=true]:last:rounded-br-md",
            ],
          }}
        >
          <TableHeader>
            <TableColumn>Name</TableColumn>
            <TableColumn>Questor</TableColumn>
            <TableColumn>Reward</TableColumn>
            <TableColumn>Timeline</TableColumn>
          </TableHeader>
          <TableBody>
            <TableRow key="1">
              <TableCell>Tony Reichert</TableCell>
              <TableCell>CEO</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
            <TableRow key="2">
              <TableCell>Tony Reichert</TableCell>
              <TableCell>CEO</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  )
}

export default CreateQuestBoard