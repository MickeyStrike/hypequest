import { FC, PropsWithChildren, DetailedHTMLProps, HTMLAttributes, forwardRef } from "react"

export interface InnerWrapperProps extends PropsWithChildren, DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  
}

const InnerWrapper = forwardRef<HTMLDivElement, InnerWrapperProps>(({children, className, ...divProps}, ref) => {
  return <div ref={ref} className={`w-11/12 xl:w-75 ${className ?? ""}`} {...divProps}>{children}</div>
})

InnerWrapper.displayName = "InnerWrapper"

export default InnerWrapper