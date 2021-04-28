
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
  it('Get Product Info', async function() {
    await request(app)
      .get('/product/allinfo/606b1bbc275f386260dc79c3')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
       expect(res.body.productName).to.equal("Original Mona Lisa") 
       
      });
    }
  );

  it('filters products category', async function() {
    await request(app)
      .get('/product/filter?categories=Canvas')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        for(var i = 0; i< res.body.length; i++)
        {expect(res.body[i].productCategory).to.equal("Canvas")}
      });
    }
  );

  it('filters products brand', async function() {
    await request(app)
      .get('/product/filter?brands=Zen')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        for(var i = 0; i< res.body.length; i++)
        {expect(res.body[i].productDistributor).to.equal("Zen")}
      });
    }
  );

  it('filters products brand & Category', async function() {
    await request(app)
      .get('/product/filter?categories=Brush&brands=Zen')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        for(var i = 0; i< res.body.length; i++)
        {expect(res.body[i].productDistributor).to.equal("Zen")
        expect(res.body[i].productCategory).to.equal("Brush")
        }
      });
    }
  );
  
  it('bestseller products', async function() {
    await request(app)
      .get('/product/bestsellers')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        for(var i = 0; i< res.body.length; i++)
        expect(res.body[i].productBestseller).to.equal(true)
      });
    }
  );

  it('filters products ascending', async function() {
    await request(app)
      .get('/product/filter?categories=Paint&order=ascending')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        var temp = res.body[0].productPrice
        for(var i = 0; i< res.body.length; i++)
        {expect(res.body[i].productPrice).greaterThanOrEqual(temp)
          temp = res.body[i].productPrice
        expect(res.body[i].productCategory).to.equal("Paint")
        }
      });
    }
  );

  it('filters products descending', async function() {
    await request(app)
      .get('/product/filter?categories=Canvas&order=descending')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        var temp = res.body[0].productPrice
        for(var i = 0; i< res.body.length; i++)
        {expect(res.body[i].productPrice).lessThanOrEqual(temp)
          temp = res.body[i].productPrice
        expect(res.body[i].productCategory).to.equal("Canvas")
        }
      });
    }
  );
  })
  





describe('Logged out Cart Tests: ', async function() {
  it('add first item to cart', async function() {
    await request(app)
      .post('/cart/add/606b0c26e8e7d76230b427c7/2')
      .expect(200)
      .then((res) => {
        Cookies = res.headers['set-cookie'].pop().split(';')[0];
        expect(res.text).to.equal("Logged Out : First Element added") 
      });
    }
  );

  it('add unique item to cart', async function() {
    await request(app)
      .post('/cart/add/606b1130275f386260dc79b4/1')
      .set('Cookie', Cookies)
      .expect(200)
      .then((res) => {
        Cookies = res.headers['set-cookie'].pop().split(';')[0];
        expect(res.text).to.equal("Logged Out : Unique Element added") 
      });
    }
  );
  it('add same item to cart', async function() {
    await request(app)
      .post('/cart/add/606b0c26e8e7d76230b427c7/2')
      .expect(200)
      .set('Cookie', Cookies)
      .then((res) => {
        Cookies = res.headers['set-cookie'].pop().split(';')[0];
        expect(res.text).to.equal("Logged Out : Same Element added") 
      });
    }
  );

  it('get cart', async function() {
    await request(app)
      .get('/cart')
      .expect('Content-Type', /json/)
      .set('Cookie', Cookies)
      .expect(200)
      .then((res) => {
        expect(res.body[0].quantity).to.equal(4)
        expect(res.body[0]._id).to.equal("606b0c26e8e7d76230b427c7")
        expect(res.body[1].quantity).to.equal(1)
        expect(res.body[1]._id).to.equal("606b1130275f386260dc79b4")
      });
    }
  );

  it('delete item not in cart', async function() {
    await request(app)
      .delete('/cart/remove/606b1a80275f386260dc79c1/1')
      .expect(400)
      .set('Cookie', Cookies)
      .then((res) => {
        expect(res.text).to.equal("Logged out:Item is not in the cart") 
      });
    }
  );

  it('delete some item in cart', async function() {
    await request(app)
      .delete('/cart/remove/606b0c26e8e7d76230b427c7/2')
      .expect(200)
      .set('Cookie', Cookies)
      .then((res) => {
        Cookies = res.headers['set-cookie'].pop().split(';')[0];
        expect(res.text).to.equal("2 of the item have been removed from the cart(item is still in cart)") 
      });
    }
  );

  it('delete all of one item in cart', async function() {
    await request(app)
      .delete('/cart/remove/606b1130275f386260dc79b4/1')
      .expect(200)
      .set('Cookie', Cookies)
      .then((res) => {
        Cookies = res.headers['set-cookie'].pop().split(';')[0];
        expect(res.text).to.equal("Item has been removed from the cart") 
      });
    }
  );
  
  it('get cart after deletions', async function() {
    await request(app)
      .get('/cart')
      .expect(200)
      .set('Cookie', Cookies)
      .then((res) => {
        Cookies = res.headers['set-cookie'].pop().split(';')[0];
        expect(res.body[0].quantity).to.equal(2)
        expect(res.body[0]._id).to.equal("606b0c26e8e7d76230b427c7")
      });
    }
  );
})