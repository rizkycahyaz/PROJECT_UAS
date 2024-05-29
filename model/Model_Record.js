const connection = require("../config/database");

class Model_Record {
    static async getAll() {
        try {
          const query = `
            SELECT record.*, users.*, file.*
            FROM record
            JOIN users ON record.id_user = users.id_user
            JOIN file ON record.id_file = file.id_file
          `;
          const rows = await connection.query(query);
          return Array.isArray(rows) ? rows : []; // Pastikan selalu mengembalikan array
        } catch (err) {
          throw new Error('Failed to get all records: ' + err.message);
        }
      }
      

  static async getById(id) {
    try {
      const query = "SELECT * FROM record WHERE id_record = ?";
      const rows = await connection.query(query, [id]);
      return rows;
    } catch (err) {
      throw new Error("Failed to get record by id: " + err.message);
    }
  }
}

module.exports = Model_Record;
