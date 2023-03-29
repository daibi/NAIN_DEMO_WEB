import { Child, AcceptedChild } from "@/components/base/interface";
import React, { useState } from 'react';
import QRCode from "qrcode.react";

export interface NFT {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  pendingChildren? : boolean;
  acceptedChildren?: AcceptedChild[];
}
  
interface GalleryProps {
  nfts: NFT[];
  onViewingAirdrop: (tokenId: number) => Promise<void>;
}

interface childNFTHoverContent {
  contractName?: string | undefined,
  description?: string | undefined,
  tokenId?: number
}

const Gallery: React.FC<GalleryProps> = ({ nfts, onViewingAirdrop  }) => {

  const [hoveredChildNFT, setHoveredChildNFT] = React.useState<childNFTHoverContent>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [qrData, setQrData] = useState("");

  const handleBadgeClick = (event: any, child: AcceptedChild) => {
    event.stopPropagation();
    setQrData(`Contract: ${child.contractAddress}, ID: ${child.childTokenId}`);
    setModalVisible(true);
  };

  const handleChildNFTMouseEnter = (contractName: string | undefined, description: string | undefined, tokenId: number) => {
    setHoveredChildNFT({ contractName, description, tokenId });
  };

  const handleChildNFTMouseLeave = () => {
    setHoveredChildNFT({});
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {nfts.map((nft) => (
        <div key={nft.id} className="relative bg-white rounded-lg overflow-hidden shadow-lg">
          <img className="w-full" src={nft.imageUrl} alt={nft.name} />
          {nft.pendingChildren && (
            <div className="animate-ping absolute top-1.5 right-1.5 block h-1 w-1 rounded-full ring-2 ring-red-600 bg-red-900"></div>
          )}
          <div className="p-4">
            <div className="flex justify-between">
              <h2 className="text-lg font-medium text-gray-900">{nft.name}</h2>
              {nft.pendingChildren && (
                <div className="w-32 items-center justify-end">
                  <button
                    className="text-xs font-bold h-8 rounded-full text-red-600 items-center flex focus:outline-none"
                    style={{ zIndex: 2 }}
                    onClick={ () => onViewingAirdrop(nft.id)}
                  >
                    <span>
                      New Airdrop!
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 border-b-2 border-gray-300 pb-1">{nft.description}</p>
            <div className="text-sm text-gray-500 font-medium mr-2.5 mb-2">Received Airdrop:</div>            
            {nft.acceptedChildren?.map((childNFT) => (
                <div
                  key={`${nft.name}-${nft.id}-${childNFT.childTokenId}`}
                  className="relative w-8 h-8 mr-2 mb-2"
                  onMouseEnter={() => handleChildNFTMouseEnter(childNFT.contractName, childNFT.description, childNFT.childTokenId)}
                  onMouseLeave={handleChildNFTMouseLeave}
                  onClick={(event) => handleBadgeClick(event, childNFT)}
                >
                  <img
                    src={childNFT.image}
                    alt={`${childNFT.contractName} - ${childNFT.childTokenId}`}
                    className="w-full h-full object-contain rounded-full"
                  />
                  {hoveredChildNFT && hoveredChildNFT.tokenId == childNFT.childTokenId &&
                     (
                      <div className="absolute bottom-full left-16 w-40 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-2 text-sm">
                        <div className="text-gray-700 font-bold">{childNFT.contractName}</div>
                        <div className="text-gray-500">{childNFT.description}</div>
                      </div>
                    )}
                </div>
              ))}
          </div>
        </div>
      ))}
      {modalVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setModalVisible(false)}
        >
          <div
            className="bg-white rounded-lg p-4 text-center"
            onClick={(event) => event.stopPropagation()}
          >
            <QRCode value={qrData} size={200} />
            <div className="text-sm mt-2">{qrData}</div>
          </div>
        </div>
      )}
    </div>
  );
};

  
export default Gallery;