const express = require("express");
const router = express.Router();
const Model_File = require("../model/Model_File");
const Model_Users = require("../model/Model_Users");
const Model_Kategori = require("../model/Model_Kategori");
const Model_Save = require("../model/Model_Save"); // Tambahkan model untuk tabel save

router.get("/", async function (req, res, next) {
  let id = req.session.userId;
  let Data = await Model_Users.getId(id);
  try {
    if (Data.length > 0) {
      let rows = await Model_Save.getAll();
      res.render("save/index", {
        data: rows,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/login");
  }
});

router.get("/create", async function (req, res, next) {
  try {
    let id = req.session.userId;
    let userData = await Model_Users.getId(id);
    let saveData = await Model_Save.getAll();
    let fileData = await Model_File.getAll();
    res.render("save/create", {
      users: userData[0],
      save: saveData,
      file: fileData,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/store", async function (req, res, next) {
    try {
        let { id_file } = req.body;
        let userData = await Model_Users.getId(req.session.userId);
        let currentDate = new Date(); // Mengambil tanggal saat ini
        let saveData = {
          id_user: req.session.userId,
          id_file,
          tanggal: currentDate.getDate(),
          bulan: currentDate.getMonth() + 1, // Bulan dimulai dari 0, jadi tambahkan 1
          tahun: currentDate.getFullYear(),
        };
        await Model_Save.Store(saveData);
      
        req.flash("success", "Berhasil menyimpan data");
        res.redirect("/save");
      } catch (error) {
        console.error("Error:", error);
        req.flash("error", "Gagal menyimpan data");
        res.redirect("/save");
      }
      
});

// Bagian lain dari kode tetap sama

module.exports = router;
