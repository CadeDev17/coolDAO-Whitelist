import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal"
import { providers, Contract } from "ethers"
import { useRef, useState, useEffect } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [joinedWhitelist, setJoinedWhitelist] = useState(false)
  const [loading, setLoading] = useState(false)
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0)
  const web3ModalRef = useRef()

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect()
    const web3Provider = new providers.Web3Provider(provider)

    const { chainId } = await web3Provider.getNetwork()
    if (chainId !== 5) {
      window.alert("Change network to Goerli")
      throw new Error("Change network to Goerli")
    }

    if (needSigner) {
      const signer = web3Provider.getSigner()
      return signer
    }

    return web3Provider

  }

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true)

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const transaction = await whitelistContract.addAddressToWhitelist();
      setLoading(true)

      await transaction.wait()
      setLoading(false)

      await getNumberOfWhitelisted()
      setJoinedWhitelist(true)

    } catch (err) {
      console.error(err)
    }
  }

  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner()

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      )

      const _numberOfWhitelisted = await whitelistContract.numWhitelisted()

      setNumberOfWhitelisted(_numberOfWhitelisted)
    } catch (err) {
      console.error(err)
    }
  }

  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true)

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const address = await signer.getAddress()

      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address)
      setJoinedWhitelist(_joinedWhitelist)


    } catch (err) {
      console.error(err)
    }
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner()
      setWalletConnected(true)

      checkIfAddressInWhitelist()

      getNumberOfWhitelisted()
    } catch (err) {
      console.error(err)
    }
  }

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  }

  const renderConnectWallet = () => {
    if (walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.connect}>
          Wallet Connected
        </button>
      )
    } else {
      return (
        <button onClick={connectWallet} className={styles.connect}>
          Connect your wallet
        </button>
      );
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      })
      connectWallet()
    }
  }, [walletConnected])



  return (
      <div className={styles.page}>
        <div>
          <style jsx global>{`
            body {
              margin: 0px;
              padding: 0px;
            }
          `}</style>
        </div>
        <Head>
          <title>Whitelist Dapp</title>
          <meta name="description" content="Whitelist-Dapp" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=Share+Tech&display=swap" rel="stylesheet" />
        </Head>
        <nav className={styles.mainNavContainer}>
          <div className={styles.textLogoContainer}>
            <h1 className={styles.textLogo}>cool<span className={styles.cool}>DAO</span></h1>
          </div>
          <div className={styles.pageOptionsContainer}>
            <h4 className={styles.option}>Home</h4>
            <h4 className={styles.option}>Whitepaper</h4>
            <h4 className={styles.option}>Roadmap</h4>
            {renderConnectWallet()}
          </div>
        </nav>
        <div className={styles.main}>
          <div>
            <img className={styles.image} src="/coolDAO/coolDAO.jpeg" />
          </div>
          <div className={styles.mainContainer}>
            <h1 className={styles.title}>Welcome to coolDAO</h1>
            <div className={styles.description}>
              <span className={styles.red}>Not</span> Based, Purely <a href="WHITEPAPER" className={styles.obj}>Objectve</a>
            </div>
            <div className={styles.description}>
              {numberOfWhitelisted} have already joined the Whitelist
            </div>
            {renderButton()}
          </div>
        </div>
      </div>
  );
}
