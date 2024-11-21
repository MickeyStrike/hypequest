import { Dispatch, createContext, useContext } from "react";

export interface InitialFormProperties {
  title: string;
}

export const initialFormProperties: InitialFormProperties = {
  title: ""
}

export interface InitialFormContext {
  state: InitialFormProperties;
  dispatch: Dispatch<Partial<InitialFormProperties>>;
}

export const FormContext = createContext<InitialFormContext>({
  state: initialFormProperties,
  dispatch: () => {}
})

export const useFormContext = () => useContext(FormContext)