import { useGlobalContext } from "@/providers/stores";
import { Progress } from "@nextui-org/react";
import { Roboto } from "next/font/google";
import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import { ThemeProgress } from "./NextuiTheme";
import { fixedNumber } from "@/helper";

const roboto700 = Roboto({weight: "700", subsets: ["latin"]})

export interface CustomProgressBarProps<T extends any> extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  items: Array<T>;
  renderItem: (item: T, index: number) => ReactNode;
  value: number;
}

const CustomProgressBar = <T extends any>(props: CustomProgressBarProps<T>) => {
  const { items, renderItem, className, value, ...anotherProps } = props
  const { state } = useGlobalContext()
  return (
    <div className={`flex flex-row items-center gap-4 w-full ${className ?? ""}`} {...anotherProps}>
      <span className={`${state.isLight ? 'text-black-900' : 'text-white'} ${roboto700.className} text-3xl`}>{fixedNumber(value, 3)}%</span>
      <div className="relative w-full flex items-center justify-center">
        <ThemeProgress 
          size="lg"
          value={value} 
          classNames={{
            base: "w-full absolute z-[0]",
            track: "drop-shadow-md border border-4 border-[#746B81]",
            indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
          }}
        />
        <div className="absolute w-full flex flex-row items-center justify-between z-[1]">
          {items.map((item,index) =>
            <div 
              className={`flex justify-end`}
              key={index}
              style={{
                width: `${100/(items.length)}%`
              }}
            >
              {renderItem(item, index)}
            </div>
          )}
        </div>
      </div>
      <span className={`${state.isLight ? 'text-black-900' : 'text-white'} ${roboto700.className} text-3xl`}>100%</span>
    </div>
  )
}

export default CustomProgressBar