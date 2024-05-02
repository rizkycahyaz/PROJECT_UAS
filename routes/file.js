const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Model_File = require("../model/Model_File");
const Model_Users = require("../model/Model_Users");

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
  try {
    let id = req.session.userId;
    let Data = await Model_Users.getId(id);

    if (Data.length > 0) {
      let rows = await Model_File.getAll();
      res.render("file/index", {
        data: rows,
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
    let Data = await Model_Users.getId(id);
    res.render("file/create", {
      email: Data[0].email,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/store", upload.single("file_pdf"), function (req, res, next) {
  try {
    let { nama_file, deskripsi } = req.body;
    let Data = {
      nama_file,
      deskripsi,
      file_pdf: req.file.filename,
      id_kategori: req.body.id_kategori, // id_kategori ditambahkan sebagai bagian dari data file
      id_users: req.session.userId, // id_users diambil dari sesi pengguna yang sedang login
    };
    Model_File.Store(Data);
    req.flash("success", "Berhasil menyimpan data");
    res.redirect("/file");
  } catch (error) {
    console.log(error);
    console.log(req);
  }
});

router.get("/edit/(:id)", async function (req, res, next) {
  let id = req.params.id;
  let rows = await Model_File.getById(id);
  res.render("file/edit", {
    id: rows[0].id_file,
    nama_file: rows[0].nama_file,
    deskripsi: rows[0].deskripsi,
    file_pdf: rows[0].file_pdf,
  });
});

router.post(
  "/update/(:id)",
  upload.single("file_pdf"),
  async function (req, res, next) {
    let id = req.params.id;
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
    let { nama_file, deskripsi } = req.body;
    let file_pdf = filebaru || namaFileLama;
    let Data = {
      nama_file,
      deskripsi,
      file_pdf,
    };
    Model_File.Update(id, Data);
    req.flash("success", "Berhasil menyimpan data");
    res.redirect("/file");
  }
);

router.get("/delete/:id", async function (req, res, next) {
  try {
    let id = req.params.id;

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
    res.redirect("/file");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
