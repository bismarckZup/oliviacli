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
const files = require('./files');

/**
 * Reads all stage files present in the staging area
 */
function getAll() {
  return files.readAllStagedChanges();
}

/**
 * Returns the content of the staged changes of the given customer
 * Creates a file if none exists
 * @param {object} customer
 */
function getCustomer(customer) {
  const customerId = customer.customer_id;
  let stagedCustomer = files.readStagedChanges(customerId);

  if (!stagedCustomer) {
    stagedCustomer = createCustomer(customer);
  }

  return stagedCustomer;
}

function createCustomer(customer) {
  // eslint-disable-next-line no-unused-vars
  const { accounts, ...customerInfos } = customer;
  const newCustomer = { ...customerInfos, accounts: [] }

  files.stageChanges(customer.customer_id, newCustomer);
  return newCustomer;
}

/**
 * Returns the content of the staged changes of the given account for the given customer
 * Creates an account for that same customer if none exists
 * @param {string} customerId
 * @param {object} account
 */
function createAccount(customerId, account) {
  // eslint-disable-next-line no-unused-vars
  const { transactions, ...accountInfos } = account;
  const stagedCustomer = files.readStagedChanges(customerId);

  const { accounts: stagedAccounts, ...stagedCustomerInfos } = stagedCustomer;

  const newAccount = {
    ...accountInfos,
    transactions: [],
  };
  const newCustomer = {
    ...stagedCustomerInfos,
    accounts: [
      ...stagedAccounts,
      newAccount,
    ],
  }

  files.stageChanges(customerId, newCustomer);
  return [newCustomer, newAccount];
}

/**
 * Includes a transaction to the given account in the staging area
 * @param {object} stagedCustomer
 * @param {object} stagedAccount
 * @param {object} transaction base transaction that will be changed with the following values
 * @param {string} description new transaction description
 * @param {float} value new transaction value
 * @param {string} date new transaction date (YYYY-MM-DD)
 */
function createTransaction(stagedCustomer, stagedAccount, transaction, description, value, date) {
  const customerId = stagedCustomer.customer_id;

  const newTransaction = {
    ...transaction,
    description,
    amount_original: value,
    amount_brl: value,
    transaction_date: date,
  }

  stagedAccount.transactions.push(newTransaction);
  files.stageChanges(customerId, stagedCustomer);
  return newTransaction;
}

/**
 * Edits a transaction to the given account in the staging area
 * @param {object} stagedCustomer
 * @param {object} stagedAccount
 * @param {object} transaction base transaction that will be changed with the following values
 * @param {string} description new transaction description
 * @param {float} value new transaction value
 * @param {string} date new transaction date (YYYY-MM-DD)
 */
function editTransaction(stagedCustomer, _stagedAccount, transaction, description, value, date) {
  const customerId = stagedCustomer.customer_id;

  transaction.description = description;
  transaction.amount_original = value;
  transaction.amount_brl = value;
  transaction.transaction_date = date;

  files.stageChanges(customerId, stagedCustomer);
  return transaction;
}

module.exports = {
  getAll,
  getCustomer,
  createCustomer,
  createAccount,
  createTransaction,
  editTransaction,
};
