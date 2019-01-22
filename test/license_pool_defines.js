const BN = require('bn.js');

const RuleCondition = {
    Less: 0,
    LessEqual: 1,
    Equal: 2,
    GreaterEqual: 3,
    Greater: 4,
    OneFromList: 5,
    AllFromList: 6,
    TotalConditions: 7
};

const RuleType = {
    Allow: 0,
    Deny: 1,
    TotalTypes: 2
};

const LicenseState = {
    Reserved: 0,
    Active: 1,
    Revoked: 2,
    TotalStates: 3
};

const UUIDS = {
    NotValidUUID: 0,
    CountryUUID: new BN('332ef46e2f5f45c491be2dac15b62b29', 16).toString(10),
    ContentTypeUUID: new BN('2b93f503da5b46cbaaf0ccb3b2493b79', 16).toString(10),
    YearUUID: new BN('008fbcfe0b7c415db68d5f301a05f11f', 16).toString(10),
    DurationUUID: new BN('68aa6a82ee374616bf7126898e675c66', 16).toString(10),
    LanguagesUUID: new BN('17e08955c48145c59431fab66e6df037', 16).toString(10),
    CountryUUID: new BN('332ef46e2f5f45c491be2dac15b62b29', 16).toString(10),
    DistributorUUID: new BN('29d32c8fecea4c2ab3e14b51be5dd2f8', 16).toString(10),
    QualityUUID: new BN('c094730eafe1473fa046f759bf3153a3', 16).toString(10),
    IssuedUUID: new BN('2b113aab243e432e9c91e2835cfea28d', 16).toString(10)
}
module.exports = {
    RuleCondition,
    RuleType,
    LicenseState,
    UUIDS
};