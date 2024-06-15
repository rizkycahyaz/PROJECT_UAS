const express = require("express");
const router = express.Router();
const Model_admin = require("../model/Model_admin");
const Model_Users = require("../model/Model_Users");

router.get("/", async (req, res, next) => {
  try {
    const users = await Model_admin.getUsersWithLevelTwo();
    res.render("admin/index", { users: users }); // Menggunakan res.render untuk merender tampilan index
  } catch (error) {
    next(error);
  }
});

//Route untuk mengubah status pengguna menjadi 'banned'
router.post("/ban-user", async (req, res, next) => {
  const { id } = req.body;

  try {
    const result = await Model_Users.updateUserStatusToBanned(id);
    res.status(200).json({ message: "User banned successfully" });
  } catch (error) {
    console.error("Failed to ban user:", error);
    res.status(500).json({ message: "Failed to ban user" });
  }
});

// Route untuk menangani penjadwalan kembali ke status 'aktif'
router.post("/schedule-active-user", async (req, res, next) => {
  const { id } = req.body;

  try {
    setTimeout(async () => {
      await Model_Users.updateUserStatusToActive(id);
      console.log("User with id ${id} has been scheduled to be activated.");
    }, 30000); // 30 detik

    res
      .status(200)
      .json({ message: "User scheduled to be activated in 30 seconds" });
  } catch (error) {
    console.error("Failed to schedule user activation:", error);
    res.status(500).json({ message: "Failed to schedule user activation" });
  }
});

router.post("/update-user-status", async (req, res, next) => {
  const { id, status } = req.body;

  try {
    const result = await Model_Users.updateUserStatus(id, status);
    res.status(200).json({ message: "User status updated successfully" });
  } catch (error) {
    console.error("Failed to update user status:", error);
    res.status(500).json({ message: "Failed to update user status" });
  }
});

module.exports = router;
