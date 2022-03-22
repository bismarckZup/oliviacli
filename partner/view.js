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

function customer({ customerId, numActiveAccounts, numTransactions }) {
  const append = numActiveAccounts > 0 ? `with ${ numTransactions } transactions` : '';
  return `${ customerId } - ${ numActiveAccounts } active accounts ${ append }`;
}

function account(obj) {
  return `${ obj.account_id } - ${ obj.account_status.toLowerCase() }`;
}

function coloredAccount(obj) {
  const color = obj.account_status == 'Active' ? chalk.green : chalk.red;
  return color(account(obj));
}

function transaction(obj) {
  return `${ obj.transaction_id.padEnd(40, ' ') }- ${ obj.transaction_date } - ${ money(obj.amount_brl) } - ${ obj.description }`;
}

/**
 * Transforms a float to a string in money format
 * red if amount is negative and green if it is positive
 * @param {float} amount
 */
function money(amount) {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    signDisplay: 'always',
  });
  const result = formatter.format(amount).replace(/^(\D+)/, '$1 ').padEnd(14, ' ');
  return amount < 0 ? chalk.red(result) : chalk.green(result);
}

module.exports = {
  customer,
  account,
  coloredAccount,
  transaction,
};
