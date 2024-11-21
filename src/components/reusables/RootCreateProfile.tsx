"use client"
import { InnerWrapper, OuterWrapper } from '@/components/reusables'
import CustomSidebar from '@/components/reusables/CustomSidebar'
import { useMinimizedState } from '@/helper'
import { FormContext, InitialFormProperties, initialFormProperties } from '@/providers/project-form-stores'
import { useGlobalContext } from '@/providers/stores'
import { DM_Sans } from '@next/font/google'
import { useSearchParams } from 'next/navigation'
import React, { FC, PropsWithChildren, useMemo } from 'react'

const dmSans900 = DM_Sans({weight: "900", subsets: ["latin"]})
const RootCreateProfile: FC<PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useMinimizedState<InitialFormProperties>(initialFormProperties)
  const globalStore = useGlobalContext()
  const params = useSearchParams()
  const providerMemoized = useMemo(()=>({state, dispatch}), [state])
  const questBoardId = params.get("questBoardId")
  const isCreate = params.get("isCreate")

  const isCreateSingleQb = !!(questBoardId || isCreate)
  return (
    <FormContext.Provider value={providerMemoized}>
      <OuterWrapper>
        <InnerWrapper className='flex flex-col py-[4rem] gap-7'>
          <div className={`w-full ${globalStore.state.isLight ? 'text-black-900' : 'text-white'} ${dmSans900.className} text-5xl`}>
            {state.title}
          </div>
          {isCreateSingleQb ? children :
            <div className="flex flex-col lg:flex-row gap-5">
              <CustomSidebar />
              {children}
            </div>
          }
        </InnerWrapper>
      </OuterWrapper>
    </FormContext.Provider>
  )
}
export default RootCreateProfile
