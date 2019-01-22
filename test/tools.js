'use strict';

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const Agr = require('@aggregion/agrjs');
const BN = require('bn.js');

let agrio_token;

async function getTable(agr, account, scope, table) {
    return await agr.getTableRows({
        code: account,
        scope: scope,
        table: table,
        json: true,
        limit: -1
    });
}

async function checkTableRecords(agr, account, scope, table, values) {
    let ret = false;

    const tab = await getTable(agr, account, scope, table);
    const keys = Object.keys(values);
    if (tab && tab.rows) {
        for (let i = tab.rows.length; i > 0; i--) {
            const row = tab.rows[i - 1];
            let found = true;
            for (let j = keys.length; j > 0; j--) {
                if (!row.hasOwnProperty(keys[j - 1])) {
                    found = false;
                    break;
                }
                const value = values[keys[j - 1]];
                const rowVal = row[keys[j - 1]];
                // check arrays
                if (Array.isArray(value) && Array.isArray(rowVal)) {
                    for (let k = value.length; k > 0; k--) {
                        if (rowVal.indexOf(value[k - 1]) == -1) {
                            found = false;
                            break;
                        }
                    }
                    if (!found) break;
                } else
                if (rowVal != value) {
                    found = false;
                    break;
                }
            }
            if (found) {
                ret = true;
                break;
            }
        }
    }
    return ret;
}

async function createAccount(agr, name, key) {
    const accounts = await agr.getKeyAccounts(key);
    if (accounts && accounts.hasOwnProperty('account_names')) {
        for (let pos = accounts.account_names.length; pos > 0; pos--) {
            if (accounts.account_names[pos - 1] == name) return;
        }
    }
    await agr.transaction(tr => {
        tr.newaccount({
            creator: 'agrio',
            name: name,
            owner: key,
            active: key
        });

        tr.buyrambytes({
            payer: 'agrio',
            receiver: name,
            bytes: 1024 * 1024
        })

        tr.delegatebw({
            from: 'agrio',
            receiver: name,
            stake_net_quantity: '10.0000 AGR',
            stake_cpu_quantity: '10.0000 AGR',
            transfer: 0
        })
    });

    if (name != 'agrio.token' && agrio_token) {
        await agrio_token.issue(name, '10000.0000 SYS', '', {
            authorization: ['agrio.token']
        });
    }
}

async function setContract(agr, account, wasmPath, abiPath) {
    const wasm = await readFile(wasmPath);
    const abi = await readFile(abiPath);

    let res = true;

    try {
        await agr.setcode(account, 0, 0, wasm);
    } catch (e) {
        res = false;
    }

    await agr.setabi(account, JSON.parse(abi));
    return res;
}

async function setNetwork(scname, wasm, abi) {
    const wif = [
        '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3',
        '5JtZhiTHqSKYCjfeyyRgo24EMHMP19WkbeYY6tXzojsQx7TVb7r',
        '5KNnXqqMTYDkGFCRwVziv56ncUBRjxzeK79F5S34yJjXgofdzDE',
        '5JkTMVqfT8BoaPuxMbUKCNV418sF65oF5ime458w4qa77N7YVjJ',
        '5K49DMXPM7DWXLVi45NKAegcPviVr9TF5RJeNJx5dA37dRLsMan'
    ];

    let agr = Agr({
        keyProvider: wif,
        //chainId: "8e2ce7ade074dd18b91743f3822d675055c6bc5830a0254cce9ead48946b8f5b"
    });

    await createAccount(agr, 'agrio.token', 'AGR7xzijWmEGY723cdvkcTXs5MfDZ7jKyha8R8mkVw3BKaZm4BCZz' /*5K49DMXPM7DWXLVi45NKAegcPviVr9TF5RJeNJx5dA37dRLsMan*/ );
    const res = await setContract(agr, 'agrio.token', './contracts/agrio.token/agrio.token.wasm', './contracts/agrio.token/agrio.token.abi');
    agrio_token = await agr.contract('agrio.token');
    if (res) {
        await agrio_token.create('agrio.token', '1000000000.0000 SYS', {
            authorization: ['agrio.token']
        });
        await agrio_token.issue('agrio', '10000.0000 SYS', '', {
            authorization: ['agrio.token']
        });
    }

    await createAccount(agr, 'testone', 'AGR7QxcceGC49yiQgdK2ecxDBRQ9QnFRfd9Zn5nQFHMTcim2e5bpp' /*5JtZhiTHqSKYCjfeyyRgo24EMHMP19WkbeYY6tXzojsQx7TVb7r*/ );
    await createAccount(agr, 'testtwo', 'AGR7tKxgPXoAXN4E6BM5iXMcCpP63vr6JW19pwTodrHZh8UxyAmGQ' /*5KNnXqqMTYDkGFCRwVziv56ncUBRjxzeK79F5S34yJjXgofdzDE*/ );
    await createAccount(agr, scname, 'AGR5xQ3iLQ76GUaLjYCryqUtJVdX2BGCac63xhfEucPTPYri9UTwv' /*5JkTMVqfT8BoaPuxMbUKCNV418sF65oF5ime458w4qa77N7YVjJ*/ );
    await setContract(agr, scname, wasm, abi);
    return agr;
}

function generateUUID() {
    let res = ['', ''];
    for (let i = 0; i < 16; i++) {
        const g = Math.floor((1 + Math.random()) * 0x100).toString(16).substring(1);
        res[0] += g;
        res[1] = g + res[1];
    }
    // convert
    res[0] = new BN(res[0], 16).toString(10);
    res[1] = '0x' + res[1];
    return res;
}

function getUUIDAsString(simple) {
    function pad_with_zeroes(number, length) {
        var my_string = '' + number;
        while (my_string.length < length) {
            my_string = '0' + my_string;
        }
        return my_string;
    }

    const tmp = pad_with_zeroes(new BN(simple, 10).toString(16), 32);
    return "0x" + pad_with_zeroes(tmp.match(/[a-fA-F0-9]{2}/g).reverse().join(''), 32);
}

module.exports = {
    getTable,
    checkTableRecords,
    createAccount,
    setContract,
    setNetwork,
    generateUUID,
    getUUIDAsString
}