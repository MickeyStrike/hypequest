"use client"
import { FC, Fragment, useMemo } from "react";
import { ThemeButton, ThemeModal, ThemeModalBody, ThemeTabs } from "./NextuiTheme";
import { ModalContent, ModalFooter, ModalHeader, Tab, UseDisclosureProps, useDisclosure } from "@nextui-org/react";
import { useMinimizedState } from "@/helper";
import { IInventoryGet, InventoryStatusEnum } from "@/types/service-types";
import PlaceholderLogo from "@/components/assets/images/placeholder.png"
import NextImage from "next/image"

export interface InventoryPublicModalInterface extends UseDisclosureProps {
  inventories: Array<IInventoryGet>;
  onSelectedInventory?: (inventory: IInventoryGet) => void;
}

interface InitialState {
  isRedeemedMenu: boolean;
}

const InventoryPublicModal: FC<InventoryPublicModalInterface> = (props) => {
  const [state, dispatch] = useMinimizedState<InitialState>({
    isRedeemedMenu: false,
  })
  const { onOpen, isOpen, onOpenChange } = useDisclosure(props)

  const filteredInventories = useMemo(()=>{
    return props.inventories.filter(inventory => {
      if(state.isRedeemedMenu) return inventory.status === InventoryStatusEnum.REDEEM
      else return inventory.status === InventoryStatusEnum.NOT_REDEEM || inventory.status === InventoryStatusEnum.REQUEST_REDEEM
    })
  }, [state.isRedeemedMenu, props.inventories])

  return (
    <ThemeModal
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
    >
      <ModalContent>
        {(onClose) => 
          <Fragment>
            <ModalHeader/>
            <ThemeModalBody className="flex flex-col gap-8">
              <ThemeTabs
                selectedKey={String(state.isRedeemedMenu)}
                onSelectionChange={(key) => dispatch({isRedeemedMenu: key === "true"})}
              >
                <Tab key="false" title="Inventory" />
                <Tab key="false" title="Redeem" />
              </ThemeTabs>
              <div className="grid grid-cols-inventoryItem gap-2 w-full">
                {filteredInventories.map((inventory, index) =>
                  <ThemeButton
                    key={index}
                    className="h-full flex flex-col items-center justify-center h-[137px]"
                    onClick={()=>props.onSelectedInventory?.(inventory)}
                    color={(() => {
                      if(inventory.status === InventoryStatusEnum.NOT_REDEEM) return "default"
                      else if(inventory.status === InventoryStatusEnum.REQUEST_REDEEM) return "warning"
                      else return "success"
                    })()}
                  >
                    <NextImage 
                      src={inventory.photo ?? PlaceholderLogo}
                      alt={inventory.name ?? `inventory-${index}`}
                      className="transition-all hover:scale-110 rounded-md"
                      width={80}
                      height={80}
                    />
                  </ThemeButton>
                )}
              </div>
            </ThemeModalBody>
            <ModalFooter />
          </Fragment>
        }
      </ModalContent>
    </ThemeModal>
  )
}

export default InventoryPublicModal