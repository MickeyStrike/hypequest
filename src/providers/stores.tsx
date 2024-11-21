"use client"
import { IGetProfile } from "@/types/service-types";
import { JSONSchemaType, Schema } from "ajv";
import { createContext, Dispatch, useContext } from "react"

export interface GlobalState {
  topBarHeight: number;
  isTop: boolean;
  isLight: boolean;
  title: string;
  withSidebar: boolean;
  token: string;
  profile?: IGetProfile;
  chains: Array<number>;
  isSignatureLoading: boolean;
  showMenu: boolean
}

export const initialGlobalState: GlobalState = {
  topBarHeight: 0,
  isTop: true,
  isLight: false,
  title: '',
  withSidebar: false,
  token: '',
  chains: [],
  isSignatureLoading: false,
  showMenu: false
}

export const schema: Schema | JSONSchemaType<GlobalState> = {
  properties: {
    topBarHeight: {
      type: "number",
      default: 0,
      nullable: false
    },
    isTop: {
      type: "boolean",
      default: true,
      nullable: false
    },
    isLight: {
      type: "boolean",
      default: false,
      nullable: false
    },
    title: {
      type: "string",
      default: "",
      nullable: false
    },
    withSidebar: {
      type: "boolean",
      default: false,
      nullable: false
    },
    token: {
      type: "string",
      default: "",
      nullable: false
    },
    profile: {
      type: "object",
      default: null,
      nullable: true
    },
    chains: {
      type: "array",
      default: [],
      nullable: false
    },
    isSignatureLoading: {
      type: "boolean",
      default: false,
      nullable: false
    }
  }
}

export interface InitialContext {
  state: GlobalState;
  dispatch: Dispatch<Partial<GlobalState>>;
}

export const GlobalContext = createContext<InitialContext>({
  state: initialGlobalState,
  dispatch: () => {}
})

export const useGlobalContext = () => useContext(GlobalContext)