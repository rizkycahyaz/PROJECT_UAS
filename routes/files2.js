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

// Middleware untuk memeriksa apakah pengguna sudah login
const isLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    next(); // Lanjut ke penangan rute selanjutnya jika pengguna sudah login
  } else {
    res.redirect("/Login"); // Pengguna belum login, kembalikan status Unauthorized
  }
};

// Terapkan middleware `isLoggedIn` sebelum penangan rute
router.get("/", async function (req, res, next) {
  try {
    let rows = await Model_Files.getAll();
    let kategori = await Model_Kategori.getAll();

    res.render("files2/index", {
      data: rows,
      kategori: kategori,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Terapkan middleware `isLoggedIn` sebelum rute /create
router.get("/create", isLoggedIn, async function (req, res, next) {
  try {
    let id = req.session.userId;

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
      email: userData[0].email,
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
      let { nama_file, deskripsi, id_kategori, privasi, izin, hak_cipta } =
        req.body;

      let userData = await Model_Users.getId(req.session.userId);

      let Data = {
        nama_file,
        deskripsi,
        file_pdf: req.file.filename,
        id_kategori,
        id_user: req.session.userId,
        privasi,
        izin,
        hak_cipta,
      };

      await Model_Files.Store(Data);

      req.flash("success", "Berhasil menyimpan data");
      res.redirect("/files/create");
    } catch (error) {
      console.error("Error:", error);
      req.flash("error", "Gagal menyimpan data");
      res.redirect("/files/create");
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
      throw new Error("Data file tidak ditemukan.");
    }

    console.log(`Data file ditemukan: ${fileData.filename}`);

    let existingDownload = await Model_Record.getDownloadByUserAndFile(
      req.session.userId,
      req.params.id
    );

    if (!existingDownload) {
      let now = new Date();
      let recordData = {
        id_user: req.session.userId,
        id_file: req.params.id,
        tanggal: now.getDate(),
        bulan: now.getMonth() + 1,
        tahun: now.getFullYear(),
      };
      await Model_Record.store(recordData);
    } else {
      await Model_Record.incrementTotalDownload(existingDownload.id);
    }

    await Model_Files.incrementTotalDownload(req.params.id);

    res.setHeader(
      "Content-disposition",
      "attachment; filename=" + fileData.filename
    );
    res.setHeader("Content-type", "application/pdf");
    res.end(fileData.data);
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", `Gagal mengunduh file: ${error.message}`);
    res.redirect("/files");
  }
});

module.exports = router;
