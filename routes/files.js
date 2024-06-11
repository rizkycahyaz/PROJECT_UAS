const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Model_Files = require("../model/Model_Files");
const Model_Users = require("../model/Model_Users");
const Model_Kategori = require("../model/Model_Kategori");
const Model_Record = require("../model/Model_Record");

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
      let rows = await Model_Files.getAll();
      let kategori = await Model_Kategori.getAll();
      console.log(id);
      res.render("files/index", {
        data: rows,
        email: Data[0].email,
        kategori: kategori,
      });
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

    if (!id) {
      return res.status(400).send("User ID not found in session");
    }

    let userData = await Model_Users.getId(id); // Mengambil data pengguna
    if (!userData || userData.length === 0) {
      return res.status(404).send("User data not found");
    }

    let kategoriData = await Model_Kategori.getAll(); // Mengambil semua data kategori
    if (!kategoriData) {
      return res.status(404).send("Category data not found");
    }

    res.render("files/create", {
      users: userData[0],
      kategori: kategoriData,
      email: userData[0].email, // Mengirimkan data pengguna ke view
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
      // Mendapatkan data dari body permintaan
      let { nama_file, deskripsi, id_kategori, privasi, izin, hak_cipta } =
        req.body;

      // Mendapatkan data pengguna
      let userData = await Model_Users.getId(req.session.userId);

      // Menyiapkan data untuk disimpan
      let Data = {
        nama_file,
        deskripsi,
        file_pdf: req.file.filename, // Nama file yang diunggah
        id_kategori,
        id_user: req.session.userId,
        privasi,
        izin,
        hak_cipta,
      };

      // Menyimpan data ke database
      await Model_Files.Store(Data);

      // Mengirim respons ke klien bahwa penyimpanan berhasil
      req.flash("success", "Berhasil menyimpan data");
      res.redirect("/files/create"); // Redirect ke halaman pembuatan file lagi
    } catch (error) {
      // Jika ada kesalahan, tampilkan pesan kesalahan
      console.error("Error:", error);
      req.flash("error", "Gagal menyimpan data");
      res.redirect("/files/create"); // Redirect ke halaman pembuatan file lagi
    }
  }
);

router.get("/edit/:id", async function (req, res, next) {
  let id = req.params.id;
  try {
    let rows = await Model_Files.getById(id);
    let userData = await Model_Users.getId(req.session.userId);
    let kategoriData = await Model_Kategori.getAll();
    let kategoriId = rows[0].id_kategori;
    let kategoriById = await Model_Kategori.getId(kategoriId);
    res.render("files/edit", {
      id: rows[0].id_file,
      nama_file: rows[0].nama_file,
      deskripsi: rows[0].deskripsi,
      file_pdf: rows[0].file_pdf,
      kategoriData: kategoriData,
      privasi: rows[0].privasi,
      izin: rows[0].izin,
      hak_cipta: rows[0].hak_cipta,
      kategori: rows[0].id_kategori,
      kategoriById: kategoriById[0],
      user: userData,
      userId: req.params.userId,
      kategoriData,
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
    try {
      let filebaru = req.file ? req.file.filename : null;
      let rows = await Model_Files.getById(id);
      const namaFileLama = rows[0].file_pdf;
      if (filebaru && namaFileLama) {
        const pathFileLama = path.join(
          __dirname,
          "../public/images/upload",
          namaFileLama
        );
        fs.unlinkSync(pathFileLama);
      }
      let { nama_file, deskripsi, id_kategori, privasi, izin, hak_cipta } =
        req.body;
      let file_pdf = filebaru || namaFileLama;
      let Data = {
        nama_file,
        deskripsi,
        file_pdf,
        id_kategori,
        privasi,
        izin,
        hak_cipta,
      };

      await Model_Files.Update(id, Data);
      req.flash("success", "Berhasil menyimpan data");
      res.redirect("/files");
    } catch (error) {
      console.error("Error:", error);
      req.flash("error", "Gagal menyimpan data");
      res.redirect("/files/edit/" + id);
    }
  }
);

router.get("/delete/:id", async function (req, res, next) {
  let id = req.params.id;
  try {
    let rows = await Model_Files.getById(id);
    if (rows.length > 0 && rows[0].file_pdf) {
      const namaFileLama = rows[0].file_pdf;
      const pathFileLama = path.join(
        __dirname,
        "../public/images/upload",
        namaFileLama
      );
      fs.unlinkSync(pathFileLama);
    }
    await Model_Files.Delete(id);
    req.flash("success", "Berhasil menghapus data");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal menghapus data");
  } finally {
    res.redirect("/files");
  }
});

router.get("/download/:id", async function (req, res, next) {
  try {
    let uploadedFiles = await Model_Files.getUploadedFilesCount(
      req.session.userId
    );
    if (uploadedFiles < 3) {
      req.flash(
        "error",
        "Anda harus mengunggah minimal 3 file sebelum dapat mengunduh."
      );
      return res.redirect("/files");
    }

    console.log(
      `User ID: ${req.session.userId} is downloading file ID: ${req.params.id}`
    );

    let fileData = await Model_Files.downloadFile(req.params.id);
    if (!fileData) {
      throw new Error("File data not found.");
    }

    console.log(`File data retrieved: ${fileData.filename}`);

    let now = new Date();
    let recordData = {
      id_user: req.session.userId,
      id_file: req.params.id,
      tanggal: now.getDate(),
      bulan: now.getMonth() + 1, // Bulan dimulai dari 0
      tahun: now.getFullYear(),
    };

    await Model_Record.store(recordData);

    res.setHeader(
      "Content-disposition",
      "attachment; filename=" + fileData.filename
    );
    res.setHeader("Content-type", "application/pdf");
    res.end(fileData.data);
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal mengunduh file.");
    res.redirect("/files");
  }
});

module.exports = router;
