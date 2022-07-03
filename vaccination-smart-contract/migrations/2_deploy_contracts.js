const VaccinationCentre = artifacts.require("VaccinationCentre")
const VaccinationValidator = artifacts.require("VaccinationValidator")
const VaccinationRegistry = artifacts.require("VaccinationRegistry")

module.exports = async function (deployer) {
    await deployer.deploy(VaccinationCentre)
    const vaccinationCentre = await VaccinationCentre.deployed()

    await deployer.deploy(VaccinationValidator)
    const vaccinationValidator = await VaccinationValidator.deployed()

    await deployer.deploy(VaccinationRegistry, vaccinationCentre.address, vaccinationValidator.address)
}
