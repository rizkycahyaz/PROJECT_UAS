const express = require("express");
const router = express.Router();
const Model_Record = require("../model/Model_Record");
const Model_Users = require("../model/Model_Users");

router.get("/", async function (req, res, next) {
  try {
    let id = req.session.userId;
    let userData = await Model_Users.getId(id);
    if (userData.length > 0) {
      let records = await Model_Record.getAll();
      res.render("record/index", { records: records, email: userData[0].email });
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
