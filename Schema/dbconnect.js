var mongoose = require("mongoose");

//mongoose.connect('mongodb://localhost:27017/Simple', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect('mongodb+srv://aeshmawy:normalpass123@cs308db.kxh8v.mongodb.net/CS308', {useNewUrlParser: true, useUnifiedTopology: true});
//^^first line is to connect locally. second line is to connect to the online database. (im not sure if you need mongodb for it to run

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to data base successfully')
});


