const db = require("../config/database");

class Model_Record {
  static async store(data) {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO Record (id_user, id_file, tanggal, bulan, tahun) VALUES (?, ?, ?, ?, ?)";
      db.query(query, [data.id_user, data.id_file, data.tanggal, data.bulan, data.tahun], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT Record.*, users.email, file.nama_file 
        FROM Record 
        JOIN users ON Record.id_user = users.id_user 
        JOIN file ON Record.id_file = file.id_file
      `;
      db.query(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async Delete(id) {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM Record WHERE id = ?";
      db.query(query, [id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}

module.exports = Model_Record;
