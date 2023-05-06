const { BadRequestError } = require("../expressError");

// This helper is used in models/users.js in the update method. It is used to help create a query
// string based on user input.

// It takes an object, dataToUpdate, and returns a new object with the keys setCols and values. The
// setCols key has the value of a string made up of the keys from dataToUpdate equalling a $ sign
// and their index +1. The "values" key has the value of an array of the values from dataToUpdate.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  // {
  // setCols : '"first_name"=$1, "age"=$2',
  // values : ['Aliya', 32]
  // }
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };