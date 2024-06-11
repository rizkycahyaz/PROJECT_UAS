const connection = require("../config/database");

class Model_Dokumen {
    static async getAll() {
        return new Promise((resolve, reject) => {
          connection.query(
            "SELECT file.*, users.*, kategori.*, COUNT(file.id_file) as jumlah_file FROM file JOIN users ON file.id_user = users.id_user JOIN kategori ON file.id_kategori = kategori.id_kategori GROUP BY file.id_file",
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

      static async Delete(id) {
        return new Promise((resolve, reject) => {
          connection.query(
            "DELETE FROM file WHERE id_file = ?",
            [id],
            (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            }
          );
        });
      }
      static async getByUser(id) {
        return new Promise((resolve, reject) => {
          connection.query(
            "SELECT file.*, users.*, kategori.*, COUNT(file.id_file) as jumlah_file FROM file JOIN users ON file.id_user = users.id_user JOIN kategori ON file.id_kategori = kategori.id_kategori WHERE file.id_user = ? GROUP BY file.id_file",
            [id],
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

    
  
  module.exports = Model_Dokumen;