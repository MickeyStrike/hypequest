"use client"
import { FC, Fragment, PropsWithChildren, ReactNode, useEffect } from "react";
import { ThemeModal, ThemeModalBody, ThemeModalContent, ThemeModalFooter, ThemeModalHeader } from "./NextuiTheme";
import { ModalProps, useDisclosure } from "@nextui-org/react";

export interface CustomModalProps extends PropsWithChildren, Omit<ModalProps, "children" | "title" | "ref" | "onClose" | "content"> {
  show?: boolean;
  title: ReactNode;
  footer?: (onContentClose: () => void) => ReactNode;
}

const CustomModal: FC<CustomModalProps> = (props) => {
  const { show, title, footer, children, ...anotherProps } = props
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(()=>{
    if(show) onOpen()
    else onClose()
  }, [show])

  return (
    <ThemeModal isOpen={isOpen} onClose={onClose} {...anotherProps}>
      <ThemeModalContent>
        {(onContentClose)=>
          <Fragment>
            <ThemeModalHeader className="flex flex-col gap-1">{title}</ThemeModalHeader>
            <ThemeModalBody>
              {children}
            </ThemeModalBody>
            {footer &&
              <ThemeModalFooter>{footer(onContentClose)}</ThemeModalFooter>
            }
          </Fragment>
        }
      </ThemeModalContent>
    </ThemeModal>
  )
}

export default CustomModal