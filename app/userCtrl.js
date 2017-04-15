var db = require('../db/db');
var crypto = require("crypto");
var cookieParser = require('cookie-parser');

var UserController = function(app){

	function encrypt(text){
	  var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
	  var crypted = cipher.update(text,'utf8','hex')
	  crypted += cipher.final('hex');
	  return crypted;
	}

	function decrypt(text){
	  var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
	  var dec = decipher.update(text,'hex','utf8')
	  dec += decipher.final('utf8');
	  return dec;
	}

	function auth_token(data){
		var token = data.name+";"+data.email;
		return encrypt(token);
	}

	function generateJson(data){
		return {
			name: data.name,
			email: data.email,
			password: data.password,
			token: auth_token(data)
		}
	}

	function getCookie(cookie, name) {
	  var value = "; " + cookie;
	  var parts = value.split("; " + name + "=");
	  if (parts.length == 2) return parts.pop().split(";").shift();
	}
	
 	app.get('/users', function(req, res) {
 		var collection = db.get().collection('userslist')	
	  collection.find().toArray(function(err, docs) {
	  	console.log(err,docs)
	    res.send(docs)
	  });
  });

  app.post('/users', function(req, res) {
 		req.body.password = encrypt(req.body.password);
 		var collection = db.get().collection("userslist");
 		var test = collection.find({"email": req.body.email}).toArray(function(err, docs) {
			if(docs.length){
 				res.status(422).json({"error":"true","data": "Already exit"})
			}else{
				var json = generateJson(req.body);
 				collection.insert(json, function(err, result){
 					if(err){
 						res.status(422).json({"error":"true","data": "Error while insert user"})
 					}else{
 						res.status(200).json({"success":"true","data": result})
 					}
 				})
			}
		});
  });

  app.get("/current_user", function(req, res){
  	var collection = db.get().collection('userslist')	
	  collection.find({"token": getCookie(req.headers.cookie, 'a_run_trackr')}).toArray(function(err, docs) {
	  	console.log(err,docs)
	  	if(docs.length){
		    res.status(200).json({"success":"true","data": docs[0]});
		}else{
			res.status(401).json({"error":"true","data": "Unauthourized"});
		}
	  });
  });

   app.post('/sign_in', function(req, res) {
 		var password = encrypt(req.body.password);
 		var collection = db.get().collection("userslist");
 		var test = collection.find({"email": req.body.email}).toArray(function(err, docs) {
			if(docs.length){
				if(docs[0].password === password){
 					res.cookie('a_run_trackr', docs[0].token);
 					res.status(200).json({"success":"true","data": docs[0]})
				}else{
 					res.status(422).json({"error":"true","data": "Invalid password"})
				}
			}else{
 				res.status(422).json({"error":"true","data": "Email Not found"})
			}
		});
  });
   

   app.post('/sign_out', function(req, res) {
   		console.log("ssuccesss")
 		res.cookie('a_run_trackr=;expires=Thu, 01 Jan 1970 00:00:01 GMT;');
 		res.status(200).json({"success":"true"});
   });

}
module.exports = UserController;