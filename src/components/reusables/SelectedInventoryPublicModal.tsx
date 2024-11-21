"use client"
import { FC, Fragment, ReactNode } from "react";
import { ThemeButton, ThemeModal, ThemeModalBody } from "./NextuiTheme";
import { ModalContent, ModalFooter, ModalHeader, UseDisclosureProps, useDisclosure } from "@nextui-org/react";
import { IInventoryGet, InventoryStatusEnum } from "@/types/service-types";
import PlaceholderLogo from "@/components/assets/images/placeholder.png"
import NextImage from "next/image"
import NextLink from "next/link"
import { getListDescription } from "@/helper";

export interface SelectedInventoryPublicModalInterface extends UseDisclosureProps {
  inventory?: IInventoryGet;
  onRedeem?: (inventory: IInventoryGet) => void;
  isLoading?: boolean;
}

const SelectedInventoryPublicModal: FC<SelectedInventoryPublicModalInterface> = (props) => {
  const { isOpen, onOpenChange } = useDisclosure(props)

  return (
    <ThemeModal
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="sm"
    >
      <ModalContent>
        {(onClose) => 
          <Fragment>
            <ModalHeader/>
            <ThemeModalBody className="flex flex-col items-center justify-center gap-4">
              <NextImage 
                src={props.inventory?.photo ?? PlaceholderLogo}
                alt={`inventory-image`}
                className="rounded-full"
                width={240}
              />
              <div className="flex flex-col gap-2 w-full">
                {props.inventory?.name && getListDescription("Name",props.inventory.name)}
                {props.inventory?.status && getListDescription("Status",props.inventory.status)}
                {props.inventory?.note_client && getListDescription("Note Client",props.inventory.note_client)}
                {props.inventory?.proof && getListDescription("Proof",props.inventory.proof)}
                {props.inventory?.file_proof && getListDescription("File Proof",<NextLink href={props.inventory.file_proof}><ThemeButton size="sm" radius="full">Proof</ThemeButton></NextLink>)}
              </div>
              <div className="flex flex-row items-center justify-between w-full">
                <ThemeButton
                  onClick={()=>onClose()}
                  radius="full"
                  isLoading={props.isLoading}
                  isDisabled={props.isLoading}
                >
                  Close
                </ThemeButton>
                {props.inventory?.status === InventoryStatusEnum.NOT_REDEEM &&
                  <ThemeButton 
                    color="warning"
                    radius="full"
                    isLoading={props.isLoading}
                    isDisabled={props.isLoading}
                    onClick={()=>props.inventory && props.onRedeem?.(props.inventory)}
                  >
                    Redeem
                  </ThemeButton>
                }
              </div>
            </ThemeModalBody>
            <ModalFooter />
          </Fragment>
        }
      </ModalContent>
    </ThemeModal>
  )
}

export default SelectedInventoryPublicModal