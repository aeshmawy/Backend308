var mongoose = require("mongoose");

mongoose.connect('mongodb+srv://aeshmawy:normalpass123@cs308db.kxh8v.mongodb.net/Cs308data', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to data base successfully')
});


