const connection = require("../config/database");

class Model_Users {
  static async getA11() {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM users ORDER BY id_user DESC",
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
      connection.query("INSERT INTO users SET ?", Data, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  static async Login(email) {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
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

  static async getId(id) {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM users WHERE id_user = ?",
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
        "UPDATE users SET ? WHERE id_user = ?",
        [Data, id],
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
        "DELETE FROM users WHERE id_user = ?",
        id,
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

  static async updateUserStatus(id, status) {
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE users SET status = ? WHERE id_user = ?",
        [status, id],
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

  static async updateUserStatusToBanned(id) {
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE users SET status = 'banned', banned_until = DATE_ADD(NOW(), INTERVAL 30 SECOND) WHERE id_user = ?",
        [id],
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

  static async updateUserStatusToActive(id) {
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE users SET status = 'aktif', banned_until = NULL WHERE id_user = ?",
        [id],
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

  static async getIdLogin(id) {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM users WHERE id_user = ? AND status = 'aktif'",
        [id],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows[0]); // Mengembalikan data pengguna pertama (atau null jika tidak ditemukan)
          }
        }
      );
    });
  }
}

module.exports = Model_Users;
