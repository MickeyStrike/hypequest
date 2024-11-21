import CONSTANT from '@/Constant';
import './globals.css'
import { RootComponent } from "@/components/reusables";
import { Metadata } from 'next';
import { FC, Fragment, PropsWithChildren } from 'react'
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL(CONSTANT.FE_BASE_URL),
  title: 'Embark on the Ultimate Quest with HypeQuest: Earn Rewards for Your Projects',
  description: 'Join HypeQuest, the platform where projects come to life through a quest to earn! Unleash the potential of your ideas, collaborate with a community of creators, and earn exciting rewards. Dive into a world where innovation meets earning – start your HypeQuest today!',
  keywords: CONSTANT.DEFAULT_KEYWORDS
}

const RootLayout: FC<PropsWithChildren> = async ({
  children,
}) => {

  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_GA &&
          <Fragment>
            <Script
              id="gtm-link"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA}`}
            />
            <Script
              id="google-datalayer"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                
                  gtag('config', '${process.env.NEXT_PUBLIC_GA}');          
                `,
              }}
            />
          </Fragment>
        }
        {process.env.NEXT_PUBLIC_HJ && 
          <Script
            id="jira-hotjar"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HJ},hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');         
              `,
            }}
          />
        }
      </head>
      <RootComponent>{children}</RootComponent>
    </html>
  )
}

export default RootLayout
