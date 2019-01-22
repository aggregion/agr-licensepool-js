const assert = require('assert');
const tools = require('./tools');
const BN = require('bn.js');
const {
    RuleCondition,
    RuleType,
    LicenseState,
    UUIDS
} = require('./license_pool_defines');

require('chai')
    .use(require('chai-as-promised'))
    .should();

let agr;
let license_pool;
const scname = 'disney.test';

const offerAliceInWonderlandUUID = new BN('927eb144a9eb4a34850b68d4a373bbb0', 16).toString(10);
const offerPrinceOfPersiaUUID = new BN('54cb10d23bca4ee18d3b8751b0a67e0f', 16).toString(10);

const distrAliceMainAUUID = new BN('c5aea4abe12c43d9b53935e840f39d30', 16).toString(10);
const distrPrinceMainAUUID = new BN('aa38b0b1a4df46b8a062e0c4846f7964', 16).toString(10);
const distrAliceMainBUUID = new BN('6c35ece85a59439f8ae2ce177489ca6b', 16).toString(10);
const distrPrinceMainBUUID = new BN('b029facbd48047fcad1cf518e24ddcfb', 16).toString(10);

const distrAliceRegionalRUSAUUID = new BN('c0406229bdf74a7eb3d3390a8857b3b0', 16).toString(10);
const distrPrinceRegionalRUSAUUID = new BN('6527b3f4bc9d47b58b7c45f1d6b1e091', 16).toString(10);
const distrAliceRegionalRUSBUUID = new BN('722d7987b9254c57a8afe9feba51c13b', 16).toString(10);
const distrPrinceRegionalRUSBUUID = new BN('dbd8791e6c444d8ab4d1687a249ba406', 16).toString(10);

const distrAliceRegionalUSAAUUID = new BN('be4e8f92406e4c42a4faee0513e5f8b6', 16).toString(10);
const distrPrinceRegionalUSAAUUID = new BN('060063f1a2a041dabfc4d55cf17dfbaf', 16).toString(10);
const distrAliceRegionalCHNBUUID = new BN('21b0f9b96f5747e3855943b104e98689', 16).toString(10);
const distrPrinceRegionalCHNBUUID = new BN('2942b0f1148c44889e03e8732a715518', 16).toString(10);

const distrAliceRegionalKAZAUUID = new BN('7428986ef0724b8e9f67e0c5349b3a48', 16).toString(10);
const distrPrinceRegionalKAZAUUID = new BN('5021cf02d5d94e449d20308130caa80a', 16).toString(10);
const distrAliceRegionalKAZBUUID = new BN('64732051dc2b46b8af5aecf65e08f381', 16).toString(10);
const distrPrinceRegionalKAZBUUID = new BN('1b71f5fcdb504478bbc425e41ddc37c8', 16).toString(10);

const license1UUID = new BN('8d73f057b44542778c26e269ca351eeb', 16).toString(10);
const license2UUID = new BN('ee459a80bbf141efadd50b854f8b4a43', 16).toString(10);
const license3UUID = new BN('150fc1342dca4d479569584284980d3f', 16).toString(10);
const license4UUID = new BN('4ad96f76f1e44b358f0aa171a82f5834', 16).toString(10);
const license5UUID = new BN('35baa931d9d4435fa54792525ee42bd9', 16).toString(10);
const license6UUID = new BN('d54ca0cc082447d78441df3484a60dbf', 16).toString(10);
const license7UUID = new BN('374809492ad64ec696cfafa98a3cab4b', 16).toString(10);
const license8UUID = new BN('5cc1e9eb9ddb410581fd1574c010665a', 16).toString(10);
const license9UUID = new BN('625199ecd5254a779e82fd2ac65922cb', 16).toString(10);


before(async function () {
    this.timeout(3000000);
    agr = await tools.setNetwork(scname, 'contracts/boss.license_pool/boss.license_pool.wasm', 'contracts/boss.license_pool/boss.license_pool.abi');
    license_pool = await agr.contract(scname);
    try {
        await license_pool.initialize('Disney', 'Test Pool', {
            authorization: [scname]
        });
        await tools.createAccount(agr, 'maindistra', 'AGR7QxcceGC49yiQgdK2ecxDBRQ9QnFRfd9Zn5nQFHMTcim2e5bpp' /*testone key*/ );
        await tools.createAccount(agr, 'maindistrb', 'AGR7tKxgPXoAXN4E6BM5iXMcCpP63vr6JW19pwTodrHZh8UxyAmGQ' /*testtwo key*/ );
        await tools.createAccount(agr, 'regionalrus', 'AGR7QxcceGC49yiQgdK2ecxDBRQ9QnFRfd9Zn5nQFHMTcim2e5bpp' /*testone key*/ );
        await tools.createAccount(agr, 'regionalusa', 'AGR7tKxgPXoAXN4E6BM5iXMcCpP63vr6JW19pwTodrHZh8UxyAmGQ' /*testtwo key*/ );
        await tools.createAccount(agr, 'regionalchn', 'AGR7QxcceGC49yiQgdK2ecxDBRQ9QnFRfd9Zn5nQFHMTcim2e5bpp' /*testone key*/ );
        await tools.createAccount(agr, 'regionalkaz', 'AGR7tKxgPXoAXN4E6BM5iXMcCpP63vr6JW19pwTodrHZh8UxyAmGQ' /*testtwo key*/ );
    } catch (e) {}
});

beforeEach(async function () {
    // Clear data
});

async function offerSetProp(uuid, name, value, owner, check) {
    await license_pool.offerpropset(uuid, name, value, {
        authorization: [owner]
    });

    // check result
    if (check) {
        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'offerprops', {
            offerUUID: tools.getUUIDAsString(uuid),
            key: tools.getUUIDAsString(name),
            value: value
        }), true, `Failed to set propertiy ${name} for offer ${uuid}!`);
    }
}

async function distrCreate(uuid, parent, offer, subject, owner, countryRuleType, country, issuedmax, check) {
    await license_pool.distrcreate(uuid, parent, offer, subject, {
        authorization: [owner]
    });
    await license_pool.distrruleset(uuid, countryRuleType, RuleCondition.Equal, UUIDS.CountryUUID, country, {
        authorization: [owner]
    });
    await license_pool.distrlimset(uuid, UUIDS.IssuedUUID, 1, issuedmax, {
        authorization: [owner]
    });

    // check result
    if (check) {
        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrdelg', {
            distributionUUID: tools.getUUIDAsString(uuid),
            parentUUID: tools.getUUIDAsString(parent),
            offerUUID: tools.getUUIDAsString(offer),
            delegate_from: owner,
            delegate_to: subject
        }), true, `Failed to create distribution delegation ${uuid} for offer ${offer}!`);

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrrule', {
            distributionUUID: tools.getUUIDAsString(uuid),
            type: countryRuleType,
            condition: RuleCondition.Equal,
            name: tools.getUUIDAsString(UUIDS.CountryUUID),
            value: country
        }), true, `Failed to create distribution delegation rule ${uuid} for offer ${offer}!`);

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrlimit', {
            distributionUUID: tools.getUUIDAsString(uuid),
            name: tools.getUUIDAsString(UUIDS.IssuedUUID),
            change: 1,
            value: issuedmax
        }), true, `Failed to create distribution delegation limit ${uuid} for offer ${offer}!`);
    }
}

async function licenseCreate(uuid, distr, issuer, subject, country, check) {
    await license_pool.liccreate(distr, uuid, subject, {
        authorization: [issuer]
    });
    await license_pool.licpropset(uuid, UUIDS.CountryUUID, country, {
        authorization: [issuer]
    });
    await license_pool.licactivate(uuid, {
        authorization: [issuer]
    });

    // check result
    if (check) {
        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'license', {
            state: LicenseState.Active,
            licenseUUID: tools.getUUIDAsString(uuid),
            distributionUUID: tools.getUUIDAsString(distr),
            issued_from: issuer,
            issued_to: subject
        }), true, `Failed to create license ${uuid} for distribution delegation ${distr}!`);

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'licprops', {
            licenseUUID: tools.getUUIDAsString(uuid),
            key: tools.getUUIDAsString(UUIDS.CountryUUID),
            value: country
        }), true, `Failed to create license property ${uuid} for distribution delegation ${distr}!`);
    }

}

describe('Boss License Pool Disney scheme tests', async function () {
    this.timeout(3000000);
    it('should create offers', async function () {
        // Alice in Wonderland
        await license_pool.offerset(offerAliceInWonderlandUUID, scname, "Alice in Wonderland", "Troubled by a strange recurring dream and mourning the loss of her father, 19-year-old Alice Kingsleigh attends a garden party at Lord Ascot's estate.", {
            authorization: [scname]
        });
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.ContentTypeUUID, 'film', scname, true);
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.YearUUID, '2010', scname, true);
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.DurationUUID, '108 m', scname, true);
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.LanguagesUUID, 'English, Russian, Chinese, Kazak', scname, true);
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.CountryUUID, 'United States', scname, true);
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.DistributorUUID, 'Walt Disney Studios Motion Pictures', scname, true);
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.QualityUUID, '1920x1080p MPEG2', scname, true);

        // Prince of Persia: The Sands of Time
        await license_pool.offerset(offerPrinceOfPersiaUUID, scname, "Prince of Persia: The Sands of Time", "Dastan, a street urchin in Persia, is adopted by King Sharaman after showing courage.  Fifteen years later, the king's brother Nizam relays evidence to the princes—Dastan.", {
            authorization: [scname]
        });
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.ContentTypeUUID, 'film', scname, true);
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.YearUUID, '2010', scname, true);
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.DurationUUID, '116 m', scname, true);
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.LanguagesUUID, 'English, Russian, Chinese, Kazak', scname, true);
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.CountryUUID, 'United States', scname, true);
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.DistributorUUID, 'Walt Disney Studios Motion Pictures', scname, true);
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.QualityUUID, '1920x1080p MPEG2', scname, true);
    });

    it('should create distribution delegations', async function () {
        // main
        await distrCreate(distrAliceMainAUUID, UUIDS.NotValidUUID, offerAliceInWonderlandUUID, 'maindistra', scname, RuleType.Deny, 'CN', 200, true);
        await distrCreate(distrPrinceMainAUUID, UUIDS.NotValidUUID, offerPrinceOfPersiaUUID, 'maindistra', scname, RuleType.Deny, 'CN', 100, true);
        await distrCreate(distrAliceMainBUUID, UUIDS.NotValidUUID, offerAliceInWonderlandUUID, 'maindistrb', scname, RuleType.Deny, 'US', 100, true);
        await distrCreate(distrPrinceMainBUUID, UUIDS.NotValidUUID, offerPrinceOfPersiaUUID, 'maindistrb', scname, RuleType.Deny, 'US', 50, true);

        // regional
        await distrCreate(distrAliceRegionalRUSAUUID, distrAliceMainAUUID, offerAliceInWonderlandUUID, 'regionalrus', 'maindistra', RuleType.Allow, 'RU', 100, true);
        await distrCreate(distrPrinceRegionalRUSAUUID, distrPrinceMainAUUID, offerPrinceOfPersiaUUID, 'regionalrus', 'maindistra', RuleType.Allow, 'RU', 50, true);
        await distrCreate(distrAliceRegionalRUSBUUID, distrAliceMainBUUID, offerAliceInWonderlandUUID, 'regionalrus', 'maindistrb', RuleType.Allow, 'RU', 50, true);
        await distrCreate(distrPrinceRegionalRUSBUUID, distrPrinceMainBUUID, offerPrinceOfPersiaUUID, 'regionalrus', 'maindistrb', RuleType.Allow, 'RU', 25, true);

        await distrCreate(distrAliceRegionalUSAAUUID, distrAliceMainAUUID, offerAliceInWonderlandUUID, 'regionalusa', 'maindistra', RuleType.Allow, 'US', 100, true);
        await distrCreate(distrPrinceRegionalUSAAUUID, distrPrinceMainAUUID, offerPrinceOfPersiaUUID, 'regionalusa', 'maindistra', RuleType.Allow, 'US', 50, true);

        await distrCreate(distrAliceRegionalCHNBUUID, distrAliceMainBUUID, offerAliceInWonderlandUUID, 'regionalchn', 'maindistrb', RuleType.Allow, 'CN', 50, true);
        await distrCreate(distrPrinceRegionalCHNBUUID, distrPrinceMainBUUID, offerPrinceOfPersiaUUID, 'regionalchn', 'maindistrb', RuleType.Allow, 'CN', 25, true);

        await distrCreate(distrAliceRegionalKAZAUUID, distrAliceMainAUUID, offerAliceInWonderlandUUID, 'regionalkaz', 'maindistra', RuleType.Allow, 'KZ', 100, true);
        await distrCreate(distrPrinceRegionalKAZAUUID, distrPrinceMainAUUID, offerPrinceOfPersiaUUID, 'regionalkaz', 'maindistra', RuleType.Allow, 'KZ', 50, true);
        await distrCreate(distrAliceRegionalKAZBUUID, distrAliceMainBUUID, offerAliceInWonderlandUUID, 'regionalkaz', 'maindistrb', RuleType.Allow, 'KZ', 50, true);
        await distrCreate(distrPrinceRegionalKAZBUUID, distrPrinceMainBUUID, offerPrinceOfPersiaUUID, 'regionalkaz', 'maindistrb', RuleType.Allow, 'KZ', 25, true);
    });

    it('should issue licenses', async function () {
        await licenseCreate(license1UUID, distrPrinceRegionalRUSAUUID, 'regionalrus', 'testone', 'RU', true);
        await licenseCreate(license2UUID, distrAliceRegionalRUSAUUID, 'regionalrus', 'testone', 'RU', true);
        await licenseCreate(license3UUID, distrPrinceRegionalRUSBUUID, 'regionalrus', 'testone', 'RU', true);
        await licenseCreate(license4UUID, distrAliceRegionalCHNBUUID, 'regionalchn', 'testone', 'CN', true);
        await licenseCreate(license5UUID, distrPrinceRegionalUSAAUUID, 'regionalusa', 'testone', 'US', true);
        await licenseCreate(license6UUID, distrAliceRegionalUSAAUUID, 'regionalusa', 'testone', 'US', true);
        await licenseCreate(license7UUID, distrPrinceRegionalKAZAUUID, 'regionalkaz', 'testone', 'KZ', true);
        await licenseCreate(license8UUID, distrAliceRegionalKAZBUUID, 'regionalkaz', 'testone', 'KZ', true);
        await licenseCreate(license9UUID, distrPrinceRegionalKAZBUUID, 'regionalkaz', 'testone', 'KZ', true);
    });
});