
import Layout from "@/components/layout";
import Balancer from "react-wrap-balancer";
import { motion } from "framer-motion";
import { DEPLOY_URL, FADE_DOWN_ANIMATION_VARIANTS } from "@/lib/constants";
import { useState, useEffect } from "react";
import { Twitter } from "@/components/shared/icons";
import Web3 from 'web3';
import RMRKMintAndBurnFacet from 'abi/RMRKMintAndBurnFacet.json';
import RMRKNestableFacet from 'abi/RMRKNestableFacet.json';
import LibERC721 from 'abi/LibERC721.json';
import LibNestable from 'abi/LibNestable.json';
import Ticket1 from "Ticket1.json";
import Ticket2 from "Ticket2.json";
import { AbiItem } from 'web3-utils'
import MessageCard from "@/components/common/MessageCard";
import Gallery, { NFT } from "@/components/common/Gallery";
import { Child, ChildDetail, ContractInfo, AcceptedChild } from "@/components/base/interface";
import PendingChildrenList from "@/components/common/ChildrenList";


export default function Home() {
  const [isMinting, setIsMinting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showPendingChildren, setShowPendingChildren] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  let [tick1Info, setTick1Info] = useState<ContractInfo>();
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [pendingChildren, setPendingChildren] = useState<ChildDetail[]>([]);
  const web3 = new Web3(Web3.givenProvider);
  const contractAddress = '0xdb211f4CB3d1a3BC904e47f7A7c7932312ABD24a'; 
  const ticket1Address = '0x676CF9E45dfa1297fb2039E39A63d42498CFc8cC';
  const ticket2Address = '0x55754A452C357e20a792E370628ba4496760d317';
  const rmrkMintAndBurnFacet = new web3.eth.Contract(RMRKMintAndBurnFacet.abi as AbiItem[], contractAddress)
  const rmrkNestableFacet = new web3.eth.Contract(RMRKNestableFacet.abi as AbiItem[], contractAddress)
  const libERC721 = new web3.eth.Contract(LibERC721.abi as AbiItem[], contractAddress)
  const libNestable = new web3.eth.Contract(LibNestable.abi as AbiItem[], contractAddress)
  const ticket1 = new web3.eth.Contract(Ticket1.abi as AbiItem[], ticket1Address);
  const ticket2 = new web3.eth.Contract(Ticket1.abi as AbiItem[], ticket2Address);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
      if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
      setShowMessage(false);
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
    return () => clearTimeout(timer);
  }}, [successMessage, errorMessage]);

  useEffect(()=>{
    console.log("@#@#@#@#@#@#@#", nfts)
  }, [nfts])

  useEffect(() => {
    async function loadTick1Info() {
      const contractURI: string = await ticket1.methods['contractURI']().call();
      const response = await fetch(contractURI);
      const data = await response.json();
      setTick1Info(data);
    }
    
    loadTick1Info();
  }, [ticket1Address])

  const handleMint = async () => {
    setIsMinting(true);
    setErrorMessage("");
    setSuccessMessage("");
    setShowMessage(true);

    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];

    console.log("current account: ", account);

    const value = web3.utils.toWei("0.01", "ether");

    rmrkMintAndBurnFacet.methods['mint'](account).send({ from: account, value: value })
    .on("transactionHash", (hash: string) => {
      libERC721.events.Transfer({}, async (error: any, event: any) => {
        console.log("~~~~~~~~~~event: ", event);
        setSuccessMessage("Minting success!");
        setIsMinting(false);
      })
    })
    .on("error", (error: any) => {
      console.error(`Minting error: ${error.message}`);
      setIsMinting(false);
      setErrorMessage(`Minting error: ${error.message}`);
      setShowMessage(true);
    });
  }

  const handleFetchNFTs = async () => {
    setIsFetching(true);
    setShowMessage(true);
    setErrorMessage("");
    setShowPendingChildren(false);
    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];
    try {
      const balance = await rmrkNestableFacet.methods['balanceOf'](account).call()
      console.log("balance of ", account, ": ", balance)
      const nftList : NFT[] = [];
      for (let index = 0; index < balance; index++) {
        const {tokenId, tokenUri} = await rmrkNestableFacet.methods['getOwnerCollectionByIndex'](account, index).call();
        console.log("query result: tokenId: ", tokenId, " tokenUri ", tokenUri)
        
        // fetch token Uri info to show image and name
        const tokenInfo = await (await fetch(tokenUri)).json()
        // query pending child
        const pendingChildren: Child[] = await rmrkNestableFacet.methods['pendingChildrenOf'](tokenId).call();
        console.log("child list of tokenId ", tokenId, ":", pendingChildren)

        // query accepted children
        const acceptedChildren: Child[] = await rmrkNestableFacet.methods['childrenOf'](tokenId).call();
        const acceptedChildrenDetail: AcceptedChild[] = [];
        
        // query children NFT
        for (let childrenIndex = 0; childrenIndex < acceptedChildren.length; childrenIndex++) {
          if (acceptedChildren[childrenIndex].contractAddress == ticket1Address) {
            const accepetedChildInfo : AcceptedChild = {
              contractAddress: acceptedChildren[childrenIndex].contractAddress,
              childTokenId: acceptedChildren[childrenIndex].tokenId,
              image: tick1Info?.image,
              contractName: tick1Info?.name,
              description: tick1Info?.description
            } 
            acceptedChildrenDetail.push(accepetedChildInfo);
          }
        }

        const nftInfo: NFT = {
          id: tokenId.toString(),
          name: tokenInfo.name,
          description: tokenInfo.description,
          imageUrl: tokenInfo.image,
          pendingChildren: pendingChildren.length > 0,
          acceptedChildren: acceptedChildrenDetail
        };
        nftList.push(nftInfo);
      }
      console.log("nfts.length: ", nftList.length)
      setNFTs(()=>{
        return [
          ...nftList        
        ]
      })

      setShowGallery(true);
      // setNFTs([
      //   ...nftList
      // ]);
    } catch (error: any) {
      setErrorMessage(`Error loading NFTs: ${error.message}`);
    } finally {
      // console.log("handle finally nftList>>>>>>", nfts)
      setIsFetching(false);
    }
  }

  const fetchPendingChildren = async (parentTokenId: number) => {
    setIsFetching(true);
    setShowMessage(true);
    setShowGallery(false);
    setErrorMessage("");
    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];
    try {
      const pendingChildren: Child[] = await rmrkNestableFacet.methods['pendingChildrenOf'](parentTokenId).call({from: account});
      const pendingChildrenDetail: ChildDetail[] = [];

      for (let i = 0; i < pendingChildren.length; i++) {
        const {tokenId, contractAddress} = pendingChildren[i];
        if (contractAddress == ticket1Address) {
          console.log("fetch ticket1 child detail...", tokenId, "tickInfo: ", tick1Info);
          let tokenUri: string = await ticket1.methods['tokenURI'](tokenId).call({from: account});
          const pendingChildInfo : ChildDetail = {
            parentTokenId,
            contractAddress, 
            tokenId, 
            name: `The One Event - #${tokenId}`,
            imageUrl: tokenUri,
            externalLink: tick1Info?.external_link,
            description: tick1Info?.description
          } 
          console.log("pending child: ", pendingChildInfo)
          pendingChildrenDetail.push(pendingChildInfo);
        }
      }

      setPendingChildren(() => {return [...pendingChildrenDetail]});
      setShowPendingChildren(true);
    } catch (error: any) {
      setErrorMessage(`Error loading NFTs: ${error.message}`);
    } finally {
      // console.log("handle finally nftList>>>>>>", nfts)
      setIsFetching(false);
    }
  }

  const handleAcceptChildren = async (tokenId: number, childIndex: number, childAddress: string, childTokenId: number) => {
    setIsAccepting(true);
    setErrorMessage("");
    setSuccessMessage("");
    setShowMessage(true);

    setShowPendingChildren(false);

    const accounts = await web3.eth.requestAccounts();
    const account = accounts[0];

    console.log("current account: ", account, "tokenId: ", tokenId, " childIndex: ", childIndex, " childAddress: ", childAddress, " childTokenId: ", childTokenId);
    try {
      await rmrkNestableFacet.methods['acceptChild'](tokenId, childIndex, childAddress, childTokenId).send({ from: account })
      .on("transactionHash", (hash: string) => {
        libNestable.events.ChildAccepted({}, async (error: any, event: any) => {
          console.log("~~~~~~~~~~event: ", event);
          setSuccessMessage("Accepting success!");
          setIsAccepting(false);
        })
      })
      .on("error", (error: any) => {
        console.error(`accepting error: ${error.message}`);
        setIsAccepting(false);
        setErrorMessage(`accepting error: ${error.message}`);
        setShowMessage(true);
      });

      await handleFetchNFTs();

      setShowGallery(true);
    } catch (error: any) {
      setErrorMessage(`Error accepting sub NFT: ${error.message}`);
    } finally {
      // console.log("handle finally nftList>>>>>>", nfts)
      setIsFetching(false);
    }
  }

  const handleOnClose = () => {
    setShowMessage(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  return (
    <Layout>
      {isMinting && showMessage && <MessageCard message="Minting in progress..." type="loading" onClose={handleOnClose} />}
      {isFetching && showMessage && <MessageCard message="Fetching in progress..." type="loading" onClose={handleOnClose} />}
      {isAccepting && showMessage && <MessageCard message="Accepting child in progress..." type="loading" onClose={handleOnClose} />}
      {successMessage && showMessage && <MessageCard message={successMessage} type="success" onClose={handleOnClose} />}
      {errorMessage && showMessage && <MessageCard message={errorMessage} type="error" onClose={handleOnClose} />}  
      <motion.div
        className="max-w-xl px-5 xl:px-0"
        initial="hidden"
        whileInView="show"
        animate="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        <motion.a
          variants={FADE_DOWN_ANIMATION_VARIANTS}
          href="https://twitter.com/steventey/status/1613928948915920896"
          target="_blank"
          rel="noreferrer"
          className="mx-auto mb-5 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full bg-blue-100 px-7 py-2 transition-colors hover:bg-blue-200"
        >
          <Twitter className="h-5 w-5 text-[#1d9bf0]" />
          <p className="text-sm font-semibold text-[#1d9bf0]">
            Introducing Precedent
          </p>
        </motion.a>
        <motion.h1
          className="bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          <Balancer>Project Oracle Your Next NFT</Balancer>
        </motion.h1>
        <motion.p
          className="mt-6 text-center text-gray-500 md:text-xl"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          <Balancer>
            An NFT for connection with your neighborhood and with some real-life impacts
          </Balancer>
        </motion.p>
        <motion.div
          className="mx-auto mt-6 flex items-center justify-center space-x-5"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          <motion.button
            className="group flex max-w-fit items-center justify-center space-x-2 rounded-full border border-black bg-black px-5 py-2 text-sm text-white transition-colors hover:bg-white hover:text-black"
            onClick={handleMint}
            disabled={isMinting}
          >
            <svg
              className="h-4 w-4 group-hover:text-black"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L20 20H4L12 4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p>Mint</p>
          </motion.button>
          <motion.button
            className="flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm text-gray-600 shadow-md transition-colors hover:border-gray-800"
            onClick={handleFetchNFTs}
            disabled={isFetching}
          >
            <p>View Collection</p>
          </motion.button>
        </motion.div>
        {/* <div>hello</div> */}
        <div>
          {showGallery && nfts.length > 0 && <div className="absolute left-0 right-0 m-7">
            <Gallery nfts={ nfts } onViewingAirdrop = { fetchPendingChildren } />
          
          </div>} 
          {showPendingChildren && pendingChildren.length > 0 && <div className="absolute left-0 right-0 m-7">
            <PendingChildrenList pendingChildren = {pendingChildren} handleAccept = {handleAcceptChildren} />
          
          </div>} 
        </div>
      </motion.div>
    </Layout>
  );
}