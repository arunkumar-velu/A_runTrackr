var db = require('../db/db')
var UserController = function(app){
	
 	app.get('/users', function(req, res) {
 		var collection = db.get().collection('userslist')	
	  collection.find().toArray(function(err, docs) {
	  	console.log(err,docs)
	    res.send(docs)
	  });
  });

  app.post('/users', function(req, res) {
 		console.log("test",req.headers,req.body);
 		var collection = db.get().collection("userslist");
 		collection.insert(req.body);
 		res.json({"success":"true","data": req.body})
  });

}
module.exports = UserController;