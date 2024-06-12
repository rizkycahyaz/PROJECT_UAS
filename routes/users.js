var express = require("express");
const Model_Users = require("../model/Model_Users");
const Model_Kategori = require("../model/Model_Kategori");
const Model_Record = require("../model/Model_Record");
var router = express.Router();

/* GET users listing. */
router.get("/", async function (req, res, next) {
  try {
    let id = req.session.userId;

    let Data = await Model_Users.getId(id);
    if (Data.length > 0) {
      //tambahkan kondisi pengecekan role
      if (Data[0].role != 1) {
        res.redirect("/logout");
      } else {
        // Ambil data kategori
        let kategori = await Model_Kategori.getAll();
        let totalDownloads = await Model_Record.getAll();
        let popularFiles = await Model_Record.getPopularFiles();
        // Log semua data record di console
        console.log("Total Downloads:", totalDownloads);
        console.log("Popular Files di Server:", popularFiles);
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
      //akhir kondisi
    } else {
      res.status(401).json({ error: "user tidak ada" });
    }
  } catch (error) {
    res.status(501).json("Butuh akses login");
  }
});

module.exports = router;
