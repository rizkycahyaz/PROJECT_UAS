const express = require("express");
const router = express.Router();
const Model_File = require("../model/Model_File");
const Model_Users = require("../model/Model_Users");
const Model_Kategori = require("../model/Model_Kategori");
const Model_Record = require("../model/Model_Record");

router.get("/", async function (req, res, next) {
  let id = req.session.userId;
  let Data = await Model_Users.getId(id);
  try {
    let userData = await Model_Users.getId(id);
    if (userData.length > 0) {
      let recordData = await Model_Record.getAll();
      if (Array.isArray(recordData)) {
        let fileData = await Model_File.getByUser(id);
        res.render("record/index", {
          record: recordData,
          file: fileData, // Menambahkan data file ke objek yang dilewatkan ke template
        });
      } else {
        throw new Error("Data dari Model_Record.getAll() bukan array");
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
    if (userData.length > 0) {
      let recordData = await Model_Record.getAll();
      let fileData = await Model_File.getByUser(id);
      res.render("record/create", {
        users: userData[0],
        record: recordData,
        file: fileData,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
