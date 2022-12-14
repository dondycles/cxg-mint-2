import {
  useActiveClaimConditionForWallet,
  useAddress,
  useClaimConditions,
  useClaimerProofs,
  useClaimIneligibilityReasons,
  useContract,
  useContractMetadata,
  useTotalCirculatingSupply,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, utils } from "ethers";
import type { NextPage } from "next";
import { useMemo, useState } from "react";
import styles from "../styles/Theme.module.css";
import { parseIneligibility } from "../utils/parseIneligibility";
import Head from "next/head";

import Socmed from "../components/socmeds";
import Background from "../components/background";

// Put Your Edition Drop Contract address from the dashboard here
const myEditionDropContractAddress =
  "0xDC8017E1E20BFF80a49B0B92F719f00170013B4F";

// Put your token ID here
const tokenId = 0;

const Home: NextPage = () => {
  const address = useAddress();
  const [quantity, setQuantity] = useState(1);
  const { contract: editionDrop } = useContract(myEditionDropContractAddress);
  const { data: contractMetadata } = useContractMetadata(editionDrop);

  const claimConditions = useClaimConditions(editionDrop);
  const activeClaimCondition = useActiveClaimConditionForWallet(
    editionDrop,
    address,
    tokenId
  );
  const claimerProofs = useClaimerProofs(editionDrop, address || "", tokenId);
  const claimIneligibilityReasons = useClaimIneligibilityReasons(
    editionDrop,
    {
      quantity,
      walletAddress: address || "",
    },
    tokenId
  );

  const claimedSupply = useTotalCirculatingSupply(editionDrop, tokenId);

  const totalAvailableSupply = useMemo(() => {
    try {
      return BigNumber.from(activeClaimCondition.data?.availableSupply || 0);
    } catch {
      return BigNumber.from(1_000_000);
    }
  }, [activeClaimCondition.data?.availableSupply]);

  const numberClaimed = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0).toString();
  }, [claimedSupply]);

  const numberTotal = useMemo(() => {
    const n = totalAvailableSupply.add(BigNumber.from(claimedSupply.data || 0));
    if (n.gte(1_000_000)) {
      return "";
    }
    return n.toString();
  }, [totalAvailableSupply, claimedSupply]);

  const priceToMint = useMemo(() => {
    const bnPrice = BigNumber.from(
      activeClaimCondition.data?.currencyMetadata.value || 0
    );
    return `${utils.formatUnits(
      bnPrice.mul(quantity).toString(),
      activeClaimCondition.data?.currencyMetadata.decimals || 18
    )} ${activeClaimCondition.data?.currencyMetadata.symbol}`;
  }, [
    activeClaimCondition.data?.currencyMetadata.decimals,
    activeClaimCondition.data?.currencyMetadata.symbol,
    activeClaimCondition.data?.currencyMetadata.value,
    quantity,
  ]);

  const maxClaimable = useMemo(() => {
    let bnMaxClaimable;
    try {
      bnMaxClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimableSupply || 0
      );
    } catch (e) {
      bnMaxClaimable = BigNumber.from(1_000_000);
    }

    let perTransactionClaimable;
    try {
      perTransactionClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimablePerWallet || 0
      );
    } catch (e) {
      perTransactionClaimable = BigNumber.from(1_000_000);
    }

    if (perTransactionClaimable.lte(bnMaxClaimable)) {
      bnMaxClaimable = perTransactionClaimable;
    }

    const snapshotClaimable = claimerProofs.data?.maxClaimable;

    if (snapshotClaimable) {
      if (snapshotClaimable === "0") {
        // allowed unlimited for the snapshot
        bnMaxClaimable = BigNumber.from(1_000_000);
      } else {
        try {
          bnMaxClaimable = BigNumber.from(snapshotClaimable);
        } catch (e) {
          // fall back to default case
        }
      }
    }

    let max;
    if (totalAvailableSupply.lt(bnMaxClaimable)) {
      max = totalAvailableSupply;
    } else {
      max = bnMaxClaimable;
    }

    if (max.gte(1_000_000)) {
      return 1_000_000;
    }
    return max.toNumber();
  }, [
    claimerProofs.data?.maxClaimable,
    totalAvailableSupply,
    activeClaimCondition.data?.maxClaimableSupply,
    activeClaimCondition.data?.maxClaimablePerWallet,
  ]);

  const isSoldOut = useMemo(() => {
    try {
      return (
        (activeClaimCondition.isSuccess &&
          BigNumber.from(activeClaimCondition.data?.availableSupply || 0).lte(
            0
          )) ||
        numberClaimed === numberTotal
      );
    } catch (e) {
      return false;
    }
  }, [
    activeClaimCondition.data?.availableSupply,
    activeClaimCondition.isSuccess,
    numberClaimed,
    numberTotal,
  ]);

  const canClaim = useMemo(() => {
    return (
      activeClaimCondition.isSuccess &&
      claimIneligibilityReasons.isSuccess &&
      claimIneligibilityReasons.data?.length === 0 &&
      !isSoldOut
    );
  }, [
    activeClaimCondition.isSuccess,
    claimIneligibilityReasons.data?.length,
    claimIneligibilityReasons.isSuccess,
    isSoldOut,
  ]);

  const isLoading = useMemo(() => {
    return (
      activeClaimCondition.isLoading || claimedSupply.isLoading || !editionDrop
    );
  }, [activeClaimCondition.isLoading, editionDrop, claimedSupply.isLoading]);

  const buttonLoading = useMemo(
    () => isLoading || claimIneligibilityReasons.isLoading,
    [claimIneligibilityReasons.isLoading, isLoading]
  );
  const buttonText = useMemo(() => {
    if (isSoldOut) {
      return "Sold Out";
    }

    if (canClaim) {
      const pricePerToken = BigNumber.from(
        activeClaimCondition.data?.currencyMetadata.value || 0
      );
      if (pricePerToken.eq(0)) {
        return "Mint (Free)";
      }
      return `Mint (${priceToMint})`;
    }
    if (claimIneligibilityReasons.data?.length) {
      return parseIneligibility(claimIneligibilityReasons.data, quantity);
    }
    if (buttonLoading) {
      return "Checking eligibility...";
    }

    return "Claiming not available";
  }, [
    isSoldOut,
    canClaim,
    claimIneligibilityReasons.data,
    buttonLoading,
    activeClaimCondition.data?.currencyMetadata.value,
    priceToMint,
    quantity,
  ]);

  const [startMint, setStartMint] = useState(false);

  return (
    <>
      <Head>
        <title>Studio CXGNUS</title>
      </Head>
      <Socmed />
      <audio id="audioPlayer" className=" hidden" src="../aud/ost3.mp3"></audio>

      <Background />

      <main className="flex absolute top-0 bottom-0 left-0 right-0 ">
        {/*Inital mint card*/}
        <div
          className={`flex flex-col items-center justify-center fixed top-0 left-0 right-0 bottom-0 w-[500px] h-[300px] bg-[#000000cd] m-auto rounded-2xl p-4 transition-all duration-1000 ease-in-out ${
            startMint
              ? "opacity-[0%] pointer-events-none"
              : "opacity-[100%] pointer-events-auto"
          }`}
        >
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-[#d80b31] to-transparent mt-0 mb-auto mx-auto rounded-lg bg-[length:200%] animate-redLineAnim "></div>
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="flex-1 flex items-center">
              <p className=" text-left  ">
                SOME INSTRUCTIONS: Lorem ipsum dolor sit amet consectetur
                adipisicing elit.
              </p>
            </div>

            <button
              className="bg-black px-6 py-3  border-red-800 border-2 rounded-lg hover:bg-red-800 active:bg-red-700 cursor-pointer w-full"
              onClick={() => {
                setStartMint(true);
                var audio = document.querySelector("#audioPlayer");
                audio.volume = 0.25;
                audio.play();
              }}
            >
              Start Minting
            </button>
          </div>
        </div>
        {/*Main mint card*/}
        <div
          className={`flex flex-col w-[500px] h-[300px] bg-[#000000cd] m-auto rounded-2xl p-4 transition-all duration-1000 ease-in-out
          ${
            startMint
              ? "opacity-[100%] pointer-events-auto"
              : "opacity-[0%] pointer-events-none"
          }`}
        >
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-[#d80b31] to-transparent mt-0 mb-0 mx- auto rounded-lg bg-[length:200%] animate-redLineAnim"></div>
          {isLoading ? (
            <p className=" text-center m-auto  text-[40px] font-extrabold">
              LOADING...
            </p>
          ) : (
            <div className=" m-auto ">
              {/* Amount claimed so far */}
              <div className="flex items-center justify-center gap-2 p-2">
                <p>Total Minted: </p>
                <div className={styles.mintAreaRight}>
                  {claimedSupply ? (
                    <p>
                      <b>{numberClaimed}</b>
                      {" / "}
                      {numberTotal || "∞"}
                    </p>
                  ) : (
                    // Show loading state if we're still loading the supply
                    <p>Loading...</p>
                  )}
                </div>
              </div>

              {claimConditions.data?.length === 0 ||
              claimConditions.data?.every(
                (cc) => cc.maxClaimableSupply === "0"
              ) ? (
                <div className="">
                  <p className=" text-[20px] font-extrabold text-center">
                    This drop is not ready to be minted yet.
                    <br />
                    (No claim condition set)
                  </p>
                </div>
              ) : (
                <div className="">
                  <div
                    className={`flex items-center justify-center gap-2 
                  ${isSoldOut ? " hidden" : " "}
                  `}
                  >
                    <p>Quantity:</p>
                    <div className=" flex my-auto w-fit gap-2  items-center h-10">
                      <button
                        className=" bg-black text-white  border-red-800 border-2 h-6 w-6 leading-4 rounded-full cursor-pointer text-2xl"
                        onClick={() => setQuantity(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>

                      <h4>{quantity}</h4>

                      <button
                        className="bg-black text-white  border-red-800 border-2 h-6 w-6 leading-4 rounded-full cursor-pointer text-2xl"
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={quantity >= maxClaimable}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="">
                      {isSoldOut ? (
                        <div className="text-[35px] text-center font-extrabold">
                          <h2>SOLD OUT</h2>
                        </div>
                      ) : (
                        <Web3Button
                          contractAddress={editionDrop?.getAddress() || ""}
                          action={(cntr) =>
                            cntr.erc1155.claim(tokenId, quantity)
                          }
                          isDisabled={!canClaim || buttonLoading}
                          onError={(err) => {
                            console.error(err);
                            alert("Error claiming NFTs");
                          }}
                          onSuccess={() => {
                            setQuantity(1);
                            alert("Successfully claimed NFTs");
                          }}
                        >
                          {buttonLoading ? "Loading..." : buttonText}
                        </Web3Button>
                      )}
                    </div>
                    <button
                      className={`w-full font-extrabold bg-black rounded-md border-2 border-red-800 p-2 text-center hover:bg-red-800 active:bg-red-700 cursor-pointer
                    ${isSoldOut ? " hidden " : " "}
                    `}
                    >
                      Mint
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        s
      </main>
    </>
  );
};

export default Home;
