const db = require("../config/database");

class Model_Record {
  static async store(data) {
    return new Promise((resolve, reject) => {
      const query =
        "INSERT INTO Record (id_user, id_file, tanggal, bulan, tahun) VALUES (?, ?, ?, ?, ?)";
      db.query(
        query,
        [data.id_user, data.id_file, data.tanggal, data.bulan, data.tahun],
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

  static async getPopularFiles(minDownloads = 2) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT file.nama_file, 
               COUNT(record.id_file) AS total_download 
        FROM file 
        JOIN record ON file.id_file = record.id_file 
        GROUP BY record.id_file 
        HAVING total_download > ? 
        ORDER BY total_download DESC
      `;
      db.query(query, [minDownloads], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          console.log("Popular Files:", rows); // Log hasil query
          resolve(rows);
        }
      });
    });
  }

  static async getDownloadByUserAndFile(userId, fileId) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM Record WHERE id_user = ? AND id_file = ?";
      db.query(query, [userId, fileId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      });
    });
  }

  static async incrementTotalDownload(idFile) {
    return new Promise((resolve, reject) => {
      db.query(
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
