"use client"
import { useGlobalContext } from "@/providers/stores";
import { Accordion, AccordionItem, AccordionItemProps, AccordionProps, Avatar, AvatarProps, Badge, BadgeProps, Button, ButtonProps, Card, CardBody, CardFooter, CardHeader, CardProps, Checkbox, CheckboxGroup, CheckboxGroupProps, CheckboxProps, Chip, ChipProps, CircularProgress, CircularProgressProps, Code, CodeProps, Divider, DividerProps, Dropdown, DropdownProps, Image, ImageProps, Input, InputProps, Kbd, KbdProps, Link, LinkProps, Listbox, ListboxProps, Modal, ModalBody, ModalBodyProps, ModalContent, ModalContentProps, ModalFooter, ModalFooterProps, ModalHeader, ModalHeaderProps, ModalProps, Navbar, NavbarProps, Pagination, PaginationProps, Popover, PopoverProps, Progress, ProgressProps, Radio, RadioGroup, RadioGroupProps, RadioProps, ScrollShadow, ScrollShadowProps, Select, SelectItem, SelectItemProps, SelectProps, Skeleton, SkeletonProps, Slider, SliderProps, Snippet, SnippetProps, Spacer, SpacerProps, Spinner, SpinnerProps, Switch, SwitchProps, Table, TableBody, TableBodyProps, TableCell, TableCellProps, TableColumn, TableColumnProps, TableHeader, TableHeaderProps, TableProps, Tabs, TabsProps, TextAreaProps, Textarea, Tooltip, TooltipProps, User, UserProps } from "@nextui-org/react";
import { useRef, useState, Fragment, ReactNode, forwardRef, useCallback, useEffect, FC, PropsWithChildren } from "react";
import { FormikContextType, FormikTouched } from "formik"
import { DM_Sans, Manrope } from "@next/font/google";
import { DropEvent, DropzoneInputProps, DropzoneRootProps, FileRejection, useDropzone } from "react-dropzone";
import { AntdInfoIcon, CloseIcon, FileIcon, ProfileUploadIcon } from "../assets/icons";
import { formatBytes, getTotalPaginationPage, isValidHttpUrl, useClickOutside, useMinimizedState } from "@/helper";
import { HexColorPicker } from "react-colorful";
import NextImage from "next/image"
import dynamic from "next/dynamic";
import { ReactQuillProps } from "react-quill";
const ReactQuill = dynamic(()=>import("react-quill"), {ssr: false})

const dmSans700 = DM_Sans({weight: "700", subsets: ["latin"]})
const manrope400 = Manrope({weight: "400", subsets: ["latin"]})
const manrope800 = Manrope({weight: "800", subsets: ["latin"]})

type DropzoneOnDrop = <T extends File>(
  acceptedFiles: T[],
  fileRejections: FileRejection[],
  event: DropEvent
) => void

export interface CustomFormikConfig<Values> {
  config: FormikContextType<Values>;
  name: keyof Values;
}

export type InitFormikConfig<T extends object, Values> = {
  formik?: CustomFormikConfig<Values>;
} & T

export const checkIsInvalidForm = <Values extends object>(ctx?: CustomFormikConfig<Values>): boolean => {
  if(ctx) {
    const { config, name } = ctx
    if(!!config.errors[name] && !!config.touched[name]) return !!config.errors[name]
    else return false
  }
  else return false
}

export const errorMessagesHandler = <Values extends object>(ctx?: CustomFormikConfig<Values>) => {
  if(ctx) {
    const { config, name } = ctx
    const errors = config?.errors[name]
    const touched = config?.touched[name]
    if(Array.isArray(errors)) return errors.map(error => {
      if(typeof error === "object") return Object.entries(error).map(([_key,val], key) => <Fragment key={key}>{val}</Fragment>)
      else return String(error)
    })
    else {
      if(!!errors && touched) return errors?.toString()
      else return undefined
    }
  }
  else return undefined
}

export const ThemeAvatar = forwardRef<HTMLSpanElement, AvatarProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Avatar ref={ref} className={`${state.isLight ? "text-black" : "dark text-white"} ${className ?? ""}`} {...props} />
})

ThemeAvatar.displayName = "ThemeAvatar"

export const ThemeAccordion = forwardRef<HTMLDivElement, AccordionProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  
  return (
    <Accordion 
      ref={ref} 
      itemClasses={{
        base: state.isLight ? "" : "dark",
        indicator: state.isLight ? "" : "dark",
        content: state.isLight ? "text-black" : "dark text-white"
      }} 
      className={className} {...props} 
    />
  )
})

ThemeAccordion.displayName = "ThemeAccordion"

export const ThemeAccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <AccordionItem className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeAccordionItem.displayName = "ThemeAccordionItem"

export const ThemeBadge = forwardRef<HTMLDivElement, BadgeProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Badge ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeBadge.displayName = "ThemeBadge"

export const ThemeButton = forwardRef<HTMLButtonElement, ButtonProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Button ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeButton.displayName = "ThemeButton"

export const ThemeCard = forwardRef<HTMLDivElement, CardProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Card ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeCard.displayName = "ThemeCard"

export const ThemeCardHeader = forwardRef<HTMLDivElement, CardProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <CardHeader ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeCardHeader.displayName = "ThemeCardHeader"

export const ThemeCardBody = forwardRef<HTMLDivElement, CardProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <CardBody ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeCardBody.displayName = "ThemeCardBody"

export const ThemeCardFooter = forwardRef<HTMLDivElement, CardProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <CardFooter ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeCardFooter.displayName = "ThemeCardFooter"

export const ThemeCheckbox = <T extends object>({className, formik, onValueChange, onBlur, onChange, ...props}: InitFormikConfig<CheckboxProps, T>) => {
  const { state } = useGlobalContext()
  return (
    <Fragment>
      <Checkbox 
        className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} 
        onValueChange={formik ? (value) => {
          formik.config.setTouched({
            ...formik.config.touched,
            [formik.name.toString()]: true
          } as FormikTouched<T>)
          formik.config.setFieldValue(formik.name.toString(), value)
          onValueChange?.(value)
        } : onValueChange}
        onBlur={formik ? formik.config.handleBlur(formik.name.toString()) : onBlur}
        isSelected={formik ? formik.config.values[formik.name] as boolean | undefined : props.isSelected}
        isInvalid={formik ? checkIsInvalidForm(formik) : props.isInvalid}
        {...props} 
      />
      {(checkIsInvalidForm(formik) && errorMessagesHandler(formik)) && <div className="text-danger text-[0.75rem]">{errorMessagesHandler(formik)}</div>}
    </Fragment>
  )
}

export const ThemeCheckboxGroup = <T extends object>({className, formik, onValueChange, onBlur, ...props}: InitFormikConfig<CheckboxGroupProps, T>) => {
  const { state } = useGlobalContext()
  return (
    <CheckboxGroup 
      className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} 
      value={formik ? formik.config.values[formik.name] as Array<string> | undefined : props.value}
      onValueChange={formik ? (value) => { 
        formik.config.setTouched({
          ...formik.config.touched,
          [formik.name.toString()]: true
        } as FormikTouched<T>)
        formik.config.setFieldValue(formik.name.toString(), value) 
        onValueChange?.(value)
      } : onValueChange}
      onBlur={formik ? (evt) => {
        formik.config.handleBlur(evt)
      } : onBlur}
      isInvalid={formik ? checkIsInvalidForm(formik) : props.isInvalid}
      errorMessage={formik ? errorMessagesHandler(formik) : props.errorMessage}
      {...props} 
    />
  )
}

export const ThemeChip = forwardRef<HTMLDivElement, ChipProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Chip ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeChip.displayName = "ThemeChip"

export const ThemeCircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <CircularProgress ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeCircularProgress.displayName = "ThemeCircularProgress"

export const ThemeCode = forwardRef<HTMLDivElement, CodeProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Code ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeCode.displayName = "ThemeCode"

export const ThemeDivider = forwardRef<HTMLDivElement, DividerProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Divider ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeDivider.displayName = "ThemeDivider"

export const ThemeDropdown = forwardRef<HTMLDivElement, DropdownProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Dropdown ref={ref} className={`${state.isLight ? "" : "dark text-white"} ${className ?? ""}`} {...props} />
})

ThemeDropdown.displayName = "ThemeDropdown"

export const ThemeImage = forwardRef<HTMLImageElement, ImageProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Image ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeImage.displayName = "ThemeImage"

export const ThemeInput = <T extends object>({className, formik, onValueChange, onBlur, startContent, ...props}: InitFormikConfig<InputProps, T>) => {
  const { state } = useGlobalContext()
  const isStringStartContent = typeof startContent === "string"

  const numberPattern = "(?<!\S)(?=.)(0|([1-9](\d*|\d{0,2}(,\d{3})*)))?(\.\d*[1-9])?(?!\S)"

  const checkValue = (value?: string) => {
    if(props.type === "number") {
      if (value === "") return ""
      else return Number(value)
    }
    else return value
  }
  
  return (
    <Input 
      className={`${state.isLight ? "" : "dark text-white"} ${className ?? ""}`} 
      onValueChange={formik ? (value) => { 
        formik.config.setTouched({
          ...formik.config.touched,
          [formik.name.toString()]: true
        } as FormikTouched<T>)

        formik.config.setFieldValue(formik.name.toString(), checkValue(value)) 
        onValueChange?.(value)
      } : onValueChange}
      onBlur={formik ? (evt) => {
        formik.config.handleBlur(evt)
      } : onBlur}
      startContent={isStringStartContent ? <span className="text-[12px]">{startContent}</span> : startContent}
      value={formik ? checkValue(formik.config.values[formik.name] as string | (readonly string[] & string) | undefined)?.toString() : props.value}
      isInvalid={formik ? checkIsInvalidForm(formik) : props.isInvalid}
      errorMessage={formik ? errorMessagesHandler(formik) : props.errorMessage}
      pattern={props.type === "number" ? numberPattern : props.pattern}
      {...props} 
    />
  )
}

export const ThemeKbd = forwardRef<HTMLElement, KbdProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Kbd ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeKbd.displayName = "ThemeKbd"

export const ThemeLink = forwardRef<HTMLAnchorElement, LinkProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Link ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeLink.displayName = "ThemeLink"

export const ThemeListbox = forwardRef<HTMLElement, ListboxProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Listbox ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeListbox.displayName = "ThemeListbox"

export const ThemeModal = forwardRef<HTMLElement, ModalProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Modal ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeModal.displayName = "ThemeModal"

export const ThemeModalHeader = forwardRef<HTMLElement, ModalHeaderProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <ModalHeader ref={ref} className={`${state.isLight ? "text-black" : "dark text-white"} ${className ?? ""}`} {...props} />
})

ThemeModalHeader.displayName = "ThemeModalHeader"

export const ThemeModalBody = forwardRef<HTMLElement, ModalBodyProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <ModalBody ref={ref} className={`${state.isLight ? "text-black" : "dark text-white"} ${className ?? ""}`} {...props} />
})

ThemeModalBody.displayName = "ThemeModalBody"

export const ThemeModalContent = forwardRef<HTMLElement, ModalContentProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <ModalContent ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeModalContent.displayName = "ThemeModalContent"

export const ThemeModalFooter = forwardRef<HTMLElement, ModalFooterProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <ModalFooter ref={ref} className={`${state.isLight ? "text-black" : "dark text-white"} ${className ?? ""}`} {...props} />
})

ThemeModalFooter.displayName = "ThemeModalFooter"

export const ThemeNavbar = forwardRef<HTMLElement, NavbarProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Navbar ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeNavbar.displayName = "ThemeNavbar"

export const ThemePagination = forwardRef<HTMLElement, PaginationProps>(({className, total, ...props}, ref)=>{
  const { state } = useGlobalContext()
  const totalPaging = getTotalPaginationPage(total)

  return (
    <Pagination 
      ref={ref} 
      className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} 
      total={totalPaging > 0 ? totalPaging : 1}
      {...props} 
    />
  )
})

ThemePagination.displayName = "ThemePagination"

export const ThemePopover = forwardRef<HTMLDivElement, PopoverProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Popover ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemePopover.displayName = "ThemePopover"

export const ThemeProgress = forwardRef<HTMLDivElement, ProgressProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Progress ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeProgress.displayName = "ThemeProgress"

export const ThemeRadio = forwardRef<HTMLDivElement, RadioProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Radio ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeRadio.displayName = "ThemeRadio"

export const ThemeRadioGroup = <T extends object>({className, formik, onValueChange, onBlur, ...props}: InitFormikConfig<RadioGroupProps, T>) => {
  const { state } = useGlobalContext()

  return (
    <RadioGroup 
      className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} 
      value={formik ? formik.config.values[formik.name] as string | undefined : props.value}
      onValueChange={formik ? (value) => { 
        formik.config.setTouched({
          ...formik.config.touched,
          [formik.name.toString()]: true
        } as FormikTouched<T>)
        formik.config.setFieldValue(formik.name.toString(), value) 
        onValueChange?.(value)
      } : onValueChange}
      onBlur={formik ? (evt) => {
        formik.config.handleBlur(evt)
      } : onBlur}
      isInvalid={formik ? checkIsInvalidForm(formik) : props.isInvalid}
      errorMessage={formik ? errorMessagesHandler(formik) : props.errorMessage}
      {...props} 
    />
  )
}

export const ThemeSelect = <T extends object>({className, formik, onSelectionChange, onBlur, ...props}: InitFormikConfig<SelectProps, T>) => {
  const { state } = useGlobalContext()
  
  return (
    <Select 
      className={`${state.isLight ? "text-black" : "dark text-white"} ${className ?? ""}`} 
      selectedKeys={formik ? (typeof formik.config.values[formik.name] === "string" ? new Set([formik.config.values[formik.name]]) : undefined) as Iterable<string | number> | "all" | undefined : props.selectedKeys}
      onSelectionChange={formik ? (selections) => {
        if(selections instanceof Set) {
          const value = selections.values()
          const finalValue = value.next().value
          if(typeof finalValue === "string") {
            formik.config.setTouched({
              ...formik.config.touched,
              [formik.name.toString()]: true
            } as FormikTouched<T>)

            formik.config.setFieldValue(formik.name.toString(), finalValue)
          }
        }
        onSelectionChange?.(selections)
      } : onSelectionChange}
      onBlur={formik ? (evt) => {
        formik.config.handleBlur(evt)
      } : onBlur}
      isInvalid={formik ? checkIsInvalidForm(formik) : props.isInvalid}
      errorMessage={formik ? errorMessagesHandler(formik) : props.errorMessage}
      {...props} 
    />
  )
}

// export const ThemeSelectItem: FC<SelectItemProps> = ({className, ...props}) => {
//   const { state } = useGlobalContext()
//   return <SelectItem className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
// }

export const ThemeSkeleton = forwardRef<HTMLElement, SkeletonProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Skeleton ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeSkeleton.displayName = "ThemeSkeleton"

export const ThemeSnippet = forwardRef<HTMLDivElement, SnippetProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Snippet ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeSnippet.displayName = "ThemeSnippet"

export const ThemeScrollShadow = forwardRef<HTMLElement, ScrollShadowProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <ScrollShadow ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeScrollShadow.displayName = "ThemeScrollShadow"

export const ThemeSpacer = forwardRef<HTMLElement, SpacerProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Spacer ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeSpacer.displayName = "ThemeSpacer"

export const ThemeSpinner = forwardRef<HTMLElement, SpinnerProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Spinner ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeSpinner.displayName = "ThemeSpinner"

export const ThemeSwitch = <T extends object>({className, formik, onValueChange, onBlur, ...props}: InitFormikConfig<SwitchProps, T>) => {
  const { state } = useGlobalContext()
  return (
    <Fragment>
      <Switch 
        className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} 
        isSelected={formik ? formik.config.values[formik.name] as boolean | undefined : props.isSelected}
        onValueChange={formik ? (value) => {
          formik.config.setTouched({
            ...formik.config.touched,
            [formik.name.toString()]: true
          } as FormikTouched<T>)

          formik.config.setFieldValue(formik.name.toString(), value)
          onValueChange?.(value)
        } : onValueChange}
        onBlur={formik ? (evt) => {
          formik.config.handleBlur(evt)
        } : onBlur}
        {...props} 
      />
      {(checkIsInvalidForm(formik) && errorMessagesHandler(formik)) && <div className="text-danger text-[0.75rem]">{errorMessagesHandler(formik)}</div>}
    </Fragment>
  )
}

ThemeSwitch.displayName = "ThemeSwitch"

export const ThemeTable = forwardRef<HTMLElement, TableProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Table ref={ref} className={`${state.isLight ? "" : "dark text-white"} ${className ?? ""}`} {...props} />
})

ThemeTable.displayName = "ThemeTable"

export const ThemeTableBody = <T extends any>({className, ...props}: TableBodyProps<T>)=>{
  const { state } = useGlobalContext()
  return <TableBody className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
}

export const ThemeTableCell = ({className, ...props}: TableCellProps)=>{
  const { state } = useGlobalContext()
  return <TableCell className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
}

export const ThemeTableColumn = <T extends any>({className, ...props}: TableColumnProps<T>)=>{
  const { state } = useGlobalContext()
  return <TableColumn className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
}

export const ThemeTableHeader = <T extends any>({className, ...props}: TableHeaderProps<T>)=>{
  const { state } = useGlobalContext()
  return <TableHeader className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
}

export const ThemeTabs = forwardRef<HTMLElement, TabsProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Tabs ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeTabs.displayName = "ThemeTabs"

export const ThemeTextarea = <T extends object>({className, formik, onValueChange, onBlur, ...props}: InitFormikConfig<TextAreaProps, T>) => {
  const { state } = useGlobalContext()

  return (
    <Textarea 
      className={`${state.isLight ? "text-black" : "dark text-white"} ${className ?? ""}`} 
      value={formik ? formik.config.values[formik.name] as string | undefined : props.value}
      onValueChange={formik ? (value) => { 
        formik.config.setTouched({
          ...formik.config.touched,
          [formik.name.toString()]: true
        } as FormikTouched<T>)

        formik.config.setFieldValue(formik.name.toString(), value)
        onValueChange?.(value)
      } : onValueChange}
      onBlur={formik ? (evt) => {
        formik.config.handleBlur(evt)
      } : onBlur}
      isInvalid={formik ? checkIsInvalidForm(formik) : props.isInvalid}
      errorMessage={formik ? errorMessagesHandler(formik) : props.errorMessage}
      {...props} 
    />
  )
}

export const ThemeTooltip = forwardRef<HTMLElement, TooltipProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <Tooltip ref={ref} className={`${state.isLight ? "text-black" : "text-white dark"} ${className ?? ""}`} {...props} />
})

ThemeTooltip.displayName = "ThemeTooltip"

export const ThemeUser = forwardRef<HTMLDivElement, UserProps>(({className, ...props}, ref)=>{
  const { state } = useGlobalContext()
  return <User ref={ref} className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} {...props} />
})

ThemeUser.displayName = "ThemeUser"

export const ThemeSlider = <T extends object>({className, formik, onChange, onBlur, ...props}: InitFormikConfig<SliderProps, T>) => {
  const { state } = useGlobalContext()

  return (
    <Fragment>
      <Slider 
        className={`${state.isLight ? "" : "dark"} ${className ?? ""}`} 
        value={formik ? formik.config.values[formik.name] as number | number[] | undefined : props.value}
        onChange={formik ? (value) => { 
          formik.config.setTouched({
            ...formik.config.touched,
            [formik.name.toString()]: true
          } as FormikTouched<T>)

          formik.config.setFieldValue(formik.name.toString(), value)
          onChange?.(value)
        } : onChange}
        onBlur={formik ? (evt) => {
          formik.config.handleBlur(evt)
        } : onBlur}
        {...props} 
      />
      {(checkIsInvalidForm(formik) && errorMessagesHandler(formik)) && <div className="text-danger text-[0.75rem]">{errorMessagesHandler(formik)}</div>}
    </Fragment>
  )
}

export interface DropzoneReturnValues {
  files: Array<string | ArrayBuffer | null>;
  rawFiles: Array<File>;
}
export type OnChangeDropzone = (values: DropzoneReturnValues) => void
export type GetInputPropsDropzone<T extends DropzoneInputProps> = (props?: T) => T
export type GetRootPropsDropzone<T extends DropzoneRootProps> = (props?: T | undefined) => T

export interface ThemeDropzoneProps<DropzoneRoot extends DropzoneRootProps, DropzoneInput extends DropzoneInputProps> {
  label?: ReactNode;
  contentLabel?: ReactNode;
  supportedMimes?: Array<CustomImageMime>;
  maxByteSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  onChange?: OnChangeDropzone;
  customRender?: (getRootProps: GetRootPropsDropzone<DropzoneRoot>, getInputProps: GetInputPropsDropzone<DropzoneInput>, values: DropzoneReturnValues) => ReactNode;
  position?: "horizontal" | "vertical";
  values?: DropzoneReturnValues;
  customClassName?: string;
  width?: number;
  height?: number;
}

interface ThemeDropzoneState {
  results: DropzoneReturnValues;
}

export const ThemeDropzone = <Values extends object, DropzoneRoot extends DropzoneRootProps, DropzoneInput extends DropzoneInputProps>(props: InitFormikConfig<ThemeDropzoneProps<DropzoneRoot, DropzoneInput>, Values>) => {
  const { formik, values } = props
  const [state, dispatch] = useMinimizedState<ThemeDropzoneState>({
    results: values ?? { files: [], rawFiles: [] }
  })

  useEffect(()=>{
    if(formik?.config && formik.name) {
      dispatch({
        results: {
          files: (formik.config?.values?.[formik.name] as DropzoneReturnValues)?.files ?? [],
          rawFiles: (formik.config?.values?.[formik.name] as DropzoneReturnValues)?.rawFiles ?? [],
        }
      })
    }
  }, [formik?.config, formik?.name])

  const onDrop = useCallback<DropzoneOnDrop>((rawFiles) => {
    Promise.all(rawFiles.map((file) => new Promise<string | ArrayBuffer | null>((resolve,reject) => {
      const reader = new FileReader()

      reader.onabort = () => reject(new Error('file reading was aborted'))
      reader.onerror = () => reject(new Error('file reading has failed'))
      reader.onload = () => {
      // Do whatever you want with the file contents
        if(!isNaN(Number(props.maxByteSize))) {
          if(file.size <= Number(props.maxByteSize)) resolve(reader.result)
          else reject(new Error(`max file size is ${formatBytes(props.maxByteSize ?? 0, 0)}`))
        }
        else resolve(reader.result)
      }
      
      reader.readAsDataURL(file)
    })))
      .then(files => {
        dispatch({ results: {files, rawFiles} })

        if(formik) {
          formik.config.setTouched({
            ...formik.config.touched,
            [formik.name.toString()]: true
          } as FormikTouched<Values>)

          formik.config.setFieldValue(formik.name.toString(), {files, rawFiles})
        }
        if(props.onChange) props.onChange({files, rawFiles})
      })
      .catch(err => console.log(err))

  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxFiles: props.maxFiles,
    maxSize: props.maxByteSize,
    multiple: props.multiple,
    accept: props.supportedMimes ? Object.fromEntries(new Map(props.supportedMimes.map(mime => {
      const split = mime.split("/")
      return [mime, [`.${split[1] ?? ""}`]]
    }))) : undefined
  })
  const { state: { isLight } } = useGlobalContext()

  const footerContent = () => {
    if(props.supportedMimes || props.maxByteSize) {
      const texts = (props.supportedMimes ?? []).map(mime => mime.split("/")[1])
      if(props.maxByteSize) texts.push(`max ${formatBytes(props.maxByteSize, 0)}`)

      return <span className="text-xs text-center">PNG, JPG, SVG, Max 5MB</span>
    }
    else return null
  }

  const borderColor = () => {
    if(formik) {
      if(checkIsInvalidForm(formik)) return "border-red"
      else {
        if(isLight) return "border-black"
        else return "border-slate-50"
      }
    }
    else {
      if(isLight) return "border-black"
      else return "border-slate-50"
    }
  }

  const textColor = () => {
    if(formik) {
      if(checkIsInvalidForm(formik)) return "text-red"
      else {
        if(isLight) return "text-black"
        else return "text-white"
      }
    }
    else {
      if(isLight) return "text-black"
      else return "text-white"
    }
  }

  const deleteHandler = () => {
    dispatch({ results: { files: [], rawFiles: [] } })

    if(formik) {
      formik.config.setTouched({
        ...formik.config.touched,
        [formik.name.toString()]: true
      } as FormikTouched<Values>)

      formik.config.setFieldValue(formik.name.toString(), {files: [], rawFiles: []})
    }
  }

  const contentRender = () => {
    if(props.customRender) return props.customRender(getRootProps, getInputProps, state.results)
    else {
      const contentFileRender = () => { 
        if(state.results.rawFiles.length > 0) return state.results.rawFiles.map((raw, index) => {
          const getType = raw.type.split("/")?.[0]?.toLowerCase()
          const componentByType = () => {
            if(getType === "image") return (
              <Image
                as={NextImage}
                width={props.width ?? 180}
                height={props.height ?? 120}
                className="object-cover"
                src={state.results.files[index]?.toString() ?? "/placeholder.png"}
                alt={raw.name}
                isZoomed
                radius="md"
              />
            )
            else return (
              <div className={`p-2 rounded-lg bg-gray-800 ${isLight ? "text-black" : "text-white"}`}><FileIcon /></div>
            )
          }

          return (
            <div className={`flex ${state.results.rawFiles.length > 1 ? "flex-row border-gray-400 border-solid border-2" : "flex-col h-full"} items-center justify-between w-full p-2 rounded-lg`} key={index}>
              {componentByType()}
              <span className={`${state.results.rawFiles.length > 1 ? "max-w-[100px]" : "max-w-[180px]"} text-[10px] text-ellipsis overflow-hidden ${isLight ? "text-black" : "text-white"}`}>{raw.name}</span>
            </div>
          )
        })
        else if(state.results.files.length > 0) return state.results.files.map((file, index) => {
          const getTheFilename = () => {
            const fileUrl = file?.toString() ?? ""
            if(isValidHttpUrl(fileUrl)) {
              const imgUrl = new URL(fileUrl)
              const paths = imgUrl.pathname.split("/")
              const fileName = paths[paths.length - 1]

              return fileName
            }
            else return "placeholder.png"
          }
          return (
            <div className={`flex ${state.results.rawFiles.length > 1 ? "flex-row border-gray-400 border-solid border-2" : "flex-col h-full"} items-center justify-between w-full p-2 rounded-lg`} key={index}>
              <Image
                as={NextImage}
                width={props.width ?? 180}
                height={props.height ?? 120}
                className="object-cover"
                src={file?.toString() ?? "/placeholder.png"}
                alt={file?.toString()}
                isZoomed
                radius="md"
              />
              <span className={`${state.results.rawFiles.length > 1 ? "max-w-[100px]" : "max-w-[180px]"} text-[10px] text-ellipsis overflow-hidden ${isLight ? "text-black" : "text-white"}`}>{getTheFilename()}</span>
            </div>
          )
        })
        else return (
          <Fragment>
            <ProfileUploadIcon />
            <span className={`${manrope400.className} text-xs`}>{isDragActive ? "Drop Here!" : "Drag files to upload"}</span>
          </Fragment>
        )
      }
      return (
        <div className={`rounded-lg border-2 ${borderColor()} border-dashed min-w-[180px] min-h-[180px] flex flex-col items-center ${state.results.files.length > 0 ? "" : "justify-center"} ${textColor()} gap-2`} {...getRootProps()}>
          <input {...getInputProps()} />
          {contentFileRender()}
        </div>
      )
    }
  }

  if (props.position === 'horizontal') return (
    <div className={`flex flex-row items-center gap-5 ${textColor()}`}>
      <div className="flex flex-col gap-2">
        {props.label && <span className={`${dmSans700.className} text-base ${textColor()}`}>{props.label}</span>}
        {contentRender()}
      </div>
      <div className="flex flex-col gap-5">
        <div>
          {props.contentLabel}
          {footerContent()}
        </div>
        <div className="flex flex-row items-center gap-2">
          <ThemeButton size="sm" radius="full" onClick={open}>Choose File</ThemeButton>
          {state.results.files.length > 0 && <ThemeButton onClick={deleteHandler} isIconOnly size="sm" radius="full" color="danger"><CloseIcon /></ThemeButton>}
        </div>
      </div>
    </div>
  )
  else return (
    <div className={`${props.customClassName ?? "flex flex-col items-center gap-2"} ${textColor()}`}>
      {props.label && <span className={`${dmSans700.className} text-base ${textColor()}`}>{props.label}</span>}
      {contentRender()}
      {props.contentLabel}
      {footerContent()}
      <div className="flex flex-row items-center gap-2">
        <ThemeButton size="sm" radius="full" onClick={open}>Choose File</ThemeButton>
        {state.results.files.length > 0 && <ThemeButton onClick={deleteHandler} isIconOnly size="sm" radius="full" color="danger"><CloseIcon /></ThemeButton>}
      </div>
    </div>
  )
}

export interface ThemeColorPickerProps extends Omit<InputProps, "type"> {
  label?: ReactNode;
}

export const ThemeColorPicker = <T extends object>(props: InitFormikConfig<ThemeColorPickerProps, T>) => {
  const { formik, onBlur, ...anotherProps } = props
  const [isFocus, setIsFocus] = useState(false)
  const popover = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setIsFocus(false), []);
  useClickOutside(popover, close);

  return (
    <div className="w-full flex flex-col gap-4">
      <ThemeInput 
        onValueChange={formik ? (value) => { 
          formik.config.setTouched({
            ...formik.config.touched,
            [formik.name.toString()]: true
          } as FormikTouched<T>)

          formik.config.setFieldValue(formik.name.toString(), value) 
        } : props.onValueChange}
        value={formik ? formik.config.values[formik.name] as string | undefined : props.value}
        isInvalid={formik ? checkIsInvalidForm(formik) : props.isInvalid}
        errorMessage={formik ? errorMessagesHandler(formik) : props.errorMessage}
        onFocus={(evt)=>{
          setIsFocus(true)
          if(props.onFocus) props.onFocus(evt)
        }}
        onBlur={formik ? (evt) => {
          formik.config.handleBlur(evt)
        } : onBlur}
        isClearable
        {...anotherProps}
      />
      {isFocus && 
        <div ref={popover} className="relative">
          <div className="absolute z-10">
            <HexColorPicker 
              onChange={formik ? (value) => { 
                formik.config.setTouched({
                  ...formik.config.touched,
                  [formik.name.toString()]: true
                } as FormikTouched<T>)

                formik.config.setFieldValue(formik.name.toString(), value) 
              } : props.onValueChange}
              color={formik ? formik.config.values[formik.name] as string | undefined : props.value}
            />
          </div>
        </div>
      }
    </div>
  )
}

export const ThemeWYSIWYG = <T extends object>({value, onChange, formik, label, ...props}: InitFormikConfig<ReactQuillProps & { label?: ReactNode }, T>) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <h3 className={`${manrope400.className} text-[14px]`}>{label}</h3>}
      <ReactQuill 
        {...props}
        value={formik ? formik.config.values[formik.name] as string | undefined : value}
        onChange={formik ? (value) => { 
          formik.config.setTouched({
            ...formik.config.touched,
            [formik.name.toString()]: true
          } as FormikTouched<T>)
  
          formik.config.setFieldValue(formik.name.toString(), value) 
        } : onChange}
      />
    </div>
  )
}

export enum ThemeAlertType {
  SUCCESS = "success",
  WARNING = "warning"
}

export interface ThemeAlertProps {
  title?: ReactNode;
  type?: ThemeAlertType;
}

export const ThemeAlert: FC<PropsWithChildren<ThemeAlertProps>> = (props) => {
  const { state : { isLight } } = useGlobalContext()

  const getThemeClassName = () => {
    if(props.type === ThemeAlertType.SUCCESS) return `${isLight ? "bg-[#f6ffed]" : "bg-[#162312]"} ${isLight ? "text-[#52c41a]" : "text-[#49aa19]"} ${isLight ? "border-[#b7eb8f]" : "border-[#274916]"}`
    else return `${isLight ? "bg-[#fff7e6]" : "bg-[#433529]"} ${isLight ? "text-[#fa8c16]" : "text-[#dc7e1a]"} ${isLight ? "border-[#ffd591]" : "border-[#6d4c28]"}`
  }

  return (
    <div className={`flex flex-col items-start p-2 gap-4 w-full ${getThemeClassName()} rounded-md border-2`}>
      <div className="flex flex-row items-center gap-2">
        <AntdInfoIcon />
        {props.title && <h2 className={`${manrope800.className}`}>{props.title}</h2>}
      </div>
      {props.children && <div className={`${manrope400.className} text-left w-full`}>{props.children}</div>}
    </div>
  )
}