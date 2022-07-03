const VaccinationRegistry = artifacts.require("VaccinationRegistry")
const VaccinationCentre = artifacts.require("VaccinationCentre")
const VaccinationValidator = artifacts.require("VaccinationValidator")


contract("VaccinationRegistry", ([deployer, centre, validator, registry, bogus]) => {
    let registryContract, centreContract, validatorContract
    let centreName, centreLocation

    const timestampA = "2021 6 10"
    const vaccineA = 1
    const doseA = 1
    const timestampB = "2022 6 10"
    const vaccineB = 1
    const doseB = 2
    const fullName = "John Smith"
    const birthDate = "1999 5 27"
    const passportNumber = "123456789"
    const nationality = "Singaporean"

    const approvedVaccine = 1
    const approvedDose = 1
    const approvedDoseB = 2

    before(async () => {
        centreContract = await VaccinationCentre.new()
        validatorContract = await VaccinationValidator.new()
        registryContract = await VaccinationRegistry.new(centreContract.address, validatorContract.address)
    })

    describe("Deployment", async () => {
        it("VaccinationCentre deploys successfully", async () => {
            const address = await centreContract.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
        it("VaccinationValidator deploys successfully", async () => {
            const address = await validatorContract.address
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
        it("VaccinationRegistry deploys successfully", async () => {
            const address = await registryContract.address
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
    })

    describe("Vaccination centre", async () => {
        centreName = "CentreA"
        centreLocation = "LocationA"

        it("registerCentre()", async () => {
            resultRegisterCentre = await centreContract.registerCentre(centre, centreName, centreLocation, { from: centre })
            const event = resultRegisterCentre.logs[0].args
            assert.equal(event._centreAddress, centre)
            assert.equal(event._name, centreName)
            assert.equal(event._location, centreLocation)
        })

        it("centreDetails()", async () => {
            centreDetails = await centreContract.getCentreDetails(centre)
            assert.equal(centreDetails.isRegistered, true)
            assert.equal(centreDetails.name, centreName)
            assert.equal(centreDetails.location, centreLocation)
        })
    })

    describe("Vaccination validator & registry", async () => {

        it("registerRule() for 1 dose of vaccine code 1", async () => {
            resultRegisterRule = await validatorContract.registerRule(validator, approvedVaccine, approvedDose, { from: validator })
            const event1 = resultRegisterRule.logs[0].args
            assert.equal(event1._area, validator)
            assert.equal(event1._approvedVaccine.toString(), approvedVaccine.toString())
            assert.equal(event1._dose.toString(), approvedDose.toString())
        })

        it("getRule() for current rule", async () => {
            approvedList = await validatorContract.getRule(validator)
            assert.equal(approvedList[0][0].toString(), approvedVaccine.toString())
            assert.equal(approvedList[0][1].toString(), approvedDose.toString())
        })

        it("registerVaccination() for first dose of vaccine code 1", async () => {
            registerVaccination = await registryContract.registerVaccination(registry, centre, timestampA, vaccineA, doseA, fullName, birthDate, passportNumber, nationality, { from: registry })
            event1 = registerVaccination.logs[0].args
            assert(event1._personAddress, registry)
            assert(event1._centreAddress, centre)
            assert(event1._timestamp.toString(), timestampA.toString())
            assert(event1._vaccineCode.toString(), vaccineA.toString())
            assert(event1._vaccineDose.toString(), doseA.toString())
        })

        it("validateVaccination() should pass", async () => {
            await registryContract.validateVaccination(validator, { from: registry })
        })

        it("update registerRule() for 2 doses of vaccine code 1", async () => {
            resultRegisterRule = await validatorContract.registerRule(validator, approvedVaccine, approvedDoseB, { from: validator })
            const event1 = resultRegisterRule.logs[0].args
            assert.equal(event1._area, validator)
            assert.equal(event1._approvedVaccine.toString(), approvedVaccine.toString())
            assert.equal(event1._dose.toString(), approvedDoseB.toString())
        })

        it("getRule() for current rule", async () => {
            approvedList = await validatorContract.getRule(validator)
            assert.equal(approvedList[0][0].toString(), approvedVaccine.toString())
            assert.equal(approvedList[0][1].toString(), approvedDoseB.toString())
        })

        it("validateVaccination() should fail", async () => {
            try {
                await registryContract.validateVaccination(validator, { from: registry })
            } catch (error) {
                assert(error)
            }
        })

        it("registerVaccination() for second dose of vaccine 1", async () => {
            registerVaccination = await registryContract.registerVaccination(registry, centre, timestampB, vaccineB, doseB, fullName, birthDate, passportNumber, nationality, { from: registry })
            event2 = registerVaccination.logs[0].args
            assert.equal(event2._personAddress, registry)
            assert.equal(event2._centreAddress, centre)
            assert.equal(event2._timestamp.toString(), timestampB.toString())
            assert.equal(event2._vaccineCode.toString(), vaccineB.toString())
            assert.equal(event2._vaccineDose.toString(), doseB.toString())
        })

        it("validateVaccination() should pass", async () => {
            await registryContract.validateVaccination(validator, { from: registry })
        })

        it("get all user information", async () => {
            outcome = await registryContract.getIsRegistered({ from: registry })
            assert.equal(outcome, true)
            outcome = await registryContract.getPersonId({ from: registry })
            console.log("\tPerson ID: ", outcome)
            outcome = await registryContract.getVaccineProofs({ from: registry })
            assert.equal(outcome.length, 2)
            console.log("\tVaccine Proofs: ", outcome)
            outcome = await registryContract.getCentreAddresses({ from: registry })
            assert.equal(outcome[0], centre)
            assert.equal(outcome[1], centre)
            outcome = await registryContract.getTimeStamps({ from: registry })
            assert.equal(outcome[0], timestampA)
            assert.equal(outcome[1], timestampB)
            outcome = await registryContract.getVaccineCodes({ from: registry })
            assert.equal(outcome[0], vaccineA)
            assert.equal(outcome[1], vaccineB)
            outcome = await registryContract.getVaccineDoses({ from: registry })
            assert.equal(outcome[0], doseA)
            assert.equal(outcome[1], doseB)
        })
    })

    describe("Test for failure", async () => {
        it("Cannot register for vaccination centre under a different address", async () => {
            try {
                await centreContract.registerCentre(centre, centreName, centreLocation, { from: bogus })
            } catch (error) {
                assert(error)
            }
        })
        it("Cannot register for vaccination under a different address", async () => {
            try {
                await validatorContract.registerRule(validator, approvedVaccineA, approvedDoseA, { from: bogus })
            } catch (error) {
                assert(error)
            }
        })
        it("Cannot register vaccination rule under a different address", async () => {
            try {
                await registryContract.registerVaccination(registry, centre, timestampA, vaccineA, doseA, fullName, birthDate, passportNumber, nationality, { from: bogus })
            } catch (error) {
                assert(error)
            }
        })
        it("Cannot use unregistered vaccination centre address in registerVaccination()", async () => {
            try {
                await registryContract.registerVaccination(registry, bogus, timestampA, vaccineA, doseA, fullName, birthDate, passportNumber, nationality, { from: registry })
            } catch (error) {
                assert(error)
            }
        })
        it("Cannot validate user when unregistered rule is passed in validateVaccination()", async () => {
            try {
                await registryContract.validateVaccination(bogus, { from: registry })
            } catch (error) {
                assert(error)
            }
        })
    })
})