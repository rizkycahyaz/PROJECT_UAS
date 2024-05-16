const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Model_File = require("../model/Model_File");
const Model_Users = require("../model/Model_Users");
const Model_Kategori = require("../model/Model_Kategori");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/upload");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.get("/", async function (req, res, next) {
  let id = req.session.userId;
  let Data = await Model_Users.getId(id);
  try {
    if (Data.length > 0) {
      let rows = await Model_File.getAll();
      console.log(id);
      res.render("file/index", {
        data: rows,
      });
    } else {
      res.redirect("/login");
      console.log(id);
    }
  } catch (error) {
    res.redirect("/login");
  }
});

router.get("/create", async function (req, res, next) {
  try {
    let id = req.session.userId;
    let userData = await Model_Users.getId(id); // Mengambil data pengguna
    let kategoriData = await Model_Kategori.getAll(); // Mengambil semua data kategori
    res.render("file/create", {
      users: userData[0],
      kategori: kategoriData, // Mengirimkan data kategori ke view
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/store",
  upload.single("file_pdf"),
  async function (req, res, next) {
    try {
      let { nama_file, deskripsi, id_kategori } = req.body;
      let userData = await Model_Users.getId(req.session.userId); // Mengambil data pengguna
      let Data = {
        nama_file,
        deskripsi,
        file_pdf: req.file.filename,
        id_kategori,
        id_user: req.session.userId,
        privasi: req.body.privasi,
        izin: req.body.izin,
        hak_cipta: req.body.hak_cipta,
        // email: userData[0].email, // Menambahkan email pengguna ke data yang disimpan
      };
      await Model_File.Store(Data);
      req.flash("success", "Berhasil menyimpan data");
      res.redirect("/file");
    } catch (error) {
      console.error("Error:", error);
      req.flash("error", "Gagal menyimpan data");
      res.redirect("/file/create");
    }
  }
);

router.get("/edit/:id", async function (req, res, next) {
  let id = req.params.id;
  try {
    let rows = await Model_File.getById(id);
    let userData = await Model_Users.getId(req.session.userId); // Mengambil data pengguna
    let kategoriData = await Model_Kategori.getAll(); // Mengambil semua data kategori
    let kategoriId = rows[0].id_kategori;
    let kategoriById = await Model_Kategori.getId(kategoriId);
    console.log(kategoriData.id_kategori);
    res.render("file/edit", {
      id: rows[0].id_file,
      nama_file: rows[0].nama_file,
      deskripsi: rows[0].deskripsi,
      file_pdf: rows[0].file_pdf,
      kategoriData: kategoriData,
      privasi: rows[0].privasi,
      izin: rows[0].izin,
      hak_cipta: rows[0].hak_cipta, // Mengirimkan data kategori ke view
      kategori: rows[0].id_kategori,
      kategoriById: kategoriById[0],
      user: userData,
      userId: req.params.userId,
      kategoriData,
      // email: userData[0].email, // Menambahkan email pengguna ke data yang ditampilkan
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/update/:id",
  upload.single("file_pdf"),
  async function (req, res, next) {
    let id = req.params.id;
    // try {
    let filebaru = req.file ? req.file.filename : null;
    let rows = await Model_File.getById(id);
    const namaFileLama = rows[0].file_pdf;
    if (filebaru && namaFileLama) {
      const pathFileLama = path.join(
        __dirname,
        "../public/images/upload",
        namaFileLama
      );
      fs.unlinkSync(pathFileLama);
    }
    let { nama_file, deskripsi, id_kategori } = req.body;
    let file_pdf = filebaru || namaFileLama;
    let Data = {
      nama_file,
      deskripsi,
      file_pdf,
      id_kategori: id_kategori,
      privasi: req.body.privasi,
      izin: req.body.izin,
      hak_cipta: req.body.hak_cipta,
    };

    await Model_File.Update(id, Data);
    req.flash("success", "Berhasil menyimpan data");
    res.redirect("/file");
    // } catch (error) {
    //   console.error("Error:", error);
    //   req.flash("error", "Gagal menyimpan data");
    //   res.redirect("/file/edit/" + id);
    // }
  }
);

router.get("/delete/:id", async function (req, res, next) {
  let id = req.params.id;
  try {
    let rows = await Model_File.getById(id);
    if (rows.length > 0 && rows[0].file_pdf) {
      const namaFileLama = rows[0].file_pdf;
      const pathFileLama = path.join(
        __dirname,
        "../public/images/upload",
        namaFileLama
      );
      fs.unlinkSync(pathFileLama);
    }
    await Model_File.Delete(id);
    req.flash("success", "Berhasil menghapus data");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal menghapus data");
  } finally {
    res.redirect("/file");
  }
});

module.exports = router;
