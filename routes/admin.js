const express = require("express");
const router = express.Router();
const Model_admin = require("../model/Model_admin");

router.get('/', async (req, res, next) => {
  try {
    const users = await Model_admin.getUsersWithLevelTwo();
    res.render('admin/index', { users: users }); // Menggunakan res.render untuk merender tampilan index
  } catch (error) {
    next(error);
  }
});

module.exports = router;
