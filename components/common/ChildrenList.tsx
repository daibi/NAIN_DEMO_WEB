import { ChildDetail } from '@/components/base/interface';
import React, { useState } from 'react';

type ChildrenListProps = {
  pendingChildren: ChildDetail[];
  handleAccept: (tokenId: number, childIndex: number, childAddress: string, childTokenId: number) => Promise<void>
};

const PendingChildrenList: React.FC<ChildrenListProps> = ({ pendingChildren, handleAccept }) => {

    const [loading, setLoading] = useState(false);

    const handleAcceptClick = async (tokenId: number, childIndex: number, childAddress: string, childTokenId: number) => {
      setLoading(true);
      await handleAccept(tokenId, childIndex, childAddress, childTokenId);
      setLoading(false);
    };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-2xl font-medium mb-4">Pending Children</h2>
      {pendingChildren.map((child, index) => (
        <div key={`${child.contractAddress}-${child.tokenId}`} className="flex items-center justify-between p-4 border-b border-gray-300">
            <div className="flex items-center space-x-4">
            <img src={child.imageUrl} alt="" className="h-16 w-16 object-cover rounded" />
            <div>
                <p className="font-medium">{child.name}</p>
                <p className="text-gray-500">{child.description}</p>
            </div>
            </div>
            <button  
                onClick={() => handleAcceptClick(child.parentTokenId, index, child.contractAddress, child.tokenId)}
                disabled={loading}
                className={`bg-green-500 text-white px-4 py-2 rounded-lg mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
            Accept it
            </button>
        </div>
      ))}
    </div>
  );
};

export default PendingChildrenList;
