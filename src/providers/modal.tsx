"use client"
import { AntdErrorIcon, AntdInfoIcon, AntdSuccessIcon, AntdWarningIcon } from "@/components/assets/icons";
import { ThemeButton, ThemeModal, ThemeModalBody, ThemeModalFooter, ThemeModalHeader } from "@/components/reusables/NextuiTheme";
import { ButtonProps, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalProps, useDisclosure } from "@nextui-org/react"
import { FC, Fragment, PropsWithChildren, ReactNode, createContext, useContext, useEffect, useReducer } from "react";
import { v4 } from "uuid"

export enum MODAL_ACTION {
  ADD_MODAL="ADD_MODAL",
  REMOVE_MODAL="REMOVE_MODAL",
}

export enum AlertModalType {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  WARNING = "WARNING",
}

export interface AlertModalProps extends Omit<ModalProps, "isOpen" | "onClose" | "onOpenChange" | "title" | "ref" | "children"> {
  type: AlertModalType;
  title?: ReactNode;
  description?: ReactNode;
  onOk?: () => void;
  okButtonProps?: ButtonProps;
  isCancelButton?: boolean;
  onCancel?: () => void;
  cancelButtonProps?: ButtonProps;
  customContent?: (onOk?: () => void, onCancel?: () => void) => ReactNode;
}

export interface ModalReducerAction {
  type: MODAL_ACTION;
  payload?: AlertModalProps;
  id?: string;
}

export type ModalInitContext = (action: ModalReducerAction) => void

export const ModalContext = createContext<ModalInitContext>(()=>{});

export type ModalReducerType = (state: Array<Partial<AlertModalProps>>, action: ModalReducerAction) => Array<Partial<AlertModalProps>>

export interface CustomModalProps extends Partial<AlertModalProps> {
  dispatch: React.Dispatch<ModalReducerAction>;
}

export const CustomModal: FC<CustomModalProps> = (props) => {
  const { dispatch, title, description, onOk, okButtonProps, onCancel, cancelButtonProps, isCancelButton, type, customContent, ...anotherProps } = props
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  useEffect(()=>{
    onOpen()
  }, [])

  const onCloseHandler = (onClose: () => void, callback?: () => void) => {
    onClose()
    if(callback) callback()

    setTimeout(() => {
      props.dispatch({
        type: MODAL_ACTION.REMOVE_MODAL,
        id: props.id
      })
    }, 400)
  }

  const getIcon = () => {
    if(type === AlertModalType.SUCCESS) return <AntdSuccessIcon />
    else if(type === AlertModalType.ERROR) return <AntdErrorIcon />
    else if(type === AlertModalType.WARNING) return <AntdWarningIcon />
    else return <AntdInfoIcon />
  }

  return (
    <ThemeModal isOpen={isOpen} onOpenChange={onOpenChange} {...anotherProps}>
      <ModalContent>
        {(onClose) => 
          customContent ? customContent(() => onCloseHandler(onClose, onOk), () => onCloseHandler(onClose, onCancel)) :
          <Fragment>
            <ThemeModalHeader className="flex flex-row items-center gap-2">
              {getIcon()}
              <span>{title}</span>
            </ThemeModalHeader>
            <ThemeModalBody>
              {description}
            </ThemeModalBody>
            <ThemeModalFooter>
              {isCancelButton &&
                <ThemeButton color="danger" variant="light" onPress={()=> onCloseHandler(onClose, onCancel)}>
                  {cancelButtonProps?.children ?? 'Close'}
                </ThemeButton>
              }
              <ThemeButton 
                color={okButtonProps?.color ?? "primary" }
                onPress={()=> onCloseHandler(onClose, onOk)}
                size={okButtonProps?.size}
                radius={okButtonProps?.radius}
              >
                {okButtonProps?.children ?? 'Okay'}
              </ThemeButton>
            </ThemeModalFooter>
          </Fragment>
        }
      </ModalContent>
    </ThemeModal>
  )
}

const modalReducer: ModalReducerType = (state, action) => {
  switch (action.type) {
    case MODAL_ACTION.ADD_MODAL:
      return [...state, {...action.payload}];
    case MODAL_ACTION.REMOVE_MODAL:
      return state.filter(el => el.id !== action.id);
    default:
      return state
  }
}

const CustomModalProvider: FC<PropsWithChildren> = (props) => {
  const [state, dispatch] = useReducer(modalReducer, []);

  return(
    <ModalContext.Provider value={dispatch}>
      {props.children}
      {state.map((modal) => <CustomModal key={modal.id} dispatch={dispatch} {...modal} /> )}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const dispatch = useContext(ModalContext);

  return (props: Omit<AlertModalProps, "id">) => {
    dispatch({
      type: MODAL_ACTION.ADD_MODAL,
      payload: {
        id: v4(),
        ...props
      }
    })
  }
};

export default CustomModalProvider