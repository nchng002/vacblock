import { useEffect, useState } from 'react'
import { connectWallet, getCurrentWalletConnected, getVaccinationHistory, registerVaccination, validateVaccination } from './util/interact.js'

function App() {
  const [walletAddress, setWallet] = useState("")
  const [status, setStatus] = useState("❓ No connection to the network.")
  const [newCentre, setNewCentre] = useState("")
  const [newTimeStamp, setNewTimeStamp] = useState("")
  const [newCode, setNewCode] = useState("")
  const [newDose, setNewDose] = useState("")
  const [newName, setNewName] = useState("")
  const [newBirthday, setNewBirthday] = useState("")
  const [newPassport, setNewPassport] = useState("")
  const [newNationality, setNewNationality] = useState("")
  const [newArea, setNewArea] = useState("")
  const [vaccinationHistory, setVaccinationHistory] = useState("❔ No records to show.")

  useEffect(() => {
    async function load() {
      const { address, status } = await getCurrentWalletConnected()
      setWallet(address)
      setStatus(status)
      const history = await getVaccinationHistory(address)
      setVaccinationHistory(history.vaccinationHistory)
      addWalletListener()
      setNewArea("0x9Bea632b94fef8130F7094C8B69D90dF75357335")
      setNewCentre("0x6094504b2C61125A3a8fb799a79d769acD406f28")
    }

    load()
  }, [])

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0])
          setStatus("📝 Connection success! You may update vaccination details below.")
          setTimeout(function () {
            window.location.reload()
          }, 1000)
        } else {
          setWallet("")
          setStatus("🦊 Connect to Metamask using the button below.")
        }
      })

      window.ethereum.on("chainChanged", (chainId) => {
        if (chainId !== "0x5" || chainId !== "*") {
          setStatus(
            <>
              <p>⚠️ You are not connected to Goerli testnet. </p>
              <p>You will be prompted to switch to Goerli testnet in a few moments...</p>
            </>
          )
        }
        setTimeout(function () {
          window.location.reload()
        }, 2000)
      })

    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" rel="noopener noreferrer" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      )
    }

  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet()
    setWallet(walletResponse.address)
    setStatus(walletResponse.status)

  };

  const onUpdatePressed = async () => {
    const { status } = await registerVaccination(walletAddress, newCentre, newTimeStamp, newCode, newDose, newName, newBirthday, newPassport, newNationality)
    setStatus(status)
  };

  const onVerifyPressed = async () => {
    const { status } = await validateVaccination(walletAddress, newArea)
    setStatus(status)
  };

  return (
    <div class="App container">

      <header class="pb-3 pt-3 px-3 mt-3 mb-3 bg-light">
        <h1>VacBlocks</h1>
        <p>A Vaccination Smart Contract</p>
        <p>
          <a target="_blank" rel="noopener noreferrer" href={`https://github.com/nchng002/vacblocks`}>
            Click here
          </a>
          {" "}for more details about this prototype
        </p>
        <p class="text-danger">This website is for demonstration purposes only. Do not use real data or Ethereum to make transactions!</p>
      </header>

      <div class="card mb-3">
        <div class="card-header">
          Transaction Status
        </div>
        <div class="card-body">
          <div>{status}</div>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-header">
          <div>Register Vaccination</div>
        </div>
        <div class="card-body pt-3">

          <button type="button" class="mb-3 btn btn-info" onClick={connectWalletPressed}>
            {walletAddress.length > 0 ? (
              "Connected: " +
              String(walletAddress).substring(0, 6) +
              "..." +
              String(walletAddress).substring(38)
            ) : (
              <span>Connect Wallet</span>
            )}
          </button>

          <div class="input-group mb-3">
            <span class="input-group text">Full Name</span>
            <input type="text" onChange={(e) => setNewName(e.target.value)} value={newName} />
          </div>

          <div class="input-group mb-3">
            <span class="input-group text">Birth Date</span>
            <input type="date" onChange={(e) => setNewBirthday(e.target.value)} value={newBirthday} />
          </div>

          <div class="input-group mb-3">
            <span class="input-group text">Passport Number</span>
            <input type="text" onChange={(e) => setNewPassport(e.target.value)} value={newPassport} />
          </div>

          <div class="input-group mb-3">
            <span class="input-group text">Nationality</span>
            <input type="text" onChange={(e) => setNewNationality(e.target.value)} value={newNationality} />
          </div>

          <div class="input-group mb-3">
            <span class="input-group text">Vaccination Centre Address</span>
            <input type="text" onChange={(e) => setNewCentre(e.target.value)} value={newCentre} />
          </div>

          <div class="input-group mb-3">
            <span class="input-group text">Vaccination Date</span>
            <input type="date" onChange={(e) => setNewTimeStamp(e.target.value)} value={newTimeStamp} />
          </div>

          <div class="input-group mb-3">
            <span class="input-group text">Vaccine Code</span>
            <input type="number" onChange={(e) => setNewCode(e.target.value)} value={newCode} />
          </div>

          <div class="input-group mb-3">
            <span class="input-group text">Vaccine Dose Number</span>
            <input type="number" onChange={(e) => setNewDose(e.target.value)} value={newDose} />
          </div>

          <button type="button" class="btn btn-info mb-3" onClick={onUpdatePressed}>Update Vaccination Records</button>

        </div>
      </div>

      <div class="card mb-3">

        <div class="card-header">
          Verify Vaccination
        </div>

        <div class="card-body">

          <div class="input-group mb-3">
            <span class="input-group text">Area Address</span>
            <input type="text" onChange={(e) => setNewArea(e.target.value)} value={newArea} />
          </div>

          <button type="button" class="btn btn-info mb-3" onClick={onVerifyPressed}>Verify</button>

        </div>
      </div>

      <div class="card mb-3">
        <div class="card-header">
          Vaccination History
        </div>
        <div class="card-body">
          {vaccinationHistory}
        </div>
      </div>

    </div>
  )
}

export default App
