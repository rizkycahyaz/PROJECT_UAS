const express = require("express");
const router = express.Router();
const Model_Kategori = require("../model/Model_Kategori.js");
const Model_Users = require("../model/Model_Users.js");

router.get("/", async function (req, res, next) {
  try {
    let id = req.session.userId;
    let Data = await Model_Users.getId(id);
    let rows = await Model_Kategori.getAll();
    let role = req.session.role;
    if (Data.length > 0) {
      res.render("kategori/index", {
        role: req.session.role,
        data: rows,
        role: role,
        kategori: kategori,
      });
    }
  } catch (err) {
    req.flash("invalid", "Anda harus login terlebih dahulu");
    res.redirect("/login");
    console.log(err);
  }
});

router.get("/create", async function (req, res, next) {
  try {
    let role = req.session.role;
    let id = req.session.userId;
    let Data = await Model_Users.getId(id);
    if (Data[0].role == "2") {
      res.render("kategori/create", {
        nama_kategori: "",
        judul_kategori: "",
        deskripsi: "",
        role: role,
      });
    } else if (Data[0].role == "1") {
      req.flash("failure", "Anda bukan bagian admin");
      res.redirect("/kategori");
    }
  } catch (Data) {
    req.flash("invalid", "Anda harus login terlebih dahulu");
    res.redirect("/login");
  }
});

router.post("/store", async function (req, res, next) {
  try {
    let { nama_kategori, judul_kategori, deskripsi } = req.body;
    let Data = {
      nama_kategori,
      judul_kategori,
      deskripsi,
    };
    await Model_Kategori.Store(Data);
    req.flash("success", "Berhasil menyimpan data baru!");
    res.redirect("/kategori");
  } catch {
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/kategori");
  }
});

router.get("/edit/(:id)", async function (req, res, next) {
  try {
    let role = req.session.role;
    let id_user = req.session.userId;
    let id = req.params.id;
    let rows = await Model_Kategori.getId(id);
    let Data = await Model_Users.getId(id_user);
    if (Data[0].role == "2") {
      res.render("kategori/edit", {
        id: rows[0].id_kategori,
        nama_kategori: rows[0].nama_kategori,
        judul_kategori: rows[0].judul_kategori,
        deskripsi: rows[0].deskripsi,
        role: role,
      });
    } else if (Data[0].role == "1") {
      req.flash("failure", "Anda bukan admin");
      res.redirect("/kategori");
    }
  } catch (Data) {
    req.flash("invalid", "Anda harus login");
    res.redirect("/login");
  }
});

router.post("/update/(:id)", async function (req, res, next) {
  try {
    let id = req.params.id;
    let { nama_kategori, judul_kategori, deskripsi } = req.body;
    let Data = {
      nama_kategori,
      judul_kategori,
      deskripsi,
    };
    await Model_Kategori.Update(id, Data);
    req.flash("success", "Berhasil memperbaharui data baru!");
    res.redirect("/kategori");
  } catch {
    req.flash("error", "terjadi kesalahan pada fungsi");
    res.render("/kategori");
  }
});

router.get("/delete/(:id)", async function (req, res) {
  try {
    let id = req.params.id;
    let id_user = req.session.userId;
    let Data = await Model_Users.getId(id_user);
    if (Data[0].role == 2) {
      await Model_Kategori.Delete(id);
      req.flash("success", "Berhasil menghapus data");
      res.redirect("/kategori");
    } else if (Data[0].role == 1) {
      req.flash("failure", "Anda bukan admin");
      res.redirect("/kategori");
    }
  } catch {
    req.flash("invalid", "Anda harus login");
    res.redirect("/login");
  }
});

module.exports = router;
