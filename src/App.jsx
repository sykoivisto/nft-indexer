import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Alchemy, Network } from "alchemy-sdk";
import { useState } from "react";

import { ethers } from "ethers";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  async function getNFTsForOwner() {
    setIsLoading(true);

    if (ethers.utils.isAddress(userAddress)) {
      try {
        const config = {
          apiKey: import.meta.env.REACT_APP_API_KEY,
          network: Network.ETH_MAINNET,
        };

        const alchemy = new Alchemy(config);
        const data = await alchemy.nft.getNftsForOwner(userAddress);
        setResults(data);

        const tokenDataPromises = [];

        for (let i = 0; i < data.ownedNfts.length; i++) {
          const tokenData = alchemy.nft.getNftMetadata(
            data.ownedNfts[i].contract.address,
            data.ownedNfts[i].tokenId
          );
          tokenDataPromises.push(tokenData);
        }

        setTokenDataObjects(await Promise.all(tokenDataPromises));
        setHasQueried(true);
      } catch (err) {
        console.log(err);
        toast({
          title: "Error",
          description:
            "An error has occurred. Please check your address and try again",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Invalid address",
        description: "Please enter a valid address",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }

    setIsLoading(false);
  }
  return (
    <div className="container p-1">
      <div className="row text-center d-flex flex-column align-items-center align-self-center">
        <h1 className="my-4">NFT Indexer</h1>
        <p className="my-1">Get all ERC-721 tokens of this address:</p>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
          placeholder={"0x . . ."}
        />
        <Button fontSize={20} onClick={getNFTsForOwner} className="mt-2">
          Fetch NFTs
        </Button>
      </div>
      <div className="row text-center d-flex flex-column align-items-center mt-5">
        <h3 className="mb-3">ERC-20 token balances:</h3>
        {isLoading ? <Spinner w={50} h={50} p={20}></Spinner> : null}
        {hasQueried ? (
          <SimpleGrid minChildWidth="120px">
            {results.ownedNfts.map((e, i) => {
              return (
                <div key={i} className="container d-flex flex-column max">
                  <Box>
                    <b>Name:</b>{" "}
                    {tokenDataObjects[i].title?.length === 0
                      ? "No Name"
                      : tokenDataObjects[i].title}
                  </Box>
                  <Image
                    src={
                      tokenDataObjects[i]?.rawMetadata?.image ??
                      "https://via.placeholder.com/200"
                    }
                    height={100}
                    width={100}
                    alt={
                      tokenDataObjects[i].title?.length === 0
                        ? "No Name"
                        : tokenDataObjects[i].title
                    }
                    className="align-self-center"
                  />
                  <Image />
                </div>
              );
            })}
          </SimpleGrid>
        ) : (
          "Please make a query!"
        )}
      </div>
    </div>
  );
}

export default App;
