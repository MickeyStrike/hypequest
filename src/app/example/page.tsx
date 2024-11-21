"use client";
import { NextPage } from "next";
import { InnerWrapper, OuterWrapper } from "@/components/reusables";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { Button } from "@nextui-org/react";

const ExamplePage: NextPage = () => {
  const { address, isConnecting, isDisconnected } = useAccount()
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: `Login ${'set data'}`, // signature hash can use for login, verify data, etc
  })
  return (
    <OuterWrapper>
      <InnerWrapper className='flex flex-col items-center justify-center py-[12rem] gap-2'>
        <ConnectButton /> {/* ToDo: Basic button for connect wallet */}
        <Button disabled={isLoading} onClick={() => signMessage()}> {/* ToDo: for implement signature hash */}
          Sign message ({ address })
        </Button>
        {isSuccess && <div>Signature: {data}</div>} {/* ToDo: result data can call to api backend for verify account and store data to database */}
        {isError && <div>Error signing message</div>}
        {/* ToDo: Custom button for connect wallet */}
        <ConnectButton.Custom> 
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <Button onClick={openConnectModal} type="button">
                        Connect Wallet
                      </Button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <Button onClick={openChainModal} type="button">
                        Wrong network
                      </Button>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Button
                        onClick={openChainModal}
                        style={{ display: 'flex', alignItems: 'center' }}
                        type="button"
                        variant="ghost"
                        color="primary"
                      >
                        {chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 12,
                              height: 12,
                              borderRadius: 999,
                              overflow: 'hidden',
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                style={{ width: 12, height: 12 }}
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </Button>

                      <Button 
                        onClick={openAccountModal} 
                        type="button"
                      >
                        {account.displayName}
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ''}
                      </Button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </InnerWrapper>
    </OuterWrapper>
  )
}

export default ExamplePage;