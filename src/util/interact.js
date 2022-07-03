require('dotenv').config()
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY
const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(alchemyKey)
const contractABI = require("../contract-abi.json")
const contractAddress = "0xbf1604219D456A9cC8b59Fa0CE11dE8CE136e708"

export const vacblocksContract = new web3.eth.Contract(
    contractABI,
    contractAddress
)

export const registerVaccination = async (walletAddress, newCentre, newTimeStamp, newCode, newDose, newName, newBirthday, newPassport, newNationality) => {
    if (!window.ethereum || walletAddress === null) {
        return {
            status:
                "💡 Connect your Metamask wallet to update your vaccination on the blockchain."
        }
    }

    if (walletAddress.trim() === "" ||
        newCentre.trim() === "" ||
        newTimeStamp.trim() === "" ||
        newName.trim() === "" ||
        newBirthday.trim() === "" ||
        newPassport.trim() === "" ||
        newNationality.trim() === "" ||
        newCode.toString().trim() === "" ||
        newDose.toString().trim() === "") {
        return {
            status: "😥 Error, you might not have filled in the form properly."
        }
    }

    try {
        await vacblocksContract.methods.registerVaccination(
            walletAddress,
            newCentre,
            newTimeStamp,
            newCode,
            newDose,
            newName,
            newBirthday,
            newPassport,
            newNationality
        ).send({ from: walletAddress })

        return {
            status: "🎉 Your vaccination has been registered! \n Reload the webpage and check your history."
        }

    } catch (error) {
        return {
            status: "😥 Error, your vaccination details might be invalid. Please check again."
        }
    }
}

export const validateVaccination = async (walletAddress, centreAddress) => {

    if (!window.ethereum || walletAddress === null) {
        return {
            status:
                "💡 Connect your Metamask wallet to update your vaccination on the blockchain."
        }
    }

    if (centreAddress.trim() === "") {
        return {
            status: "😥 Error, you might not have filled in the form properly."
        }
    }

    try {
        await vacblocksContract.methods.validateVaccination(centreAddress).call({ from: walletAddress });
        return {
            status: "✅ Your vaccination status is valid in this area."
        }
    } catch (error) {
        return {
            status: (
                <>
                    <p>😥 Error, you might: </p>
                    <ul>
                        <li>not have registered any vaccinations</li>
                        <li>not have met registration rules for this area</li>
                    </ul>
                </>
            )
        }
    }
}

export const getVaccinationHistory = async (walletAddress) => {
    try {
        const isRegistered = await vacblocksContract.methods.getIsRegistered().call({ from: walletAddress })
        const personId = await vacblocksContract.methods.getPersonId().call({ from: walletAddress })
        const vaccineProofs = await vacblocksContract.methods.getVaccineProofs().call({ from: walletAddress })
        const centreAddresses = await vacblocksContract.methods.getCentreAddresses().call({ from: walletAddress })
        const timeStamps = await vacblocksContract.methods.getTimeStamps().call({ from: walletAddress })
        const vaccineCodes = await vacblocksContract.methods.getVaccineCodes().call({ from: walletAddress })
        const vaccineDoses = await vacblocksContract.methods.getVaccineDoses().call({ from: walletAddress })

        let historyDict = []
        for (let i = 0; i < vaccineProofs.length; i++) {
            historyDict.push({
                vaccineProof: vaccineProofs[i],
                centreAddress: centreAddresses[i],
                timeStamp: timeStamps[i],
                vaccineCode: vaccineCodes[i],
                vaccineDose: vaccineDoses[i]
            })
        }

        if (!isRegistered) {
            return {
                vaccinationHistory: "❔ No records to show."
            }
        }

        return {
            vaccinationHistory: (
                <div>
                    <p>Account ID: {personId}</p>
                    <>
                        {
                            historyDict.map(function (entry) {
                                return (
                                    <>
                                        <br></br>
                                        <p>Proof ID: {entry.vaccineProof}</p>
                                        <p>Vaccination Centre: {entry.centreAddress}</p>
                                        <p>Date: {entry.timeStamp}</p>
                                        <p>Vaccine Code: {entry.vaccineCode}</p>
                                        <p>Vaccine Dose: {entry.vaccineDose}</p>
                                    </>
                                )
                            })
                        }
                    </>
                </div>
            ),
        }
    } catch (error) {
        return {
            vaccinationHistory: "😥 Error, there was a problem retrieving vaccination history"
        }
    }
}

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            })
            const obj = {
                status: "📝 Connection success! You may update vaccination details below.",
                address: addressArray[0],
            }
            return obj
        } catch (err) {
            return {
                address: "",
                status: "😥 Error, there was a problem connecting to your wallet"
            }
        }
    } else {
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "}
                        🦊{" "}
                        <a target="_blank" rel="noopener noreferrer" href={`https://metamask.io/download.html`}>
                            You must install Metamask, a virtual Ethereum wallet, in your
                            browser.
                        </a>
                    </p>
                </span>
            )
        }
    }
}

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts",
            })

            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x5' }]
            })

            if (addressArray.length > 0) {
                return {
                    address: addressArray[0],
                    status: "📝 Connection success! You may update vaccination details below.",
                };
            } else {
                return {
                    address: "",
                    status: "🦊 Connect to Metamask using the button below.",
                };
            }
        } catch (err) {
            return {
                address: "",
                status: "😥 Error, there was a problem connecting to your wallet."
            };
        }
    } else {
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "}
                        🦊{" "}
                        <a target="_blank" rel="noopener noreferrer" href={`https://metamask.io/download.html`}>
                            You must install Metamask, a virtual Ethereum wallet, in your
                            browser.
                        </a>
                    </p>
                </span>
            )
        }
    }
}