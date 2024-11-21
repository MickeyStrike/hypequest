import { RootCreateProfile } from '@/components/reusables'
import React, { FC, PropsWithChildren } from 'react'

const LayoutCreateProfile: FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <RootCreateProfile>
      {children}
    </RootCreateProfile>
  )
}
export default LayoutCreateProfile
