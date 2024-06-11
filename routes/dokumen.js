const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Model_Dokumen  = require("../model/Model_Dokumen");
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
      res.redirect("/dokumen");
    } catch (error) {
      console.error("Error:", error);
      req.flash("error", "Gagal menghapus data");
    } finally {
      res.redirect("/dokumen");
    }
  });

module.exports = router;