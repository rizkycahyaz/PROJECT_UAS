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
      static async getById(id) {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT file.*, users.*, kategori.*, COUNT(file.id_file) as jumlah_file FROM file JOIN users ON file.id_user = users.id_user JOIN kategori ON file.id_kategori = kategori.id_kategori WHERE file.id_file = ? GROUP BY file.id_file",
                [id],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows[0]); // Menggunakan rows[0] karena kita hanya mengambil satu dokumen berdasarkan ID
                    }
                }
            );
        });
    }

      static async approve(id) {
        return new Promise((resolve, reject) => {
          connection.query(
            "UPDATE file SET pengajuan = 'setuju' WHERE id_file = ?",
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
    
      static async disapprove(id) {
        return new Promise((resolve, reject) => {
          connection.query(
            "UPDATE file SET pengajuan = 'tidak setuju' WHERE id_file = ?",
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
      
    }

    

    
  
  module.exports = Model_Dokumen;