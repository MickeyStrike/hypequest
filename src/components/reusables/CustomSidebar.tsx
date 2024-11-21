import { FC, useMemo } from "react"
import { ThemeListbox } from "./NextuiTheme"
import { ListboxItem } from "@nextui-org/react"
import { menuSidebar } from "@/localeData/menu"
import { usePathname, useRouter } from "next/navigation"
import { useGlobalContext } from "@/providers/stores"

export interface CustomSidebar {
  
}

const CustomSidebar: FC<CustomSidebar> = (props) => {
  const router = useRouter()
  const pathname = usePathname();
  const globalContext = useGlobalContext()

  const handleChangeUrl = (url: string) => {
    router.push(url)
  }

  const selectedBoxColor = useMemo(()=>{
    if(globalContext.state.isLight) return "border-[#631AFF] text-[#631AFF]"
    else return "border-[#ffd7004d] text-[#FFD700]"
  }, [globalContext.state.isLight])

  const unselectedBoxColor = useMemo(()=>{
    if(globalContext.state.isLight) return "border-black text-black"
    else return "border-[#ffffff66] text-white"
  }, [globalContext.state.isLight])

  return (
    <div className="flex flex-col items-center gap-2 text-white">
      <div className="w-full flex flex-col min-w-[15rem]">
        <ThemeListbox
          aria-label="Listbox Variants"
          color={"default"} 
          variant={"faded"}
          classNames={{
            list: "gap-3"
          }}
        >
          {
            menuSidebar.map((x) => (
              <ListboxItem 
                key={x.url} 
                className={x.url === pathname ? selectedBoxColor : unselectedBoxColor} 
                // onClick={() => handleChangeUrl(x.url)}
              >
                {x.title}
              </ListboxItem>
            ))
          }
        </ThemeListbox>
      </div>
    </div>
  )
}

export default CustomSidebar