// SPDX-License-Identifier: UNl
pragma solidity >=0.7.0;

import "./VaccinationCentre.sol";
import "./VaccinationValidator.sol";

contract VaccinationRegistry {
    struct VaccinationHistory {
        bool isRegistered;
        bytes32 personId;
        bytes32[] vaccineProofs;
        mapping(bytes32 => address) centreAddress;
        mapping(bytes32 => string) timestamp;
        mapping(bytes32 => uint256) vaccineCode;
        mapping(bytes32 => uint256) vaccineDose;
    }

    mapping(address => VaccinationHistory) vaccinationsDatabase;

    VaccinationCentre public vaccinationCentre;
    VaccinationValidator public vaccinationValidator;

    constructor(
        VaccinationCentre _vaccinationCentre,
        VaccinationValidator _vaccinationValidator
    ) {
        vaccinationCentre = _vaccinationCentre;
        vaccinationValidator = _vaccinationValidator;
    }

    event VaccinationRegistered(
        address _personAddress,
        address _centreAddress,
        string _timestamp,
        uint256 _vaccineCode,
        uint256 _vaccineDose
    );

    function registerVaccination(
        address _personAddress,
        address _centreAddress,
        string memory _timestamp,
        uint256 _vaccineCode,
        uint256 _vaccineDose,
        string memory _fullName,
        string memory _birthDate,
        string memory _passportNumber,
        string memory _nationality
    ) public {
        require(
            _personAddress == msg.sender,
            "You cannot register vaccination for this address"
        );

        require(
            vaccinationCentre.getCentreDetails(_centreAddress).isRegistered,
            "You cannot register your vaccination from this registration centre"
        );

        VaccinationHistory storage record = vaccinationsDatabase[msg.sender];

        if (!record.isRegistered) {
            record.isRegistered = true;
            record.personId = _generatePersonId(
                _fullName,
                _birthDate,
                _passportNumber,
                _nationality,
                msg.sender
            );
        }

        bytes32 _proof = _generateVaccinationProof(
            _centreAddress,
            _timestamp,
            _vaccineCode,
            _vaccineDose,
            record.personId
        );

        record.vaccineProofs.push(_proof);
        record.centreAddress[_proof] = _centreAddress;
        record.timestamp[_proof] = _timestamp;
        record.vaccineCode[_proof] = _vaccineCode;
        record.vaccineDose[_proof] = _vaccineDose;

        emit VaccinationRegistered(
            msg.sender,
            _centreAddress,
            _timestamp,
            _vaccineCode,
            _vaccineDose
        );
    }

    function _generatePersonId(
        string memory _fullName,
        string memory _birthDate,
        string memory _passportNumber,
        string memory _nationality,
        address _personAddress
    ) private pure returns (bytes32) {
        bytes32 _personId = keccak256(
            abi.encode(
                _fullName,
                _birthDate,
                _passportNumber,
                _nationality,
                _personAddress
            )
        );
        return _personId;
    }

    function _generateVaccinationProof(
        address _centreAddress,
        string memory _timestamp,
        uint256 _vaccineCode,
        uint256 _vaccineDose,
        bytes32 _personId
    ) private pure returns (bytes32) {
        bytes32 _proof = keccak256(
            abi.encode(
                _centreAddress,
                _timestamp,
                _vaccineCode,
                _vaccineDose,
                _personId
            )
        );
        return _proof;
    }

    function validateVaccination(address _area) public view {
        bool _isRegistered = getIsRegistered();
        bytes32[] memory _vaccineProofs = getVaccineProofs();
        uint256[] memory _vaccineCodes = getVaccineCodes();
        uint256[] memory _vaccineDoses = getVaccineDoses();

        require(_isRegistered, "Vaccination is not registered");

        bool _outcome = false;
        for (uint256 i = 0; i < _vaccineProofs.length; i++) {
            _outcome = vaccinationValidator.vaccinationIsValid(
                _area,
                _vaccineCodes[i],
                _vaccineDoses[i]
            );
            if (_outcome) {
                break;
            }
        }
        require(
            _outcome,
            "You have not met the vaccination rules for this area"
        );
    }

    function getIsRegistered() public view returns (bool) {
        return vaccinationsDatabase[msg.sender].isRegistered;
    }

    function getPersonId() public view returns (bytes32) {
        return vaccinationsDatabase[msg.sender].personId;
    }

    function getVaccineProofs() public view returns (bytes32[] memory) {
        return vaccinationsDatabase[msg.sender].vaccineProofs;
    }

    function getCentreAddresses() public view returns (address[] memory) {
        bytes32[] memory _vaccineProofs = vaccinationsDatabase[msg.sender]
            .vaccineProofs;
        address[] memory _centreAddresses = new address[](
            _vaccineProofs.length
        );
        for (uint256 i = 0; i < _vaccineProofs.length; i++) {
            _centreAddresses[i] = vaccinationsDatabase[msg.sender]
                .centreAddress[_vaccineProofs[i]];
        }
        return _centreAddresses;
    }

    function getTimeStamps() public view returns (string[] memory) {
        bytes32[] memory _vaccineProofs = vaccinationsDatabase[msg.sender]
            .vaccineProofs;
        string[] memory _timeStamps = new string[](_vaccineProofs.length);
        for (uint256 i = 0; i < _vaccineProofs.length; i++) {
            _timeStamps[i] = vaccinationsDatabase[msg.sender].timestamp[
                _vaccineProofs[i]
            ];
        }
        return _timeStamps;
    }

    function getVaccineCodes() public view returns (uint256[] memory) {
        bytes32[] memory _vaccineProofs = vaccinationsDatabase[msg.sender]
            .vaccineProofs;
        uint256[] memory _codes = new uint256[](_vaccineProofs.length);
        for (uint256 i = 0; i < _vaccineProofs.length; i++) {
            _codes[i] = vaccinationsDatabase[msg.sender].vaccineCode[
                _vaccineProofs[i]
            ];
        }
        return _codes;
    }

    function getVaccineDoses() public view returns (uint256[] memory) {
        bytes32[] memory _vaccineProofs = vaccinationsDatabase[msg.sender]
            .vaccineProofs;
        uint256[] memory _doses = new uint256[](_vaccineProofs.length);
        for (uint256 i = 0; i < _vaccineProofs.length; i++) {
            _doses[i] = vaccinationsDatabase[msg.sender].vaccineDose[
                _vaccineProofs[i]
            ];
        }
        return _doses;
    }
}
