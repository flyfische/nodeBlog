// server.js
// load the things we need
var express = require('express');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('test.db');
var tools = require('./blogTools.js')();
var bodyParser = require('body-parser');
var session = require('express-session');
var moment = require('moment');
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views/static'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session({
 secret: '5qgZg/285)e^I8Ga591/P`53]0}b', 
 cookie: { maxAge: 60 * 1000 * 10 },
 resave: true,
 saveUninitialized: true
}))


// index page 
app.get('/', function(req, res) {
	getNewPosts(function(posts) {
		res.render('pages/index', {
    		posts: posts,
    		id: req.session.user_id, 
    		req: req
    	});
	}); 
});
// view specific post
app.get ('/post/:id', function(req,res) {
	getPostByID(req.params.id, function(post) {
		res.render('pages/post', {
			post: post,
    		id: req.session.user_id
		});
	});
});
// login page
app.get ('/login', function (req,res) {
	if(req.session.user_id) {
		res.render('pages/new');
	}
	else {
		res.render('pages/login', {
			id: req.session.user_id
		});
	}
});
// login logic
app.post('/login', login);
// new post form
app.get('/new', authenticate, function(req,res) {
	res.render('pages/new');
});
// new post logic
app.post('/new',newPost);
app.listen(8080);
console.log('8080 is the magic port');