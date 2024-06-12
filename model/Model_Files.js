const connection = require("../config/database");
const path = require("path");
const fs = require("fs");

class Model_Files {
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
        "SELECT * FROM file WHERE id_file = " + id,
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

  static async getWithRecord(id) {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM `file` JOIN record ON file.id_file = record.id_file ORDER BY record.total_download DESC",
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
        async (err, rows) => {
          if (err) {
            reject(err);
          } else {
            if (rows.length === 0) {
              reject(new Error("File not found"));
            } else {
              const file = rows[0];
              const filePath = path.resolve(
                __dirname,
                "../public/images/upload",
                file.file_pdf
              );

              // Baca file dari sistem file
              fs.readFile(filePath, async (err, data) => {
                if (err) {
                  reject(err);
                } else {
                  // Memperbarui nilai total unduhan dalam tabel file
                  try {
                    await Model_Files.incrementTotalDownload(id); // Memanggil fungsi untuk menambah total unduhan
                    resolve({
                      filename: file.file_pdf,
                      data: data,
                    });
                  } catch (error) {
                    reject(error);
                  }
                }
              });
            }
          }
        }
      );
    });
  }

  static async incrementTotalDownload(idFile) {
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE record SET total_download = total_download + 1 WHERE id_file = ?",
        [idFile],
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

module.exports = Model_Files;
