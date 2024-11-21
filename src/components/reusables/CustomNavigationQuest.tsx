import { useGlobalContext } from "@/providers/stores"
import { FC } from "react"
import { ThemeButton } from "./NextuiTheme"
import useClientService from "@/services/client-service";

export interface DataNavigation<T extends string> {
  title: string,
  url: T
}

export interface CustomNavigation<T extends string> {
  dataNavigation: DataNavigation<T>[],
  onClick: (type: T) => void,
  activeTab?: T;
}

const CustomNavigation = <T extends string>({ dataNavigation, onClick, activeTab }: CustomNavigation<T>) => {
  const { state } = useGlobalContext()
  
  return (
    <div className={`w-full flex gap-3 items-center gap-1 md:mb-0 ${state.isLight ? 'text-black' : 'text-white'}`}>
      <div className="flex items-center gap-1">
        {
          dataNavigation.map((x) => (
            <ThemeButton key={x.url} radius="full" size="sm" color={activeTab === x.url ? "warning" : "default"} onClick={() => onClick(x.url)}>
              {x.title}
            </ThemeButton>
          ))
        }
      </div>
    </div>
  )
}

export default CustomNavigation