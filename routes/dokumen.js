const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Model_Dokumen = require("../model/Model_Dokumen");
const Model_Users = require("../model/Model_Users");
const Model_Kategori = require("../model/Model_Kategori");

router.get("/", async function (req, res, next) {
  let id = req.session.userId;
  let Data = await Model_Users.getId(id);

  try {
    if (Data.length > 0) {
      let rows = await Model_Dokumen.getAll();
      let kategori = await Model_Kategori.getAll();
      console.log(id);
      res.render("dokumen/index", {
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

// Route to read a document
router.get("/read/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const file = await Model_Dokumen.getBydokumen(id);
    if (file && file[0] && file[0].file_pdf) {
      const filePath = path.join(
        __dirname,
        "../public/images/upload",
        file[0].file_pdf
      );
      res.sendFile(filePath);
    } else {
      res.status(404).send("Document not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/delete/:id", async function (req, res, next) {
  let id = req.params.id;
  try {
    let rows = await Model_Dokumen.getById(id);
    if (rows.length > 0 && rows[0].file_pdf) {
      const namaFileLama = rows[0].file_pdf;
      const pathFileLama = path.join(
        __dirname,
        "../public/images/upload",
        namaFileLama
      );
      fs.unlinkSync(pathFileLama);
    }
    await Model_Dokumen.Delete(id);
    req.flash("success", "Berhasil menghapus data");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal menghapus data");
  } finally {
    res.redirect("/dokumen");
  }
});

// Route to approve a document
router.get("/approve/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const file = await Model_Dokumen.getById(id);
    let userData = await Model_Users.getId(file.id_user);
    if (file.pengajuan === "pending") {
      let sum = userData[0].jumlah_download + 1;
      await Model_Dokumen.approve(id);
      if (userData[0].jumlah_download < 2) {
        await Model_Users.Update(userData[0].id_user, {
          jumlah_download: sum,
        });
        res.redirect("/dokumen"); // Redirect back to the documents page after approval
      } else {
        await Model_Users.Update(userData[0].id_user, {
          jumlah_download: sum,
          jumlah_upload: 0,
        });
        res.redirect("/dokumen");
      }
    } else {
      res.status(400).send("Document approval status is not pending");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Route to disapprove a document
router.get("/disapprove/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const file = await Model_Dokumen.getById(id);
    if (file.pengajuan === "pending") {
      await Model_Dokumen.disapprove(id);
      res.redirect("/dokumen"); // Redirect back to the documents page after disapproval
    } else {
      res.status(400).send("Document approval status is not pending");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
