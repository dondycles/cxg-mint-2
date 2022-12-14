import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import Head from "next/head";
import ThirdwebGuideFooter from "../components/GitHubLink";

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Mumbai;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={activeChainId}>
      <Head>
        <title>Studio CXGNUS</title>
        <link rel="shortcut icon" href="logo.ico" type="image/x-icon" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="CXGNUS is a brand that fosters friendships, builds experiences, and creates memories among anime lovers, gamers, and fasion enthusiasts while also removing the tradition of gatekeeping for the newcomers to the space because we believe that they have a special place in web3. NFT is not just about making money, it is about building connections and making memories with other people just as when you were a kid, playing a videogame for the first time, and starting a new adventure in a new world."
        />
        <meta name="keywords" content="CXGNUS, STUDIO CXGNUS" />
      </Head>
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
