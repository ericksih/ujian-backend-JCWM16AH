const database = require("./database");
const token = require("./token");

module.exports = {
  ...database,
  ...token,
};
