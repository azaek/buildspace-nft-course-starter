import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import myEpicNft from './utils/MyEpicNFT.json';
import { ethers } from 'ethers';

// Constants
const TWITTER_HANDLE = 'alokjkashyap';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = '0x357402398909971AAA0A2119325449D83500D7EE'

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [nftCount, setNftCount] = useState(0);
  const [mintText, setMintText] = useState("Mint NFT");
  const [nfts, setNfts] = useState([]);
  const options = { method: 'GET' };

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure metamask is installed");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setUpEventListener();
      getNFTCount();

    } else {
      console.log("No authorized account found");
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Chain ID:", chainId);

    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("Please connect to the Rinkeby testnet");
    }

  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Connected ", accounts[0]);
      setCurrentAccount(accounts[0]);
      setUpEventListener();
    } catch (error) {
      console.log("Error connecting to metamask", error);
    }
  }

  const setUpEventListener = async () => {
    try {
      const { ethereum } = window;
      console.log("Setting up event listener");

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Connected Contract", connectedContract);
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
          getNFTCount();
        });

        console.log("Setup event listener!");

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getNFTCount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        const count = await connectedContract.getTotalCount();
        console.log("Total NFT count: ", count.toNumber());
        setNftCount(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
}

  const askContractToMintNft = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")

        setMintText("Minting...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();

        setMintText("Mint NFT");

        console.log("Minted! ", nftTxn);

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object doesn't exist!");
      }

    } catch (error) {
      console.log(error);
    }

  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    fetch(`https://testnets-api.opensea.io/api/v1/assets?asset_contract_address=${CONTRACT_ADDRESS}&order_direction=desc&offset=0&limit=50`, options)
      .then(response => {
        response.json().then(data => {
          console.log(data);
          setNfts(data.assets);
        })
      })
      .catch(error => console.log(error));
  }, [nftCount])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <div className='header-brand'>
            <p className="header gradient-text">Squircle Collection</p>
            <p className="sub-text">
              { currentAccount ==='' ? 'Connect wallet to mint' : shortenAddress(currentAccount)}
            </p>
          </div>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              {mintText} <span className='button-text-secondary'>#{nftCount + 1}/50</span>
            </button>
          )}
        </div>
        <div className='title-nft'>
            <p className='button-text-secondary'>Recent NFTs <span>(takes time to show newly minted NFTs)</span></p>
            <a href="https://testnets.opensea.io/collection/squircle-sogl8rhez4">🌊 View Collection on OpenSea</a>
        </div>
            <div className='nft-containers'>

        <div className='main-grid'>
            {
              nfts.map(nft => (
                <>
                  <div className='nftCard'>
                    <img src={nft.image_url} alt="" />
                    <div className='nft-des'>
                      <p>minted by {shortenAddress(nft.owner.address)}</p>
                    </div>
                  </div>
                </>
              ))
            }
        </div>
            </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
