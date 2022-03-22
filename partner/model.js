/* Copyright (C) Olivia AI, Inc. - All Rights Reserved
* Unauthorized copying, sharing or distribution of this file is strictly prohibited
* Proprietary and confidential
* Non-commercial, perpetual software license exclusively to Itaú Unibanco for internal use only
* Written by the Intelectual Property Officer of Olivia AI, Inc. <mailto:copyright@olivia.ai> - December 30, 2021
* The above copyright notice shall be included in all copies or substantial portions of this software
*
* Copyright (C) Olivia AI, Inc. - Todos os Direitos Reservados
* A cópia, compartilhamento ou distribuição não autorizada deste arquivo é estritamente proibida
* Proprietário e confidencial
* Licença de software não comercial e perpétua exclusivamente para o Itaú Unibanco apenas para uso interno
* Escrito pelo Diretor de Propriedade Intelectual da Olivia AI, Inc. <mailto:copyright@olivia.ai> - 30 de dezembro de 2021
* O aviso de direitos autorais acima deve ser incluído em todas as cópias ou partes substanciais deste software
*/
const chalk = require('chalk');
const stage = require('./stage');
const files = require('./files');

let dump;

/**
 * Loads the dump to memory
 * @param {string} dumpName name of the file to be loaded
 */
function load(dumpName) {
  dump = require(`./dumps/${ dumpName }`);
  loadStagedFiles();
}

/**
 * Loads all staged transactions to the original dump variable 
 */
function loadStagedFiles() {
  stage.getAll().forEach((file) => {
    const stagedCustomer = JSON.parse(file);
    const stagedCustomerId = stagedCustomer.customer_id;
    const stagedAccounts = stagedCustomer.accounts;

    let customer = getCustomer(stagedCustomerId);
    if (!customer) {
      dump.push(stagedCustomer);
      customer = stagedCustomer;
    }

    stagedAccounts.forEach(stagedAccount => loadStagedAccount(customer, stagedAccount));
  });
}

/**
 * Loads all staged accounts to the respective customers
 * @param {object} customer json of the customer as in the dump file
 * @param {object} stagedAccount json of the staged customer account
 */
function loadStagedAccount(customer, stagedAccount) {
  const stagedAccountId = stagedAccount.account_id;
  const stagedTransactions = stagedAccount.transactions;
  
  let account = getAccount(customer, stagedAccountId);
  if (!account) {
    customer.accounts.push(stagedAccount);
    account = stagedAccount;
  }

  stagedTransactions.forEach(stagedTransaction => loadStagedTransaction(account, stagedTransaction));
}

/**
 * Loads all staged transactions to the respective accounts
 * @param {object} account json of the customer account as in the dump file
 * @param {object} stagedTransaction json of the staged transaction
 */
function loadStagedTransaction(account, stagedTransaction) {
  const stagedTransactionId = stagedTransaction.transaction_id;
  const transaction = getTransaction(account, stagedTransactionId);

  if (transaction) {
    transaction.description = stagedTransaction.description;
    transaction.amount_original = stagedTransaction.amount_original;
    transaction.amount_brl = stagedTransaction.amount_brl;
    transaction.transaction_date = stagedTransaction.transaction_date;
  } else {
    account.transactions.push(stagedTransaction);
  }
}

/**
 * Returns a list of accounts and transactions of the customer
 * @param {string} customerId usually an uuid
 */
function overview(customerId) {
  const { accounts } = getCustomer(customerId);

  return accounts.map((account) => {
    const transactions = account.transactions
      .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
      .map(transaction =>  ({
        transaction_id: transaction.transaction_id,
        transaction_date: transaction.transaction_date,
        amount_brl: transaction.amount_brl,
        description: transaction.description,
      }));

    return { ...account, transactions };
  });
}

/**
 * Returns all customer ids with some extra info
 * (numActiveAccounts, numTransactions)
 */
function listCustomers() {
  return dump.map((customer) => {
    const activeAccounts = customer.accounts.filter(account => account.account_status == 'Active');
    const numTransactions = activeAccounts.reduce((acc, account) => acc + account.transactions.length, 0);
    return {
      customerId: customer.customer_id,
      numActiveAccounts: activeAccounts.length,
      numTransactions,
    };
  });
}

/**
 * Returns all transactions available in the dump and staging area
 */
function listTransactions() {
  const transactions = {};
  dump.forEach(customer => customer.accounts.forEach(
    account => account.transactions.forEach(
      (transaction) => {
        transactions[transaction.transaction_id] = {
          description: transaction.description,
          customer_id: customer.customer_id,
          account_id: account.account_id,
        };
      }
    )
  ));
  return transactions;
}

/**
 * Returns the object of the customer
 * @param {string} customerId
 */
function getCustomer(customerId) {
  return dump.filter(el => el.customer_id === customerId)[0];
}

/**
 * Returns an object of the account related to the given customer
 * @param {object} customer
 * @param {string} accountId
 */
function getAccount(customer, accountId) {
  return customer.accounts.filter(el => el.account_id === accountId)[0];
}

/**
 * Returns an object of the transaction related to the given account
 * @param {object} account
 * @param {string} transactionId
 */
function getTransaction(account, transactionId) {
  return account.transactions.filter(el => el.transaction_id === transactionId)[0];
}

/**
 * Returns a copy of the transaction with the given ids
 * @param {object} transactionIds ids
 * @param {string} transactionIds.customer_id
 * @param {string} transactionIds.account_id
 * @param {string} transactionIds.transaction_id
 */
function getTransactionRaw({ customer_id, account_id, transaction_id }) {
  const customer = getCustomer(customer_id);
  const account = getAccount(customer, account_id);
  return { ...getTransaction(account, transaction_id) };
}

/**
 * Includes a transaction in the staging area
 * @param {object} customer
 * @param {object} account
 * @param {object} transaction base transaction that will be changed with the following values
 * @param {string} description new transaction description
 * @param {float} value new transaction value
 * @param {string} date new transaction date (YYYY-MM-DD)
 */
function stageTransaction(customer, account, transaction, description, value, date) {
  const customerId = customer.customer_id;
  const accountId = account.account_id;
  const transactionId = transaction.transaction_id;

  const spotlight = chalk.bgGreen.black;
  console.log(spotlight(`\nNew transaction to customer ${ customerId } at account ${ accountId }`));
  console.log(spotlight(`${ description }: R$ ${ value } @ ${ date }\n`));

  let stagedCustomer = stage.getCustomer(customer);
  let stagedAccount = getAccount(stagedCustomer, accountId);
  if (!stagedAccount) {
    [stagedCustomer, stagedAccount] = stage.createAccount(customerId, account);
  }

  let stagedTransaction = getTransaction(stagedAccount, transactionId);
  if (stagedTransaction) {
    stagedTransaction = stage.editTransaction(stagedCustomer, stagedAccount, stagedTransaction, description, value, date);
  } else {
    stagedTransaction = stage.createTransaction(stagedCustomer, stagedAccount, transaction, description, value, date);
  }

  loadStagedTransaction(account, stagedTransaction);
}

/**
 * Mixes the dump with all the changes in staging area and created a new file
 */
function commitStagedChanges() {
  const filePath = files.commitChanges(dump);

  const spotlight = chalk.bgGreen.black;
  console.log(spotlight(`\nA new dump was created with the changed made to the transactions`));
  console.log(spotlight(`It's available at ${ filePath }\n`));
}

module.exports = {
  load,
  loadStagedTransaction,
  overview,
  listCustomers,
  listTransactions,
  getCustomer,
  getAccount,
  getTransaction,
  getTransactionRaw,
  stageTransaction,
  commitStagedChanges,
};
