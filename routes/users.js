var express = require("express");
const Model_Users = require("../model/Model_Users");
const Model_Kategori = require("../model/Model_Kategori");
const Model_Record = require("../model/Model_Record");
var router = express.Router();

/* GET users listing. */
router.get("/", async function (req, res, next) {
  let popularFiles = await Model_Record.getPopularFiles();
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
        let record = await Model_Record.getAll();

        // Log semua data record di console
        res.render("users/index", {
          title: "Users Home",
          nama: Data[0].nama,
          role: Data[0].role,
          email: Data[0].email,
          kategori: kategori,
          totalDownloads: record,
          popularFiles: popularFiles,
        });
      }
      //akhir kondisi
    } else {
      res.status(401).json({ error: "user tidak ada" });
    }
  } catch (error) {
    console.log(req.session.userId);
    let Data = await Model_Users.getId(req.session.userId);
    console.log(Data);
    res.status(501).json("Butuh akses login");
  }
});

module.exports = router;
