const assert = require('assert');
const tools = require('./tools');
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
const scname = 'license.pool';

const offerUUID = tools.generateUUID();
const distrOneUUID = tools.generateUUID();
const distrTwoUUID = tools.generateUUID();
const licenseOneUUID = tools.generateUUID();
const licenseTwoUUID = tools.generateUUID();
const licenseThreeUUID = tools.generateUUID();
const offerPropOneUUID = tools.generateUUID();
const offerPropTwoUUID = tools.generateUUID();
const counterOneUUID = tools.generateUUID();
const counterTwoUUID = tools.generateUUID();
const licensePropUUID = tools.generateUUID();

before(async function () {
    this.timeout(3000000);
    agr = await tools.setNetwork(scname, 'contracts/boss.license_pool/boss.license_pool.wasm', 'contracts/boss.license_pool/boss.license_pool.abi');
    license_pool = await agr.contract(scname);
    try {
        await license_pool.initialize('TestPool', 'Test Description', {
            authorization: [scname]
        });
    } catch (e) {}
});

beforeEach(async function () {
    // Clear data
});

describe('Boss License Pool tests', async function () {
    this.timeout(3000000);
    it('should return the correct storage table after construction', async function () {
        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'info', {
            name: 'TestPool',
            description: 'Test Description'
        }), true, 'Invalid info table!');
    });

    it('should create license offer and properties', async function () {
        // access denied check
        await license_pool.offerset(offerUUID[0], 'testone', 'License Offer One', 'License Offer Description', {
            authorization: ['testone']
        }).should.be.rejected;

        // not exist account
        await license_pool.offerset(offerUUID[0], 'testone', 'License Offer One', 'License Offer Description', {
            authorization: ['testsome']
        }).should.be.rejected;

        await license_pool.offerset(offerUUID[0], 'testone', 'License Offer One', 'License Offer Description', {
            authorization: [scname]
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'licenseoffer', {
            offerUUID: offerUUID[1],
            owner: 'testone',
            name: 'License Offer One',
            description: 'License Offer Description'
        }), true, 'Offer not found!');

        // access denied check
        await license_pool.offerpropset(offerUUID[0], offerPropOneUUID[0], 'value', {
            authorization: ['testone']
        }).should.be.rejected;

        // not found
        await license_pool.offerpropset(tools.generateUUID()[0], offerPropOneUUID[0], 'value', {
            authorization: [scname]
        }).should.be.rejected;

        await license_pool.offerpropset(offerUUID[0], offerPropOneUUID[0], 'valueOne', {
            authorization: [scname]
        });

        await license_pool.offerpropset(offerUUID[0], offerPropTwoUUID[0], 'valueTwo', {
            authorization: [scname]
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'offerprops', {
            key: offerPropOneUUID[1],
            value: 'valueOne'
        }), true, 'Offer propertiy not found!');

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'offerprops', {
            key: offerPropTwoUUID[1],
            value: 'valueTwo'
        }), true, 'Offer propertiy not found!');

        // access denied check
        await license_pool.offerproprem(offerUUID[0], offerPropOneUUID[0], {
            authorization: ['testone']
        }).should.be.rejected;

        await license_pool.offerproprem(offerUUID[0], offerPropOneUUID[0], {
            authorization: [scname]
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'offerprops', {
            key: offerPropOneUUID[1]
        }), false, 'Offer propertiy MUST not exist!');

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'offerprops', {
            key: offerPropTwoUUID[1],
            value: 'valueTwo'
        }), true, 'Offer propertiy not found!');
    });
    it('should manipulate license distribution delegation', async function () {
        // preparing
        await license_pool.offerset(offerUUID[0], 'testone', 'License Offer One', 'License Offer Description', {
            authorization: [scname]
        });

        await license_pool.offerpropset(offerUUID[0], offerPropOneUUID[0], '100', {
            authorization: [scname]
        });

        await license_pool.offerpropset(offerUUID[0], offerPropTwoUUID[0], '200', {
            authorization: [scname]
        });

        // access denied check
        await license_pool.distrcreate(distrOneUUID[0], UUIDS.NotValidUUID, offerUUID[0], 'testone', {
            authorization: ['testone']
        }).should.be.rejected;

        await license_pool.distrcreate(distrOneUUID[0], UUIDS.NotValidUUID, offerUUID[0], 'testone', {
            authorization: [scname]
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrdelg', {
            distributionUUID: distrOneUUID[1],
            parentUUID: UUIDS.NotValidUUID,
            offerUUID: offerUUID[1],
            delegate_from: scname,
            delegate_to: 'testone'
        }), true, 'Distribution delegation not found!');

        // access denied check
        await license_pool.distrcreate(distrTwoUUID[0], distrOneUUID[0], offerUUID[0], 'testtwo', {
            authorization: [scname]
        }).should.be.rejected;

        await license_pool.distrcreate(distrTwoUUID[0], distrOneUUID[0], offerUUID[0], 'testtwo', {
            authorization: ['testone']
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrdelg', {
            distributionUUID: distrTwoUUID[1],
            parentUUID: distrOneUUID[1],
            offerUUID: offerUUID[1],
            delegate_from: 'testone',
            delegate_to: 'testtwo'
        }), true, 'Distribution delegation not found!');

        // access denied check
        await license_pool.distrruleset(distrOneUUID[0], RuleType.Allow, RuleCondition.Equal, offerPropOneUUID[0], 'value', {
            authorization: ['testone']
        }).should.be.rejected;

        await license_pool.distrruleset(distrOneUUID[0], RuleType.Allow, RuleCondition.Equal, offerPropOneUUID[0], 'value', {
            authorization: [scname]
        });

        await license_pool.distrruleset(distrTwoUUID[0], RuleType.Deny, RuleCondition.Equal, offerPropTwoUUID[0], 'value2', {
            authorization: ['testtwo']
        }).should.be.rejected;

        await license_pool.distrruleset(distrTwoUUID[0], RuleType.Deny, RuleCondition.Equal, offerPropTwoUUID[0], 'value2', {
            authorization: ['testone']
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrrule', {
            distributionUUID: distrOneUUID[1],
            type: RuleType.Allow,
            condition: RuleCondition.Equal,
            name: offerPropOneUUID[1],
            value: 'value'
        }), true, 'Distribution delegation rule not found!');

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrrule', {
            distributionUUID: distrTwoUUID[1],
            type: RuleType.Deny,
            condition: RuleCondition.Equal,
            name: offerPropTwoUUID[1],
            value: 'value2'
        }), true, 'Distribution delegation rule not found!');

        await license_pool.distrrulerem(distrTwoUUID[0], RuleType.TotalTypes, RuleCondition.Equal, offerPropTwoUUID[0], {
            authorization: ['testtwo']
        }).should.be.rejected;

        await license_pool.distrrulerem(distrTwoUUID[0], RuleType.TotalTypes, RuleCondition.Equal, offerPropTwoUUID[0], {
            authorization: ['testone']
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrrule', {
            distributionUUID: distrTwoUUID[1]
        }), false, 'Distribution delegation rule not removed!');

        await license_pool.distrrulerem(distrOneUUID[0], RuleType.TotalTypes, RuleCondition.TotalConditions, UUIDS.NotValidUUID, {
            authorization: ['testtwo']
        }).should.be.rejected;

        await license_pool.distrrulerem(distrOneUUID[0], RuleType.TotalTypes, RuleCondition.TotalConditions, UUIDS.NotValidUUID, {
            authorization: [scname]
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrrule', {
            distributionUUID: distrOneUUID[1]
        }), false, 'Distribution delegation rule not removed!');


        // access denied check
        await license_pool.distrlimset(distrOneUUID[0], counterOneUUID[0], 1, 100, {
            authorization: ['testone']
        }).should.be.rejected;

        await license_pool.distrlimset(distrOneUUID[0], counterOneUUID[0], 1, 100, {
            authorization: [scname]
        });

        await license_pool.distrlimset(distrTwoUUID[0], counterTwoUUID[0], 1, 100, {
            authorization: [scname]
        }).should.be.rejected;

        await license_pool.distrlimset(distrTwoUUID[0], counterTwoUUID[0], 1, 100, {
            authorization: ['testone']
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrlimit', {
            distributionUUID: distrOneUUID[1],
            name: counterOneUUID[1],
            change: 1,
            value: 100
        }), true, 'Distribution delegation limit not found!');

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrlimit', {
            distributionUUID: distrTwoUUID[1],
            name: counterTwoUUID[1],
            change: 1,
            value: 100
        }), true, 'Distribution delegation limit not found!');

        await license_pool.distrlimrem(distrOneUUID[0], counterOneUUID[0], {
            authorization: ['testtwo']
        }).should.be.rejected;

        await license_pool.distrlimrem(distrOneUUID[0], counterOneUUID[0], {
            authorization: [scname]
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrlimit', {
            distributionUUID: distrOneUUID[1]
        }), false, 'Distribution delegation limit not removed!');

        await license_pool.distrlimrem(distrTwoUUID[0], counterTwoUUID[0], {
            authorization: ['testtwo']
        }).should.be.rejected;

        await license_pool.distrlimrem(distrTwoUUID[0], counterTwoUUID[0], {
            authorization: ['testone']
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrlimit', {
            distributionUUID: distrTwoUUID[1]
        }), false, 'Distribution delegation limit not removed!');
    });

    it('should manipulate license', async function () {
        // set rules
        await license_pool.distrruleset(distrOneUUID[0], RuleType.Allow, RuleCondition.Greater, licensePropUUID[0], 200, {
            authorization: [scname]
        });

        await license_pool.distrruleset(distrTwoUUID[0], RuleType.Deny, RuleCondition.GreaterEqual, licensePropUUID[0], 300, {
            authorization: ['testone']
        });

        // set counters
        await license_pool.distrlimset(distrOneUUID[0], counterOneUUID[0], 1, 100, {
            authorization: [scname]
        });

        await license_pool.distrlimset(distrTwoUUID[0], counterTwoUUID[0], 2, 100, {
            authorization: ['testone']
        });

        // access denied check
        await license_pool.liccreate(distrOneUUID[0], licenseOneUUID[0], 'testtwo', {
            authorization: [scname]
        }).should.be.rejected;;

        await license_pool.liccreate(distrOneUUID[0], licenseOneUUID[0], 'testtwo', {
            authorization: ['testone']
        });

        await license_pool.liccreate(distrTwoUUID[0], licenseTwoUUID[0], 'testone', {
            authorization: ['testtwo']
        });

        await license_pool.liccreate(distrTwoUUID[0], licenseThreeUUID[0], scname, {
            authorization: ['testtwo']
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'license', {
            distributionUUID: distrOneUUID[1],
            state: LicenseState.Reserved,
            licenseUUID: licenseOneUUID[1],
            issued_from: 'testone',
            issued_to: 'testtwo'
        }), true, 'Reserved license not found!');

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'license', {
            distributionUUID: distrTwoUUID[1],
            state: LicenseState.Reserved,
            licenseUUID: licenseTwoUUID[1],
            issued_from: 'testtwo',
            issued_to: 'testone'
        }), true, 'Reserved license not found!');

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'license', {
            distributionUUID: distrTwoUUID[1],
            state: LicenseState.Reserved,
            licenseUUID: licenseThreeUUID[1],
            issued_from: 'testtwo',
            issued_to: scname
        }), true, 'Reserved license not found!');

        // access denied check
        await license_pool.licpropset(licenseOneUUID[0], licensePropUUID[0], 101, {
            authorization: [scname]
        }).should.be.rejected;

        await license_pool.licpropset(licenseOneUUID[0], licensePropUUID[0], 101, {
            authorization: ['testone']
        });

        await license_pool.licpropset(licenseTwoUUID[0], licensePropUUID[0], 400, {
            authorization: ['testtwo']
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'licprops', {
            licenseUUID: licenseOneUUID[1],
            key: licensePropUUID[1],
            value: 101
        }), true, 'License property not found!');

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'licprops', {
            licenseUUID: licenseTwoUUID[1],
            key: licensePropUUID[1],
            value: 400
        }), true, 'License property not found!');

        // access denied check
        await license_pool.licactivate(licenseOneUUID[0], {
            authorization: [scname]
        }).should.be.rejected;

        await license_pool.licactivate(licenseOneUUID[0], {
            authorization: ['testone']
        }).should.be.rejected;

        // change wrong property
        await license_pool.licpropset(licenseOneUUID[0], licensePropUUID[0], 400, {
            authorization: ['testone']
        });

        await license_pool.licpropset(licenseTwoUUID[0], licensePropUUID[0], 300, {
            authorization: ['testtwo']
        });

        await license_pool.licactivate(licenseTwoUUID[0], {
            authorization: ['testtwo']
        }).should.be.rejected;

        await license_pool.licpropset(licenseTwoUUID[0], licensePropUUID[0], 299, {
            authorization: ['testtwo']
        });

        await license_pool.licactivate(licenseOneUUID[0], {
            authorization: ['testone']
        });

        await license_pool.licactivate(licenseTwoUUID[0], {
            authorization: ['testtwo']
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'license', {
            distributionUUID: distrOneUUID[1],
            state: LicenseState.Active,
            licenseUUID: licenseOneUUID[1],
            issued_from: 'testone',
            issued_to: 'testtwo'
        }), true, 'Activated license not found!');

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'license', {
            distributionUUID: distrTwoUUID[1],
            state: LicenseState.Active,
            licenseUUID: licenseTwoUUID[1],
            issued_from: 'testtwo',
            issued_to: 'testone'
        }), true, 'Activated license not found!');

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrlimit', {
            distributionUUID: distrOneUUID[1],
            name: counterOneUUID[1],
            change: 1,
            value: 98
        }), true, 'Distribution delegation limit has wrong value!');

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrlimit', {
            distributionUUID: distrTwoUUID[1],
            name: counterTwoUUID[1],
            change: 2,
            value: 98
        }), true, 'Distribution delegation limit has wrong value!');

        // test counters
        await license_pool.distrlimset(distrOneUUID[0], counterOneUUID[0], 10, 9, {
            authorization: [scname]
        });

        await license_pool.distrlimset(distrTwoUUID[0], counterTwoUUID[0], 2, 2, {
            authorization: ['testone']
        });

        await license_pool.licactivate(licenseThreeUUID[0], {
            authorization: ['testtwo']
        }).should.be.rejected;

        await license_pool.distrlimset(distrOneUUID[0], counterOneUUID[0], 10, 10, {
            authorization: [scname]
        });

        await license_pool.licactivate(licenseThreeUUID[0], {
            authorization: ['testtwo']
        });

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'license', {
            distributionUUID: distrTwoUUID[1],
            state: LicenseState.Active,
            licenseUUID: licenseThreeUUID[1],
            issued_from: 'testtwo',
            issued_to: scname
        }), true, 'Activated license not found!');

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrlimit', {
            distributionUUID: distrOneUUID[1],
            name: counterOneUUID[1],
            change: 10,
            value: 0
        }), true, 'Distribution delegation limit has wrong value!');

        assert.equal(await tools.checkTableRecords(agr, scname, scname, 'distrlimit', {
            distributionUUID: distrTwoUUID[1],
            name: counterTwoUUID[1],
            change: 2,
            value: 0
        }), true, 'Distribution delegation limit has wrong value!');

    });
});