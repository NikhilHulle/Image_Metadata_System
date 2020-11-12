const express = require('express');
const mongoose = require('mongoose');

const app = express();

var fs = require('fs');
var path = require('path'); 
//require('dotenv/config');
const multer = require('multer'); 

 
var storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, 'uploads') 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()) 
    } 
}); 
  
var upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose
  .connect(
    'mongodb://mongo:27017/trialdatabase',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const Credentials = require('./models/credentials');
const Imagedb = require('./models/image');

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/register', (req, res) => {
	res.render('register');
});

app.get('/menu', (req, res) => {
	res.render('menu');
});

app.get('/add', (req,res)=> {
	console.log(req.body);
	res.render('add');
});

app.get('/search', (req,res)=> {
  var show=0;
  Imagedb.find({},{img:1})
    .then(docs => res.render('search', { docs,show }))
    .catch(err => res.status(404).json({ msg: 'No items found' }));
	//res.render('search',{""});
});


app.post('/login/check', (req, res) => {
  console.log(req.body);
  if(req.body.username=="guest" && req.body.password=="guest")	{
	console.log('Login successful');
	res.redirect('/menu');
  }
  else	{
    Credentials.find({username:req.body.username,password:req.body.password},  function (err, docs) { 
    	if (err){ 
        	console.log(err); 
        
    	} 
    	else{ 
    		if(Object.keys(docs).length>=1)	{
        			console.log('Login successful');
					res.redirect('/menu');
        	}
        	else	{
        		console.log('Login not successful');
				res.redirect('/');
        	}
    	}
	});
  }
});



app.post('/login/register', (req, res) => {
  console.log(req.body);
  res.redirect('/register');
});


app.post("/register", (req,res) => {
	console.log(req.body);
	var obj = { 
       username: req.body.username,
       password: req.body.password 
    } 
	const add_creds=new Credentials(obj);
	add_creds.save();
	res.redirect('/');

});



app.post("/add", upload.single('image'), (req,res,next) => {
	console.log(req.body);
	console.log(req.body.tag[1]);
	console.log(req.body.value[1]);
	var obj = { 
       img: { 
          data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
          contentType: 'image/png'
       }
       //[req.body.tag1]:req.body.value1 
    } 
    var i;
	for (i = 0; i < 5; i++) {
  		if(req.body.tag[i]!="")	{
  			obj[req.body.tag[i]]=req.body.value[i];
  		}
	}
	const add_data=new Imagedb(obj);
	add_data.save();
	res.redirect('/menu');

});

app.post("/search", (req,res) => {
	console.log(req.body);
	var show=1;
	var obj = { 
       [req.body.tag[0]]:req.body.value[0]
    }
    var i;
	for (i = 1; i < 5; i++) {
  		if(req.body.tag[i]!="")	{
  			obj[req.body.tag[i]]=req.body.value[i];
  		}
	}
	Imagedb.find(obj, {img:1},  function (err, docs) { 
    if (err){ 
        console.log(err); 
        
    } 
    else{ 
        console.log("First function call : ", docs); 
        res.render('search', { docs,show });
    } 
});
	//res.redirect('/menu');

});

const port = 3000;

app.listen(port, () => console.log('Server running...'));
