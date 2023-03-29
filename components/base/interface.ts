export interface Child {
    tokenId: number,
    contractAddress: string
}

export interface ChildDetail {
    parentTokenId: number
    contractAddress: string,
    tokenId: number,
    name: string,
    imageUrl: string,
    externalLink: string | undefined,
    description: string | undefined
}

export interface ContractInfo {
    name: string,
    description: string,
    image: string
    external_link: string
}

export interface AcceptedChild {
    contractAddress: string, 
    childTokenId: number,
    contractName: string | undefined,
    description: string | undefined,
    image: string | undefined
}