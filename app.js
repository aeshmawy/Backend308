var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var swaggerJsDoc = require('swagger-jsdoc');
var swaggerUi = require('swagger-ui-express');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register');
var productRouter = require('./routes/product');
var commentRouter = require('./routes/comment');
var authRouter = require('./routes/authenticate');
var cartRouter = require('./routes/cart');
var logoutRouter = require('./routes/logout');
var purchaseRouter = require('./routes/purchase');

var app = express();

app.use(session({
  secret: "cool",
  cookie: {maxAge: 3600000},
  saveUninitialized: false,
  
}));

//SWAGGER 
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: "0.1.2",
      title: "CS308 E-commerce website",
      description: "Only has an elementary log in and registration page. (password encryption has been implemented.)",
      contact: {
        name: "Tarik Bulut and Ahmed Eshmawy"
      },
      servers: ["http://localhost:5000"]
    }
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


//^^^^SWAGGER ENDS HERE ^^^^^^^^^^


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/users', usersRouter);
app.use('/product', productRouter);
app.use('/comment', commentRouter);
app.use('/authenticate', authRouter);
app.use('/cart', cartRouter);
app.use('/logout', logoutRouter);
app.use('/purchase', purchaseRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
