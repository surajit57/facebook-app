var User = require('../models/user');
var user = {};

user.register = function(req,res,next){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var profileImage = req.file? req.file.filename:'noimage.jpg';
	
	//form validation
	req.checkBody('name' , 'Name field is required').notEmpty();
	req.checkBody('email' , 'Email field is required').notEmpty();
	req.checkBody('email' , 'email field is required').isEmail();
	req.checkBody('username' , 'username field is required').notEmpty();
	req.checkBody('password' , 'password field is required').notEmpty();
	req.checkBody('password2' , 'password do not match').equals(req.body.password);



	//check error
	var errors = req.validationErrors();

	if(errors){
		res.render('register' , {errors:errors})
	}else{
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password:password,
			profileimage: profileImage
		});
		User.createUser(newUser , function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success', 'you are now registered and can log in')
		res.location('/');
		res.redirect('/')
	}
}

user.logout = function(req, res){
	req.logout();
	req.flash('success' , 'you are now logged out');
	res.redirect('/users/login');
}
module.exports = user;