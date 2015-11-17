var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('blog.db');
var userdb = new sqlite3.Database('users.db');
var bcrypt = require("bcrypt-nodejs");
var moment = require('moment');

module.exports = function() {
	this.getNewPosts = function(callback) {
		db.parallelize(function () {
			db.all("select rowid,* from posts order by rowid desc",function (err,rows) {
				if(err) {
					console.log(err);
				}
				else {
					return callback(rows);
				}
			});
		});
	}
	this.getPostByID = function(id,callback) {
		db.parallelize(function () {
			db.get("select rowid,* from posts where rowid=  ?",[ id ],function (err,row) {
				if(err) {
					console.log(err);
				}
				else {
					row.timestamp = moment(row.timestamp).fromNow();
					return callback(row);
				}
			});
		});
	}
	this.authenticate = function(req,res,next) {
		if(!req.session.user_id) {
			res.send('Unauthorized.');
		}
		else {
			res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
			next();
		}
	}
	this.login = function(req,res) {
		var username = req.body.username;
		var password = req.body.password;
		userdb.parallelize(function() {
			userdb.get("select rowid,* from users where username = ?", [username], function(err,row) {
				if(bcrypt.compareSync(password,row.password)) {
					console.log("login success");
					req.session.user_id = row.username;
					res.redirect('new');
				}
				else {
					console.log("login failure");
					res.redirect('login');
				}
			});
		});
	}
	this.newPost = function(req,res) {
		var title = req.body.title;
		var author = req.body.author;
		var image = req.body.image;
		var description = req.body.description;
		var post = req.body.post;
		db.serialize(function() {
			db.run("insert into posts (author,title,post,description,image) values(?,?,?,?,?)", [author,title,post,description,image], function () {
				res.redirect('/');
			});
		});
		
	}

}