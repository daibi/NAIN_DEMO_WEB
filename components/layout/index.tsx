import { FADE_IN_ANIMATION_SETTINGS } from "@/lib/constants";
import { AnimatePresence, motion } from "framer-motion";
import Web3 from 'web3';
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useRef, useState, useEffect } from "react";
import useScroll from "@/lib/hooks/use-scroll";
import Meta from "./meta";
import detectEthereumProvider from '@metamask/detect-provider';
import Jazzicon from 'react-jazzicon'

export default function Layout({
  meta,
  children,
}: {
  meta?: {
    title?: string;
    description?: string;
    image?: string;
  };
  children: ReactNode;
}) {
  const provider = useRef<number | null | undefined>(1);
  let [wallet, setWallet] = useState<string[]>();
  const [web3, setWeb3] = useState<Web3>()
  const scrolled = useScroll(50);

  console.log('wallet: ', wallet, ' test: ', !wallet);

  useEffect(()=>{
    if(!web3){
      loadWeb3();
    }
  }, [])

  /**
   * page initialize 
   */
  const loadWeb3 = async ()=>{
    if (typeof window.ethereum !== 'undefined') {
      setWeb3(new Web3(window.ethereum))
      setWallet(await window.ethereum.request({ method: 'eth_requestAccounts' }))
    }
  }

  /** 
   * handle metamask connection
   */
  const handleMask = async () => {
    if (provider.current === 1) {
      provider.current = await detectEthereumProvider();
    }
    if (provider.current) {
      // connect to wallet 
      setWallet(await window.ethereum.request({ method: 'eth_requestAccounts' }))
      console.log('用户钱包地址', wallet)
    }
  } 

  return (
    <>
      <Meta {...meta} />
      <div className="fixed h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-100" />
      <div
        className={`fixed top-0 w-full ${
          scrolled
            ? "border-b border-gray-200 bg-white/50 backdrop-blur-xl"
            : "bg-white/0"
        } z-30 transition-all`}
      >
        <div className="mx-5 flex h-16 max-w-screen-xl items-center justify-between xl:mx-auto">
          <Link href="/" className="flex items-center font-display text-2xl">
            <Image
              src="/logo.png"
              alt="Precedent logo"
              width="30"
              height="30"
              className="mr-2 rounded-sm"
            ></Image>
            <p>Project Oracle</p>
          </Link>
          <div>
            <AnimatePresence>
              {!wallet? (
                <motion.button
                  className="rounded-full border border-black bg-black p-1.5 px-4 text-sm text-white transition-all hover:bg-white hover:text-black"
                  onClick={() => handleMask()}
                  {...FADE_IN_ANIMATION_SETTINGS}
                >
                  Connect to Wallet
                </motion.button>
              ) : (
                <>
                  <div className="flex items-center">
                    <div className="flex"> 
                      <div style={{marginRight: 2, marginTop: 2}}>
                        <Jazzicon diameter={20} seed={parseInt(wallet[0].slice(2, 10), 16)} />
                      </div>
                      <div>
                        {shortAddress(wallet[0])}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <main className="flex w-full flex-col items-center justify-center py-32">
        {children}
      </main>
    </>
  );
}


const shortAddress = (address: string) => {
  return address.slice(0,5) + "..." + address.slice(-5)
}