var nodemailer = require("nodemailer");
var { google } = require("googleapis");
var Invoice = require('./Schema/Invoice');
var Product = require('./Schema/Products');
const fs = require("fs");
const PDFDocument = require("pdfkit");
const OAuth2 = google.auth.OAuth2;


const oauth2Client = new OAuth2(
    "293929424947-o6b6m9pt6go7sst01b6gc5pl6o28bglr.apps.googleusercontent.com", // ClientID
    "jXSYqCjbxG87cML8KYGPqe2i", // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
  );
  oauth2Client.setCredentials({
    refresh_token: "1//04xcIBmuenaVnCgYIARAAGAQSNwF-L9IrSHb0U4vo8hqpAPeHy-VXcnIis9NmGYz-Jw6yOPzmwWdM8eWvQdkvekO_VeSgvFxDsH4"
  });
  const accessToken = oauth2Client.getAccessToken();
  
async function autoEmail(email , passcode) {
    //Email we are sending from. Do not change transporter values.
    
    let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
    type: "OAuth2",
    user: "feelsbadneed@gmail.com", 
    clientId: "293929424947-o6b6m9pt6go7sst01b6gc5pl6o28bglr.apps.googleusercontent.com",
    clientSecret: "jXSYqCjbxG87cML8KYGPqe2i",
    refreshToken: "1//04xcIBmuenaVnCgYIARAAGAQSNwF-L9IrSHb0U4vo8hqpAPeHy-VXcnIis9NmGYz-Jw6yOPzmwWdM8eWvQdkvekO_VeSgvFxDsH4",
    accessToken: accessToken
    },
    tls: {
    rejectUnauthorized: false
    }
    });
    
    let info = await transporter.sendMail({
    from: 'CS308 Team 17 <noreply@cs308.com>', // sender address
    to: email, // list of receivers
    subject: "Please Authenticate your email", // Subject line
    
    html: `<b>${passcode}</b>`, // html body
    });
    //console.log("Message sent: %s", info.messageId);
}

async function autoInvoice(details, userCart, email) {
    //Email we are sending from. Do not change transporter values.
    var invoice = new Invoice();
   
    invoice.name = details.fullName,
    invoice.address = details.SaddressStreet,
    invoice.city = details.SaddressCity,
    invoice.country = details.SaddressCountry,
    invoice.postal_code =  details.zipCode,
    invoice.items = userCart ,
    invoice.total = details.totalprice,
    invoice.date = new Date()
     
    invoice.save();
    await createInvoice(invoice);
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
        type: "OAuth2",
        user: "feelsbadneed@gmail.com", 
        clientId: "293929424947-o6b6m9pt6go7sst01b6gc5pl6o28bglr.apps.googleusercontent.com",
        clientSecret: "jXSYqCjbxG87cML8KYGPqe2i",
        refreshToken: "1//04xcIBmuenaVnCgYIARAAGAQSNwF-L9IrSHb0U4vo8hqpAPeHy-VXcnIis9NmGYz-Jw6yOPzmwWdM8eWvQdkvekO_VeSgvFxDsH4",
        accessToken: accessToken
        },
        tls: {
        rejectUnauthorized: false
        }
        });
        
        let info = await transporter.sendMail({
        from: 'CS308 Team 17 <noreply@cs308.com>', // sender address
        to: email, // list of receivers
        subject: "Invoice of your recent purchase", // Subject line
        attachments: [
            {
                filename: `invoice${invoice._id}.pdf`,                                         
                contentType: 'application/pdf',
                path: `invoices/invoice${invoice._id}.pdf`
            }]
        });
}

async function createInvoice(invoice) {
    let doc = new PDFDocument({ margin: 50 , size : "A4"});
  
    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    await generateInvoiceTable(doc, invoice);
    generateFooter(doc);
  
    doc.end();
    doc.pipe(fs.createWriteStream(`invoices/invoice${invoice._id}.pdf`));
}

function generateHeader(doc) {
    doc
      .image("logo.jpg", 20, 0,{width: 100})
      .fillColor("#444444")
      .fontSize(20)
      .text("Canvas Inc.", 110, 57)
      .fontSize(10)
      .text("123 Main Street", 200, 40, { align: "right" })
      .text("Tuzla, IST, 31433", 200, 65, { align: "right" })
      .moveDown();
}
function generateFooter(doc) {
    doc
        .fontSize(10)
        .text(
        "Thank you for your business.",
        50,
        750,
        { align: "center", width: 500 }
        );
}

function generateCustomerInformation(doc, invoice) {
    doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Invoice", 50, 130);

generateHr(doc, 150);
doc
    .fontSize(10)
    .text(`Invoice Number: ${invoice._id}`, 50, 155)
    .text(`Invoice Date: ${invoice.date.toISOString().slice(0,10)}`, 50, 170)
    .text(`Balance Due: ${invoice.total}`, 50, 185)

    .text(invoice.address, 350, 170)
    .text(invoice.name, 350, 155)
    .text(`${invoice.city}, ${invoice.country}`, 350, 185)
    .moveDown();
generateHr(doc, 200);
}


function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
doc
    .fontSize(10)
    .text(c1, 50, y,{width: 100, height: 30, ellipsis: true})
    .text(c2, 150, y)
    .text(c3, 280, y, { width: 90, align: "right" })
    .text(c4, 370, y, { width: 90, align: "right" })
    .text(c5, 0, y, { align: "right" });
}

async function generateInvoiceTable(doc, invoice) {
      invoiceTableTop = 220;
      doc.font("Helvetica-Bold");
      generateTableRow(
        doc,
        invoiceTableTop,
        "Item",
        "Description",
        "Unit Cost",
        "Quantity",
        "Line Total"
      );
      
      
      generateHr(doc, 240);
    for (var i = 0; i < invoice.items.length; i++) {
      var currentitem = await Product.findById(invoice.items[i].Product._id);
      console.log("I am here :"+i );
      var position = 220 + (30 * (i + 1)); 
      generateTableRow(
        doc,
        position,
        currentitem.productName,
        currentitem.productCategory,
        currentitem.productPrice,
        (invoice.items[i].Quantity).toString(),
        (currentitem.productPrice * invoice.items[i].Quantity).toString()
      );
    }
    generateHr(doc, position + 30);
    generateTableRow(
        doc,
        position +50,
        "",
        "",
        "Total: ",
        "",
        (invoice.total).toString()
      );
  }

function generateHr(doc, y) {
doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}
module.exports = {autoEmail ,autoInvoice};