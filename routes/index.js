var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');

var Model_Users = require('../model/Model_Users');
const e = require('express');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express',
  });
});
router.get('/register', function (req, res, next) {
  res.render('auth/register');
});
router.get('/login', function (req, res, next) {
  res.render('auth/login');
});

router.post('/saveusers', async (req, res) => {
  let { email, password } = req.body;
  let enkripsi = await bcrypt.hash(password, 10);
  let Data = {
    email,
    password: enkripsi,
  };
  await Model_Users.Store(Data);
  req.flash('success', 'Berhasil Register!');
  res.redirect('/login');
});

router.post('/log', async (req, res) => {
  let { email, password } = req.body;
  try {
    let Data = await Model_Users.Login(email);
    if (Data.length > 0) {
      let enkripsi = Data[0].password;
      let cek = await bcrypt.compare(password, enkripsi);
      if (cek) {
        req.session.userId = Data[0].id_user;
        req.session.role = Data[0].role;
        // Tambahkan kondisi pengecekan role pada user yang login
        if (Data[0].role == 1) {
          req.flash('success', 'Berhasil login');
          return res.redirect('/superusers');
        } else if (Data[0].role == 2) {
          req.flash('success', 'Berhasil login');
          return res.redirect('/users');
        } else {
          return res.redirect('/login');
        }
      } else {
        req.flash('error', 'Email atau password salah');
        return res.redirect('/login');
      }
    } else {
      req.flash('error', 'Akun tidak ditemukan');
      return res.redirect('/login');
    }
  } catch (err) {
    console.error(err);
    req.flash('error', 'Terjadi kesalahan saat mencoba login');
    return res.redirect('/login');
  }
});

router.get('/logout', function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.error(err);
    } else {
      res.redirect('/login');
    }
  });
});

module.exports = router;
