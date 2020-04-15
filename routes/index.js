const express = require('express');
const router  = express.Router();
const Car = require('../models/Car');
const ensureLogin = require('connect-ensure-login');

//FILE UPLOAD
const multer = require('multer');
const uploadCloud = require('../config/cloudinary');

//INDEX
router.get('/', (req, res, next) => {
  res.render('index');
});

//DASHBOARD
router.get('/dashboard', ensureLogin.ensureLoggedIn(), (req, res, next) => {

  Car
  .find({owner: req.user._id})
  .populate('owner')
  .then(cars => {
    const manageCars = cars.map(car => {
      if (car.owner && car.owner.toString() === req.user._id.toString()) {
        car.isOwner = true;
      }
      console.log(car)
      return car;
    });
    res.render('dashboard', {user: req.user, cars: manageCars});
  })
  .catch(error => console.log(error));
});

//SAVE CAR -----------------------------------
router.get('/savecar', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render('savecar');
});

router.post('/save', uploadCloud.single('photo'), ensureLogin.ensureLoggedIn(), (req, res, next) => {

  const {
    brand,
    model, 
    color,
    plate,
    city,
    state,
    year,
    details,
    status
  } = req.body;

  // const location = {
  //   type: 'Point',
  //   coordinates: [longitude, latitude]
  // }

  Car.create({
    brand,
    model, 
    color,
    plate,
    city,
    state,
    year,
    details,
    status,
    path: req.file.url,
    originalName: req.file.originalname,
    owner: req.user._id
  })
  .then(response => {
    console.log(response);
    res.redirect('/dashboard');
  })
  .catch(error => console.log(error));
});

//SHOW CAR DETAILS --------------------------
router.get('/cars/:carId', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const {
    carId
  } = req.params;

  Car
  .findById(carId)
  .then(car => {
    console.log(car);
    res.render('detailscar', {
      car
    });
  })
  .catch(error => console.log(error));
}) 

//EDIT CAR -----------------------------------
router.get('/cars-edit/:carId', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const {
    carId
  } = req.params;

  Car
  .findById(carId)
  .then(car => {
    res.render('editcar', {
      car
    });
  })
  .catch(error => console.log(error));
});


router.post('/cars-edit', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const {
    details,
    status,
    carId
  } = req.body;

  // console.log('kkkkkk', req.body)
  Car
  .findOneAndUpdate({_id: carId}, {
    $set:{
      details: details,
      status: status
    }
  }, {
    new:true
  })
  .then(response => {
    console.log(response)
    res.redirect(`/cars/${response._id}`);
  })
  .catch(error => console.log(error));
})

//DELETAR CAR ------------------------------------
router.get('/cars-delete/:carId', (req, res, next) => {
  const {
    carId
  } = req.params;

  Car
  .findByIdAndDelete(carId)
  .then(response => {
    res.redirect('/dashboard');
  })
  .catch(error => console.log(error));
})

//SEARCH -----------------------------------------
router.get('/search', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  Car
  .findOne({plate: req.query.search})
  .then(response => {
    res.render('dashboard', {response})
  })
  .catch(error => console.log(error));
})



module.exports = router;