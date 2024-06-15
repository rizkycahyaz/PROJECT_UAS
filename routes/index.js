var express = require("express");
var router = express.Router();

const bcrypt = require("bcrypt");

const Model_Users = require("../model/Model_Users");
const Model_Kategori = require("../model/Model_Kategori");
const Model_Record = require("../model/Model_Record");
const Model_File = require("../model/Model_File");
const e = require("express");

/* GET home page. */
router.get("/", async function (req, res, next) {
  let kategori = await Model_Kategori.getAll();
  let totalDownloads = await Model_Record.getAll();
  let popularFiles = await Model_Record.getPopularFiles();
  let newestFiles = await Model_File.getNewestFile();
  // Log semua data record di console
  console.log("Total Downloads:", totalDownloads);
  console.log("Popular Files di Server:", popularFiles);
  res.render("auth/dashboard", {
    title: "Users Home",

    kategori: kategori,
    totalDownloads: totalDownloads,
    popularFiles: popularFiles,
    newestFiles,
  });
});
router.get("/register", function (req, res, next) {
  res.render("auth/register");
});
router.get("/login", function (req, res, next) {
  res.render("auth/login");
});

router.post("/saveusers", async (req, res) => {
  let { username, email, password } = req.body;
  let enkripsi = await bcrypt.hash(password, 10);
  let Data = {
    username,
    email,
    password: enkripsi,
  };
  await Model_Users.Store(Data);
  req.flash("success", "Berhasil Register!");
  res.redirect("/login");
});

router.post("/log", async (req, res) => {
  let { email, password } = req.body;
  try {
    let Data = await Model_Users.Login(email);
    if (Data.length > 0) {
      let enkripsi = Data[0].password;
      let cek = await bcrypt.compare(password, enkripsi);
      if (cek) {
        req.session.userId = Data[0].id_user;
        req.session.role = Data[0].role;
        //tambahkan kondisi pengecekan role pada user yang login
        if (Data[0].role == 2) {
          req.flash("success", "Berhasil login");
          res.redirect("/superusers");
        } else if (Data[0].role == 1) {
          req.flash("success", "Berhasil login");
          res.redirect("/users");
        } else {
          res.redirect("/login");
        }
        // akhir kondisi
      } else {
        req.flash("error", "Email atau password salah");
        res.redirect("/login");
      }
    } else {
      req.flash("error", "Akun tidak ditemukan");
      res.redirect("/login");
    }
  } catch (err) {
    res.redirect("/login");
    req.flash("error", "Error pada fungsi");
  }
});

router.get("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.error(err);
    } else {
      res.redirect("/login");
    }
  });
});

module.exports = router;
