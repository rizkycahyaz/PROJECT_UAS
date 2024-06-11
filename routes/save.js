const express = require("express");
const router = express.Router();
const Model_Files = require("../model/Model_Files");
const Model_Users = require("../model/Model_Users");
const Model_Kategori = require("../model/Model_Kategori");
const Model_Save = require("../model/Model_Save");

router.get("/", async function (req, res, next) {
  let id = req.session.userId;
  let Data = await Model_Users.getId(id);
  let kategori = await Model_Kategori.getAll();
  try {
    if (Data.length > 0) {
      let rows = await Model_Save.getAll();
      res.render("save/index", {
        data: rows,
        kategori2: kategori,
        email: Data[0].email,
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
    let fileData = await Model_Files.getAll();
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
    let currentDate = new Date();
    let saveData = {
      id_user: req.session.userId,
      id_file,
      tanggal: currentDate.getDate(),
      bulan: currentDate.getMonth() + 1,
      tahun: currentDate.getFullYear(),
    };
    await Model_Save.Store(saveData);

    res.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save bookmark" });
  }
});

router.get("/delete/(:id)", async function (req, res) {
  try {
    let id = req.params.id;
    let id_user = req.session.userId;
    let Data = await Model_Users.getId(id_user);
    if (Data[0].role == 1) {
      await Model_Save.Delete(id);
      req.flash("success", "Berhasil menghapus data");
      res.redirect("/save");
    } else if (Data[0].role == 2) {
      req.flash("failure", "Anda bukan admin");
      res.redirect("/save");
    }
  } catch {
    req.flash("invalid", "Anda harus login");
    res.redirect("/login");
  }
});

module.exports = router;
