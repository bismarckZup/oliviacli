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
const uuid = require('uuid/v4');
const inquirer = require('inquirer');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

async function menu(actions) {
  const input = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select an action',
      choices: actions,
    }
  ]);

  return input.action;
}

async function customerId(data) {
  const input = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'customerId',
      message: 'Select the customer id',
      source: (_, inputValue) => data.filter(el => (!inputValue || el.includes(inputValue))),
      filter: element => element.split(' ')[0],
      validate: validateNotEmpty,
    }
  ]);

  return input.customerId;
}

async function accountId(data, when = true) {
  const input = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'accountId',
      message: 'Select the account id',
      source: (_, inputValue) => data.filter(el => (!inputValue || el.includes(inputValue))),
      filter: element => element.split(' ')[0],
      when,
      validate: validateNotEmpty,
    }
  ]);

  return input.accountId;
}

async function editTransactionId(data, when = true) {
  const input = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'transactionId',
      message: 'Select the transaction to be edited',
      source: (_, inputValue) => data.filter(el => (!inputValue || el.includes(inputValue))),
      filter: element => element.split(' ')[0],
      when,
      validate: validateNotEmpty,
    }
  ]);

  return input.transactionId;
}

async function createTransactionId() {
  const input = await inquirer.prompt([
    {
      type: 'input',
      name: 'transactionId',
      message: 'Insert the new transaction id',
      default: uuid(),
      validate: validateNotEmpty,
    }
  ]);

  return input.transactionId;
}

async function transaction(original) {
  const input = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Insert the description of the transaction',
      default: original ? original.description : 'DESCRICAO',
      validate: validateNotEmpty,
    },
    {
      type: 'list',
      name: 'cashflow',
      message: 'Is it an income or an expense?',
      choices: ['expense', 'income'],
      default: original && original.amount_brl > 0 ? 'income' : 'expense',
      validate: validateNotEmpty,
    },
    {
      type: 'number',
      name: 'amount',
      message: 'Insert the amount value (R$) of the transaction',
      default: original ? Math.abs(original.amount_brl) : '0.01',
      validate: validateNotEmpty,
    },
    {
      type: 'input',
      name: 'date',
      message: 'Insert the date of the transaction',
      default: original ? original.transaction_date : (new Date()).toISOString().split('T')[0],
      validate: validateDateFormat,
    }
  ]);

  return input;
}

async function baseTransaction(options) {
  const data = Object.keys(options).map(key => `${ key.padEnd(40, ' ') } - ${ options[key].description }`)
  const input = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'transactionId',
      message: 'Insert the transaction to be taken as base',
      source: (_, inputValue) => data.filter(el => (!inputValue || el.toLowerCase().includes(inputValue))),
      filter: element => element.split(' ')[0],
      validate: validateNotEmpty,
    }
  ]);

  return {
    ...options[input.transactionId],
    transaction_id: input.transactionId,
  };
}

function validateNotEmpty(value) {
  return value ? true : 'This field should not be empty';
}

function validateDateFormat(value) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!value.match(regEx)) return false;
  const date = new Date(value);
  const dateNum = date.getTime();
  if (!dateNum && dateNum !== 0) return false;
  return date.toISOString().slice(0,10) === value;
}

module.exports = {
  menu,
  customerId,
  accountId,
  editTransactionId,
  createTransactionId,
  transaction,
  baseTransaction,
};
