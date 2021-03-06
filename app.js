var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('./app_api/models/db');
var uglifyJs = require("uglify-js");
var fs = require('fs');

var routes = require('./app_server/routes/index');
var routesApi = require('./app_api/routes/index');
//var users = require('./app_server/routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'jade');

var appClientFiles = [
'transpiled/app.js',
'transpiled/home/home.controller.js',
'transpiled/about/about.controller.js',
'transpiled/locationDetail/locationDetail.controller.js',
'transpiled/reviewModal/reviewModal.controller.js',
'transpiled/common/services/geolocation.service.js',
'transpiled/common/services/loc8rData.service.js',
'transpiled/common/filters/formatDistance.filter.js',
'transpiled/common/filters/addHtmlLineBreaks.filter.js',
'transpiled/common/directives/ratingStars/ratingStars.directive.js',
'transpiled/common/directives/footerGeneric/footerGeneric.directive.js',
'transpiled/common/directives/navigation/navigation.directive.js',
'transpiled/common/directives/pageHeader/pageHeader.directive.js'
];

var uglified = uglifyJs.minify(appClientFiles, { compress : false });

fs.writeFile('public/angular/loc8r.min.js', uglified.code, function (err){
  if(err) {
    console.log(err);
  } else {
    console.log('Script generated and saved: loc8r.min.js');
  }
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_client')));

//app.use('/', routes);
app.use('/api', routesApi);
//app.use('/users', users);

app.use(function(req, res) {
  res.sendFile(path.join(__dirname, 'app_client', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
