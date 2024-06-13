const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Model_Files = require("../model/Model_Files");
const Model_Users = require("../model/Model_Users");
const Model_Kategori = require("../model/Model_Kategori");
const Model_Record = require("../model/Model_Record");

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/upload");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Home route
router.get("/", async (req, res) => {
  const userId = req.session.userId;
  try {
    const user = await Model_Users.getId(userId);
    if (user.length > 0) {
      const files = await Model_Files.getAll();
      const categories = await Model_Kategori.getAll();
      res.render("files/index", {
        data: files,
        email: user[0].email,
        kategori: categories,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Create route
router.get("/create", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(400).send("User ID not found in session");
  }

  try {
    const user = await Model_Users.getId(userId);
    const categories = await Model_Kategori.getAll();
    if (!user || !categories) {
      return res.status(404).send("User or category data not found");
    }

    res.render("files/create", {
      users: user[0],
      kategori: categories,
      email: user[0].email,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Store route
router.post("/store", upload.single("file_pdf"), async (req, res) => {
  const { nama_file, deskripsi, id_kategori, privasi, izin, hak_cipta } =
    req.body;
  const userId = req.session.userId;

  try {
    const user = await Model_Users.getId(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const fileData = {
      nama_file,
      deskripsi,
      file_pdf: req.file.filename,
      id_kategori,
      id_user: userId,
      privasi,
      izin,
      hak_cipta,
    };

    await Model_Files.Store(fileData);
    req.flash("success", "Berhasil menyimpan data");
    res.redirect("/files/create");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal menyimpan data");
    res.redirect("/files/create");
  }
});

// Edit route
router.get("/edit/:id", async (req, res) => {
  const fileId = req.params.id;
  const userId = req.session.userId;

  try {
    const file = await Model_Files.getById(fileId);
    const user = await Model_Users.getId(userId);
    const categories = await Model_Kategori.getAll();
    const categoryById = await Model_Kategori.getId(file[0].id_kategori);

    res.render("files/edit", {
      ...file[0],
      kategoriData: categories,
      kategoriById: categoryById[0],
      user: user[0],
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Update route
router.post("/update/:id", upload.single("file_pdf"), async (req, res) => {
  const fileId = req.params.id;
  const { nama_file, deskripsi, id_kategori, privasi, izin, hak_cipta } =
    req.body;
  const newFile = req.file ? req.file.filename : null;

  try {
    const file = await Model_Files.getById(fileId);
    const oldFileName = file[0].file_pdf;

    if (newFile && oldFileName) {
      fs.unlinkSync(
        path.join(__dirname, "../public/images/upload", oldFileName)
      );
    }

    const fileData = {
      nama_file,
      deskripsi,
      file_pdf: newFile || oldFileName,
      id_kategori,
      privasi,
      izin,
      hak_cipta,
    };

    await Model_Files.Update(fileId, fileData);
    req.flash("success", "Berhasil menyimpan data");
    res.redirect("/files");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal menyimpan data");
    res.redirect(`/files/edit/${fileId}`);
  }
});

// Delete route
router.get("/delete/:id", async (req, res) => {
  const fileId = req.params.id;

  try {
    const file = await Model_Files.getById(fileId);
    if (file.length > 0 && file[0].file_pdf) {
      fs.unlinkSync(
        path.join(__dirname, "../public/images/upload", file[0].file_pdf)
      );
    }

    await Model_Files.Delete(fileId);
    req.flash("success", "Berhasil menghapus data");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal menghapus data");
  } finally {
    res.redirect("/files");
  }
});

// Download route
router.get("/download/:id", async (req, res) => {
  const userId = req.session.userId;
  const fileId = req.params.id;

  try {
    const uploadedFilesCount = await Model_Files.getUploadedFilesCount(userId);
    if (uploadedFilesCount < 3) {
      req.flash(
        "error",
        "Anda harus mengunggah minimal 3 file sebelum dapat mengunduh."
      );
      return res.redirect("/files");
    }

    const file = await Model_Files.downloadFile(fileId);
    if (!file) {
      throw new Error("Data file tidak ditemukan.");
    }

    const existingDownload = await Model_Record.getDownloadByUserAndFile(
      userId,
      fileId
    );
    if (!existingDownload) {
      await Model_Record.store({
        id_user: userId,
        id_file: fileId,
        tanggal: new Date().getDate(),
        bulan: new Date().getMonth() + 1,
        tahun: new Date().getFullYear(),
      });
    } else {
      await Model_Record.incrementTotalDownload(existingDownload.id);
    }

    await Model_Files.incrementTotalDownload(fileId);
    res.setHeader(
      "Content-disposition",
      `attachment; filename=${file.filename}`
    );
    res.setHeader("Content-type", "application/pdf");
    res.end(file.data);
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", `Gagal mengunduh file: ${error.message}`);
    res.redirect("/files");
  }
});

// Detail route
router.get("/detail/:id", async (req, res) => {
  const fileId = req.params.id;

  try {
    const fileDetail = await Model_Files.getById(fileId);
    res.render("files/detail", { detail: fileDetail });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
