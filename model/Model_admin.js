const connection = require("../config/database");

class Model_admin {
    static async getUsersWithLevelTwo() {
      return new Promise((resolve, reject) => {
        connection.query(
          "SELECT * FROM users WHERE role = 1 ORDER BY id_user DESC",
          (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          }
        );
      });
    }
  }
  
  module.exports = Model_admin;