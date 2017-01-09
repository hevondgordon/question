var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;

var updateDocument = function(db,query,res,callback) {
  // Get the documents collection
  var collection = db.collection("Questions");
  // Update document where a is 2, set b equal to 1
  collection.updateOne(query[0]
    , { $set: query[1] }, function(err, result) {

    console.log("Updated the document with the field a equal to 2");
    callback(result);
  });
}
// Connection URL
var url = 'mongodb://localhost:27017/stackovrflw';
var removeDocument = function(db,query,res,callback) {
  // Get the documents collection
  var collection = db.collection("Questions");
  // Insert some documents
  collection.deleteOne(query, function(err, result) {

    console.log("Removed the document with the field a equal to 3");
    if(err){
      res.send(err);
    }
    else{
      res.send(result);
    }
    callback(result);
  });
}



var insertDocuments = function(db,data,collection,callback) {
  // Get the documents collection
  var collection = db.collection(collection);
  // Insert some documents
  collection.insert(data, function(err, result) {
    // assert.equal(err, null);
    // assert.equal(3, result.result.n);
    // assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
}

var findDocuments = function(db,query,collection,res,callback) {
  // Get the documents collection
  var collection = db.collection(collection);
  var result;
  // Find some documents
  var docs=collection.find(query).toArray(function(err, docs) {

    console.log("Found the following records");
    console.log(docs);
    callback(docs);
    if(docs.length>0){
      res.send(docs)
    }
    else{
        res.send('not found');
    }
    return docs;
  });
}








// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {

  console.log("Connected successfully to server");

 //  insertDocuments(db, function() {
 //   db.close();
 // });
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.get('/',function(req,res,next){
  res.sendFile(__dirname + '/views/index.html');

});


app.get('/login',function(req,res,next){
  res.sendFile(__dirname + '/views/login.html');

});

app.get('/register',function(req,res,next){
  res.sendFile(__dirname + '/views/register.html');

});


app.post('/registerUsers',function(req,res,next){
  res.send(req.body);
  var data=req.body;

  MongoClient.connect(url, function(err, db) {

    console.log("Connected successfully to server");

   //  insertDocuments(db, function() {
   //   db.close();
   // });
   insertDocuments(db,data,"Users",function(){
        db.close();
      });
  });
});



app.post('/login',function(req,res,next){

  var querydata=req.body;
  var query={$and:[{"username":String(querydata.username)},{"password":String(querydata.password)}]};
  console.log(query);

  MongoClient.connect(url, function(err, db) {

    console.log("Connected successfully to server");

   //  insertDocuments(db, function() {
   //   db.close();
   // });
   findDocuments(db,query,"Users",res,function() {
        db.close();
      });
  });
});


app.post('/savequestion',function(req,res,next){
  res.send(req.body);
  var data=req.body;
  console.log(data);

  MongoClient.connect(url, function(err, db) {

    console.log("Connected successfully to server");

   insertDocuments(db,data,"Questions",function(){
        db.close();
      });
  });
});

app.get('/showall',function(req,res,next){



  MongoClient.connect(url, function(err, db) {

    console.log("Connected successfully to server");

    findDocuments(db,{},"Questions",res,function() {
         db.close();
    });
  });
});

app.post('/remove',function(req,res,next){
  var query=req.body;
  console.log(req.body);



  MongoClient.connect(url, function(err, db) {

    console.log("Connected successfully to server");

    removeDocument(db,query,res,function() {
         db.close();
    });
  });
});

app.post('/search',function(req,res,next){
  var query=req.body.query;
  console.log(query);
  //res.send(query)


  // //
  MongoClient.connect(url, function(err, db) {

    console.log("Connected successfully to server");

    findDocuments(db,{tags:{ $regex: `/${query}/` } },"Questions",res,function() {
         db.close();
    });
  });
});






























// app.use('/', routes);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(4900,function(){
  console.log(`HEY GUYS! U CAN FIND ME ON PORT 4900`);
});


module.exports = app;
