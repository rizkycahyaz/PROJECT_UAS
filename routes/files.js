const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Model_Files = require("../model/Model_Files");
const Model_Users = require("../model/Model_Users");
const Model_Kategori = require("../model/Model_Kategori");
const Model_Record = require("../model/Model_Record");
const flash = require("express-flash");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/upload");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const checkUserStatus = async (req, res, next) => {
  const id = req.session.userId; // Adjust according to how you store user information

  try {
    const user = await Model_Users.getIdLogin(id); // Replace with the appropriate method to get the user from your model
    if (!user || user.status == "banned") {
      req.flash("error", "Akun anda telah di banned");
      res.redirect("/files"); // Replace with an appropriate route
    } else {
      next();
    }
  } catch (error) {
    console.error("Error checking user status:", error);
    res.status(500).json({ message: "Failed to check user status." });
  }
};

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
        username: Data[0].username,
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
      username: userData[0].username, // Mengirimkan data pengguna ke view
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/store",
  upload.single("file_pdf"),
  checkUserStatus,
  async function (req, res, next) {
    let userData = await Model_Users.getId(req.session.userId);
    try {
      if (userData[0].jumlah_upload >= 3) {
        req.flash(
          "error",
          "Anda harus menunggu file yang anda upload disetujui"
        );

        res.redirect("/files");
      } else {
        // Mendapatkan data dari body permintaan
        let { nama_file, deskripsi, id_kategori, privasi, izin, hak_cipta } =
          req.body;

        // Mendapatkan data pengguna

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
        let sum = userData[0].jumlah_upload + 1;

        // Menyimpan data ke database
        await Model_Files.Store(Data);
        await Model_Users.Update(req.session.userId, { jumlah_upload: sum });

        // Mengirim respons ke klien bahwa penyimpanan berhasil
        req.flash("success", "Berhasil menyimpan data");
        res.redirect("/files/create");
      } // Redirect ke halaman pembuatan file lagi
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

router.get("/download/:id", checkUserStatus, async function (req, res, next) {
  try {
    let uploadedFiles = await Model_Files.getUploadedFilesCount(
      req.session.userId
    );
    let user = await Model_Users.getId(req.session.userId);
    if (user[0].jumlah_download < 3) {
      req.flash(
        "error",
        "Anda harus mengunggah minimal 3 file sebelum dapat mengunduh."
      );

      return res.redirect("/files");
    }

    console.log(
      "User ID: ${req.session.userId} is downloading file ID: ${req.params.id}"
    );

    let fileData = await Model_Files.downloadFile(req.params.id);
    if (!fileData) {
      throw new Error("Data file tidak ditemukan.");
    }

    console.log("Data file ditemukan: ${fileData.filename}");

    // Periksa apakah pengguna sudah pernah mengunduh file ini sebelumnya
    let existingDownload = await Model_Record.getDownloadByUserAndFile(
      req.session.userId,
      req.params.id
    );

    if (!existingDownload) {
      // Jika belum pernah, buat catatan unduhan baru
      let now = new Date();
      let recordData = {
        id_user: req.session.userId,
        id_file: req.params.id,
        tanggal: now.getDate(),
        bulan: now.getMonth() + 1, // Bulan dimulai dari 0
        tahun: now.getFullYear(),
      };
      await Model_Record.store(recordData);
      await Model_Users.Update(req.session.userId, { jumlah_download: 0 });
    } else {
      // Jika sudah pernah, tingkatkan total unduhan pada catatan unduhan yang sudah ada
      await Model_Record.incrementTotalDownload(existingDownload.id);
      await Model_Users.Update(req.session.userId, { jumlah_download: 0 });
    }

    // Increment total_download in the file table
    await Model_Files.incrementTotalDownload(req.params.id);
    await Model_Users.Update(req.session.userId, { jumlah_download: 0 });

    res.setHeader(
      "Content-disposition",
      "attachment; filename=" + fileData.filename
    );
    res.setHeader("Content-type", "application/pdf");
    res.end(fileData.data);
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal mengunduh file: ${error.message}");
    res.redirect("/files");
  }
});

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
