const connection = require("../config/database");
const path = require("path");
const fs = require("fs");

class Model_File {
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

  static async Store(Data) {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO file SET ?", Data, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  static async getById(id) {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM file WHERE id_file = ?",
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

  static async getByUser(id) {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM file WHERE id_user = ?",
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

  static async Update(id, Data) {
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE file SET ? WHERE id_file = " + id,
        Data,
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
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

  static async getUploadedFilesCount(userId) {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT COUNT(id_file) as total FROM file WHERE id_user = ?",
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows[0].total);
          }
        }
      );
    });
  }

  static async downloadFile(id) {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM file WHERE id_file = ?",
        [id],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            if (rows.length === 0) {
              reject(new Error("File not found"));
            } else {
              const file = rows[0];
              const filePath = path.join(
                __dirname,
                "../public/images/upload",
                file.file_pdf
              );
              // Baca file dari sistem file
              fs.readFile(filePath, (err, data) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    filename: file.file_pdf,
                    data: data,
                  });
                }
              });
            }
          }
        }
      );
    });
  }
}

module.exports = Model_File;
