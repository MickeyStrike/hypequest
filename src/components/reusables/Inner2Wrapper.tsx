import { FC, PropsWithChildren, DetailedHTMLProps, HTMLAttributes, forwardRef } from "react"

export interface InnerWrapperProps extends PropsWithChildren, DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  
}

const Inner2Wrapper = forwardRef<HTMLDivElement, InnerWrapperProps>(({children, className, ...divProps}, ref) => {
  return <div ref={ref} className={`w-11/12 xl:w-90 ${className ?? ""}`} {...divProps}>{children}</div>
})

Inner2Wrapper.displayName = "InnerWrapper"

export default Inner2Wrapper