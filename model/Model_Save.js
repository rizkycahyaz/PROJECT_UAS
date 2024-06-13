const connection = require("../config/database");

class Model_Save {
  static async getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT save.*, users.*, file.*
        FROM save
        JOIN users ON save.id_user = users.id_user
        JOIN file ON save.id_file = file.id_file
      `;
      connection.query(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async getAllByUser(id_user) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT save.*, users.*, file.*
        FROM save
        JOIN users ON save.id_user = users.id_user
        JOIN file ON save.id_file = file.id_file
        WHERE save.id_user = ?
      `;
      connection.query(query, [id_user], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async getById(id) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM save WHERE id_save = ?";
      connection.query(query, [id], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async Store(Data) {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO save SET ?";
      connection.query(query, Data, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  static async Update(id, Data) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE save SET ? WHERE id_save = ?";
      connection.query(query, [Data, id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  static async Delete(id) {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM save WHERE id_save = ?";
      connection.query(query, [id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}

module.exports = Model_Save;
