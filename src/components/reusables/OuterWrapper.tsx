import { FC, PropsWithChildren, DetailedHTMLProps, HTMLAttributes, forwardRef } from "react"

export interface OuterWrapperProps extends PropsWithChildren, DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {

}

const OuterWrapper = forwardRef<HTMLDivElement, OuterWrapperProps>(({children, className, ...divProps}, ref) => {
  return <div ref={ref} className={`w-full flex items-center justify-center ${className ?? ""}`} {...divProps}>{children}</div>
})

OuterWrapper.displayName = "OuterWrapper"

export default OuterWrapper