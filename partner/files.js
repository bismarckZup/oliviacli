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
const { extname } = require('path');
const fs = require('fs');

const stageDir = `${ __dirname }/staging_area`;
const dumpsDir = `${ __dirname }/dumps`;

/**
 * Returns all contents of the json files in the staging area
 */
function readAllStagedChanges() {
  return fs.readdirSync(stageDir)
    .filter(file => extname(file) === '.json')
    .map(file => fs.readFileSync(`${ stageDir }/${ file }`));
}

/**
 * Returns the content of the file related to the given customer
 * @param {string} customerId
 */
function readStagedChanges(customerId) {
  const filePath = `${ stageDir }/${ customerId }.json`;
  if (!fs.existsSync(filePath)) return false;
  
  const file = fs.readFileSync(filePath);
  return JSON.parse(file);
}

/**
 * Replaces the file of the given customer by the new json content
 * @param {string} customerId
 * @param {json} jsonContent
 */
function stageChanges(customerId, jsonContent) {
  const filePath = `${ stageDir }/${ customerId }.json`;
  fs.writeFileSync(filePath, JSON.stringify(jsonContent));
}

/**
 * Creates a new dump file with the new json content
 * @param {json} jsonContent
 */
function commitChanges(jsonContent) {
  const filePath = `${ dumpsDir }/dump${ Date.now() }.txt`;
  const dump = `const messages = ${ JSON.stringify(jsonContent) };\n\nmodule.exports = messages;`;
  fs.writeFileSync(filePath, dump);
  return filePath;
}

module.exports = {
  readAllStagedChanges,
  readStagedChanges,
  stageChanges,
  commitChanges,
};
