const express = require("express");
const router = express.Router();
const Model_File = require("../model/Model_File");
const Model_Users = require("../model/Model_Users");
const Model_Kategori = require("../model/Model_Kategori");
const Model_Record = require("../model/Model_Record"); // Tambahkan model untuk tabel record

router.get("/", async function (req, res, next) {
  let id = req.session.userId;
  let Data = await Model_Users.getId(id);
  try {
    if (Data.length > 0) {
      let recordData = await Model_Record.getAll(); // Mendapatkan data record
      if (Array.isArray(recordData)) {
        // Pastikan recordData adalah array
        res.render("record/index", {
          record: recordData, // Menambahkan data record ke objek yang dilewatkan ke template
        });
      } else {
        throw new Error("Data from Model_Record.getAll() is not an array");
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/create", async function (req, res, next) {
  try {
    let id = req.session.userId;
    let userData = await Model_Users.getId(id);
    let recordData = await Model_Record.getAll();
    let fileData = await Model_File.getAll();
    res.render("record/create", {
      users: userData[0],
      record: recordData,
      file: fileData,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
