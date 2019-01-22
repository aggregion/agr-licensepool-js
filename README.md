# Aggregion blockchain platform JavaScript Tests

## Installation

```sh
npm install
```

## Run tests

```sh
npm test
```


# Full sales level test
There is sales scheme below wich will be implemented using js test file.

![Scheme](/tests/js/img/scheme.png?raw=true)

## Publish offers
First we need to create two license offers. First of all implement out helper function to set offer property:
``` javascript
async function offerSetProp(uuid, name, value, owner) {
    await license_pool.offerpropset(uuid, name, value, {
        authorization: [owner]
    });
}
```
### Alice in Wonderland
| Property | Value |
| ------ | ------ |
| Description | Troubled by a strange recurring dream and mourning the loss of her father, 19-year-old Alice Kingsleigh attends a garden party at Lord Ascot's estate. |
| ContentType | film |
| Year | 2010 |
| Duration | 108 m |
| Languages | English, Russian, Chinese, Kazak |
| Country | United States |
| Distributor | Walt Disney Studios Motion Pictures |
| Quality | 1920x1080p MPEG2 |

Creation code:
``` javascript
        await license_pool.offerset(offerAliceInWonderlandUUID, scname, "Alice in Wonderland", "Troubled by a strange recurring dream and mourning the loss of her father, 19-year-old Alice Kingsleigh attends a garden party at Lord Ascot's estate.", {
            authorization: [scname]
        });
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.ContentTypeUUID, 'film', scname);
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.YearUUID, '2010', scname);
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.DurationUUID, '108 m', scname);
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.LanguagesUUID, 'English, Russian, Chinese, Kazak', scname);
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.CountryUUID, 'United States', scname);
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.DistributorUUID, 'Walt Disney Studios Motion Pictures', scname);
        await offerSetProp(offerAliceInWonderlandUUID, UUIDS.QualityUUID, '1920x1080p MPEG2', scname);
```
### Prince of Persia
| Property | Value |
| ------ | ------ |
| Description | Dastan, a street urchin in Persia, is adopted by King Sharaman after showing courage. Fifteen years later, the king's brother Nizam relays evidence to the princes—Dastan. |
| ContentType | film |
| Year | 2010 |
| Duration | 116 m |
| Languages | English, Russian, Chinese, Kazak |
| Country | United States |
| Distributor | Walt Disney Studios Motion Pictures |
| Quality | 1920x1080p MPEG2 |

Creation code:
``` javascript
        await license_pool.offerset(offerPrinceOfPersiaUUID, scname, "Prince of Persia: The Sands of Time", "Dastan, a street urchin in Persia, is adopted by King Sharaman after showing courage. Fifteen years later, the king's brother Nizam relays evidence to the princes—Dastan.", {
            authorization: [scname]
        });
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.ContentTypeUUID, 'film', scname);
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.YearUUID, '2010', scname);
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.DurationUUID, '116 m', scname);
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.LanguagesUUID, 'English, Russian, Chinese, Kazak', scname);
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.CountryUUID, 'United States', scname);
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.DistributorUUID, 'Walt Disney Studios Motion Pictures', scname);
        await offerSetProp(offerPrinceOfPersiaUUID, UUIDS.QualityUUID, '1920x1080p MPEG2', scname);
```

## Create distribution delegations chain
Second we need to create full distribution delegations chain. Out helper function to create and set country and counter limit properties:

``` javascript
async function distrCreate(uuid, parent, offer, subject, owner, countryRuleType, country, issuedmax) {
    await license_pool.distrcreate(uuid, parent, offer, subject, {
        authorization: [owner]
    });
    await license_pool.distrruleset(uuid, countryRuleType, RuleCondition.Equal, UUIDS.CountryUUID, country, {
        authorization: [owner]
    });
    await license_pool.distrlimset(uuid, UUIDS.IssuedUUID, 1, issuedmax, {
        authorization: [owner]
    });
}
```

Creation:
``` javascript
        // main
        await distrCreate(distrAliceMainAUUID, UUIDS.NotValidUUID, offerAliceInWonderlandUUID, 'maindistra', scname, RuleType.Deny, 'CN', 200);
        await distrCreate(distrPrinceMainAUUID, UUIDS.NotValidUUID, offerPrinceOfPersiaUUID, 'maindistra', scname, RuleType.Deny, 'CN', 100);
        await distrCreate(distrAliceMainBUUID, UUIDS.NotValidUUID, offerAliceInWonderlandUUID, 'maindistrb', scname, RuleType.Deny, 'US', 100);
        await distrCreate(distrPrinceMainBUUID, UUIDS.NotValidUUID, offerPrinceOfPersiaUUID, 'maindistrb', scname, RuleType.Deny, 'US', 50);

        // regional
        await distrCreate(distrAliceRegionalRUSAUUID, distrAliceMainAUUID, offerAliceInWonderlandUUID, 'regionalrus', 'maindistra', RuleType.Allow, 'RU', 100);
        await distrCreate(distrPrinceRegionalRUSAUUID, distrPrinceMainAUUID, offerPrinceOfPersiaUUID, 'regionalrus', 'maindistra', RuleType.Allow, 'RU', 50);
        await distrCreate(distrAliceRegionalRUSBUUID, distrAliceMainBUUID, offerAliceInWonderlandUUID, 'regionalrus', 'maindistrb', RuleType.Allow, 'RU', 50);
        await distrCreate(distrPrinceRegionalRUSBUUID, distrPrinceMainBUUID, offerPrinceOfPersiaUUID, 'regionalrus', 'maindistrb', RuleType.Allow, 'RU', 25);

        await distrCreate(distrAliceRegionalUSAAUUID, distrAliceMainAUUID, offerAliceInWonderlandUUID, 'regionalusa', 'maindistra', RuleType.Allow, 'US', 100);
        await distrCreate(distrPrinceRegionalUSAAUUID, distrPrinceMainAUUID, offerPrinceOfPersiaUUID, 'regionalusa', 'maindistra', RuleType.Allow, 'US', 50);

        await distrCreate(distrAliceRegionalCHNBUUID, distrAliceMainBUUID, offerAliceInWonderlandUUID, 'regionalchn', 'maindistrb', RuleType.Allow, 'CN', 50);
        await distrCreate(distrPrinceRegionalCHNBUUID, distrPrinceMainBUUID, offerPrinceOfPersiaUUID, 'regionalchn', 'maindistrb', RuleType.Allow, 'CN', 25);

        await distrCreate(distrAliceRegionalKAZAUUID, distrAliceMainAUUID, offerAliceInWonderlandUUID, 'regionalkaz', 'maindistra', RuleType.Allow, 'KZ', 100);
        await distrCreate(distrPrinceRegionalKAZAUUID, distrPrinceMainAUUID, offerPrinceOfPersiaUUID, 'regionalkaz', 'maindistra', RuleType.Allow, 'KZ', 50);
        await distrCreate(distrAliceRegionalKAZBUUID, distrAliceMainBUUID, offerAliceInWonderlandUUID, 'regionalkaz', 'maindistrb', RuleType.Allow, 'KZ', 50);
        await distrCreate(distrPrinceRegionalKAZBUUID, distrPrinceMainBUUID, offerPrinceOfPersiaUUID, 'regionalkaz', 'maindistrb', RuleType.Allow, 'KZ', 25);
```

## Issue licenses

The last step is end-license issuing.Out helper function to issue and set license country. After set properties license dhould be activated:

``` javascript
async function licenseCreate(uuid, distr, issuer, subject, country) {
    await license_pool.liccreate(distr, uuid, subject, {
        authorization: [issuer]
    });
    await license_pool.licpropset(uuid, UUIDS.CountryUUID, country, {
        authorization: [issuer]
    });
    await license_pool.licactivate(uuid, {
        authorization: [issuer]
    });
}
```

Issuing process:
``` javascript
        await licenseCreate(license1UUID, distrPrinceRegionalRUSAUUID, 'regionalrus', 'testone', 'RU', true);
        await licenseCreate(license2UUID, distrAliceRegionalRUSAUUID, 'regionalrus', 'testone', 'RU', true);
        await licenseCreate(license3UUID, distrPrinceRegionalRUSBUUID, 'regionalrus', 'testone', 'RU', true);
        await licenseCreate(license4UUID, distrAliceRegionalCHNBUUID, 'regionalchn', 'testone', 'CN', true);
        await licenseCreate(license5UUID, distrPrinceRegionalUSAAUUID, 'regionalusa', 'testone', 'US', true);
        await licenseCreate(license6UUID, distrAliceRegionalUSAAUUID, 'regionalusa', 'testone', 'US', true);
        await licenseCreate(license7UUID, distrPrinceRegionalKAZAUUID, 'regionalkaz', 'testone', 'KZ', true);
        await licenseCreate(license8UUID, distrAliceRegionalKAZBUUID, 'regionalkaz', 'testone', 'KZ', true);
        await licenseCreate(license9UUID, distrPrinceRegionalKAZBUUID, 'regionalkaz', 'testone', 'KZ', true);
```