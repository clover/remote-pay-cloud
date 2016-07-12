module.exports.employees = employees;
/**
* @namespace employees
*/
function employees() {}

employees.AccountRole = require("./AccountRole");
employees.Employee = require("./Employee");
employees.Permission = require("./Permission");
employees.PermissionSet = require("./PermissionSet");
employees.PermissionSetRole = require("./PermissionSetRole");
employees.Permissions = require("./Permissions");
employees.Role = require("./Role");
employees.Shift = require("./Shift.js");
//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = employees;
}