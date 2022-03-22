#!/usr/bin/env node
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


const program = require('commander');
const view = require('./view');
const input = require('./input');
const model = require('./model');

program.version('0.1');

const partner = program.command('partner');

partner.command('load <fileName>')
  .description('loads a dump file in dumps folder')
  .action(load);

program.parse(process.argv);

async function load(fileName) {
  model.load(fileName);
  await eventLoop();
}

/**
 * Runs after load and will be pending until the 'quit' option is selected
 */
async function eventLoop() {
  const actions = ['view', 'add', 'edit', 'commit', 'quit'];
  let action;

  do {
    action = await input.menu(actions);

    switch (action) {
      case 'view':
        await viewAction();
        break;
      case 'add':
        await addAction();
        break;
      case 'edit':
        await editAction();
        break;
      case 'commit':
        await commitAction();
        break;
    }
  } while (action != 'quit');
}

async function viewAction() {
  const customerIds = model.listCustomers().map(view.customer);
  const customerId = await input.customerId(customerIds);

  model.overview(customerId).forEach((account) => {
    console.log(`  Account ${ view.coloredAccount(account) }`);
    account.transactions.map(transaction => console.log(`    ${ view.transaction(transaction) }`));
    console.log('');
  });
}

async function addAction() {
  const options = { allowCreation: true };
  const customer = await inquireCustomer(options);
  const account = await inquireAccount(customer, options);

  const baseTransactionData = await input.baseTransaction(model.listTransactions());
  const transaction = model.getTransactionRaw(baseTransactionData);
  transaction.transaction_id = await input.createTransactionId();

  const { description, cashflow, amount, date } = await input.transaction(transaction);
  const value = (cashflow == 'income' ? 1 : -1) * amount;

  model.stageTransaction(customer, account, transaction, description, value, date);
}

async function editAction() {
  const options = { allowCreation: false };
  const customer = await inquireCustomer(options);
  const account = await inquireAccount(customer, options);

  const transactionIds = account.transactions.map(view.transaction);
  const transactionId = await input.editTransactionId(transactionIds);
  const transaction = model.getTransaction(account, transactionId);

  const { description, cashflow, amount, date } = await input.transaction(transaction);
  const value = (cashflow == 'income' ? 1 : -1) * amount;

  model.stageTransaction(customer, account, transaction, description, value, date);
}

async function commitAction() {
  model.commitStagedChanges();
}

/**
 * Prompts a select list to receive one customer from the existing bunch
 * @param {object} customer
 * @param {object} options.allowCreation
 */
async function inquireCustomer({ allowCreation = false }) {
  const customerIds = model.listCustomers().map(view.customer);

  if (allowCreation) {
    customerIds.concat(['create new customer']);
  }

  const customerId = await input.customerId(customerIds);
  
  if (allowCreation && customerId === 'create') {
    throw Error('Not implemented');
  }
  
  return model.getCustomer(customerId);
}

/**
 * Prompts a select list to receive one account from the given customer
 * @param {object} customer
 * @param {object} options.allowCreation
 */
async function inquireAccount(customer, { allowCreation = false }) {
  const accountIds = customer.accounts.map(view.account);

  if (allowCreation) {
    accountIds.concat(['create new account']);
  }

  const customerExists = !!customer;
  const accountId = await input.accountId(accountIds, customerExists);
  
  if (allowCreation && (!accountId || accountId === 'create')) {
    throw Error('Not implemented');
  }

  return model.getAccount(customer, accountId);
}
