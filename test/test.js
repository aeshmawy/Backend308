
var expect = require('chai').expect;
var request = require('supertest');
var assert = require('assert');
var app = require('../app');
var server = require('../bin/www')

async () =>
{
  await new Promise(r => setTimeout(r, 5000));
}


var Cookies;

describe('Log In Tests: ', async function() {

it('should send back a JSON object with Logged in set to true', async function() {
  await request(app)
    .post('/login')
    .set('Content-Type', 'application/json')
    .send({ email: 'qwe@gmail.com', password: '123' } )
    .expect('Content-Type', /json/)
    .expect(200)
    .then((res) => {
     expect(res.body.loggedIn).to.equal(true) 
     Cookies = res.headers['set-cookie'].pop().split(';')[0];
    });
  }
);

it('Wrong email: will send a 400 status code', async function() {
  await request(app)
    .post('/login')
    .set('Content-Type', 'application/json')
    .send({ email: 'somerandomemail@gmail.com', password: '123' } )
    .expect(400).then(
      (res) => {}
    )
    
});

it('Wrong Password: will send a 400 status code', async function() {
  await request(app)
    .post('/login')
    .set('Content-Type', 'application/json')
    .send({ email: 'qwe@gmail.com', password: 'string' } )
    .expect(400).then(
      (res) => {}
    )
    
});

it('Should successfully log out', async function() {
    await request(app)
    .post('/logout')
    .set('Accept','application/json')
    .set('Cookie', Cookies)
    .expect(200).then(
      (res) => {}
    )
    
});

it('log out when User is not logged in', async function() {
  await 
     request(app)
    .post('/logout')
    .expect(400).then(
      (res) => {}
    )
    
});
})

describe('Product Tests: ', async function() {

  it('Add a product to the db', async function() {
    await request(app)
      .post('/product/add')
      .set('Content-Type', 'application/json')
      .send(
        {
        "productSize": "string",
        "productName": "string",
        "productDistributor": "Some Art Company",
        "productDescription": "This is a product!",
        "productCategory": "Brush",
        "productBGcolor": "Peach",
        "productPrice": 0,
        "productDiscount": 0,
        "productStock": 0,
        "productBestseller": false,
        "productRating": 0,
        "productNumofRatings": 0
      } )
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
       expect(res.body.msg).to.equal("Product has been added to the database.") 
       
      });
    }
  );
  
 
  })
  