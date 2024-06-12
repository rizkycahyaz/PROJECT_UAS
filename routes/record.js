const express = require("express");
const router = express.Router();
const Model_Record = require("../model/Model_Record");
const Model_Users = require("../model/Model_Users");
const Model_Kategori = require("../model/Model_Kategori");

router.get("/", async function (req, res, next) {
  try {
    let id = req.session.userId;
    let Data = await Model_Users.getId(id);
    if (Data.length > 0) {
      if (Data[0].role != 1) {
        res.redirect("/logout");
      } else {
        let kategori = await Model_Kategori.getAll();
        let totalDownloads = await Model_Record.getAll();
        let popularFiles = await Model_Record.getAll();
        console.log("Popular Files di Server:", popularFiles); // Log data di server
        res.render("users/index", {
          title: "Users Home",
          nama: Data[0].nama,
          role: Data[0].role,
          email: Data[0].email,
          kategori: kategori,
          totalDownloads: totalDownloads,
          popularFiles: popularFiles,
        });
      }
    } else {
      res.status(401).json({ error: "user tidak ada" });
    }
  } catch (error) {
    res.status(501).json("Butuh akses login");
  }
});

router.get("/delete/:id", async function (req, res, next) {
  let id = req.params.id;
  try {
    await Model_Record.Delete(id);
    req.flash("success", "Berhasil menghapus catatan unduhan");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal menghapus catatan unduhan");
  } finally {
    res.redirect("/record");
  }
});

module.exports = router;
