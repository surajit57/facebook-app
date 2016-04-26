var express = require('express');
var router = express.Router();
var multer = require('multer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var upload = multer({dest: './uploads'});
var User = require('../models/user');
var config = require('../config/config');
var FacebookStrategy = require('passport-facebook').Strategy;

var userController = require('../controller/user_controller');
/* GET users listing. */

router.get('/register', function(req, res, next) {
  res.render('register' , {title:'Register'});
});

router.post('/register', upload.single('profileimage'), userController.register)

router.get('/login', function(req, res, next) {
  res.render('login', {title:'Login'});
});

router.post('/login',
  passport.authenticate('local', {failureRedirect: '/users/login' , failureFlash:'invalid username or password'}),
  function(req, res) {
  	req.flash('success' , 'you are now logged in');

    res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
	User.getUserByUsername(username , function(err,user){
		if(err) throw err;
		if(!user){
			return done(null, false, {'message':'Unknown user'});
		}

		User.comparedPassword(password , user.password, function(err,isMatch){
			if(err) return done(err);
			if(isMatch){
				 return done(null,user)
			}else{
				return done(null, false, {'message':'Invalid password'});
			}
		})
	})
}));

passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret:config.facebook_api_secret ,
    callbackURL: config.callback_url
  },
  function(accessToken, refreshToken, profile, done) {
  	console.log(profile , "-----------------");
    process.nextTick(function () {
      //Check whether the User exists or not using profile.id
      //Further DB code.
      return done(null, profile);
    });
  }
));

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { 
       successRedirect : '/', 
       failureRedirect: '/user/login' 
  }),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout' , userController.logout)
module.exports = router;
