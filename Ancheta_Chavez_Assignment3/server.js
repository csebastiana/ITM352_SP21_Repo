// Server.js for Assignment 3 -- Chavez Ancheta -- Just A Quick Peek -- Used examples from the Assignment1 Example and Lab13 to create this server. Also read a lot online 

var data = require('./public/products.js'); //load the products file and setting it to variable data 
var allProducts = data.allProducts; //setting the variabel allProdcuts to the allProducts data in products.js
const queryString = require('query-string'); //using the query-string
var express = require('express'); //using the express module
var app = express(); //setting the variable app to express module 
var myParser = require("body-parser"); //using the body parser module
var fs = require('fs'); //using the fs module 
var filename = 'user_data.json';
//var user_info_file = './user_data.json'; //setting the user_data file to user_info_file
//var userdata_file = fs.readFileSync(user_info_file, 'utf-8'); //assigneing the userdata as a string variable 
//userdata = JSON.parse(userdata_file); //the json is then parsed and string is turned into object 
var cookieParser = require('cookie-parser'); //using the cookie-parser
var session = require('express-session'); //using the express-session module 
app.use(myParser.urlencoded({ extended: true })); //putting data in the body 
const nodemailer = require("nodemailer"); //using the node mailer module 

app.use(cookieParser()); //using cookie-parser middleware

app.all('*', function (request, response, next) { // this is required because i am using express to route. it will allow me to make requests
  console.log(request.method + ' to ' + request.path); // this writes the request into the console
  next();
});

if (fs.existsSync(filename)) {
  data = fs.readFileSync(filename, 'utf-8');

  users_reg_data = JSON.parse(data); // converting this string
}
else {
  console.log(filename + ' does not exist.'); // Just in case the file isn't there
}

/*this is used to take info from cart.html
the server will generate the invoice and send email to user
then the invoice will be displayed in the page*/
app.post("/generateInvoice", function (request, response) {
  cart = JSON.parse(request.query['cartData']); //this parses the cart 
  cookie = JSON.parse(request.query['cookieData']); //this parses the cookies 
  var theCookie = cookie.split(';');
  for (i in theCookie) {
    //function from stackoverflow.com
    function split(theCookie) { //split the cookie (before "=")
      var i = theCookie.indexOf("=");

      if (i > 0)
        return theCookie.slice(0, i);//takes off the string after the =
      else {
        return "";
      }
    };

    var key = split(theCookie[i]);

    //this sets the username to the variable theUsername 
    if (key == ' username') {
      var theUsername = theCookie[i].split('=').pop();
      var custEmail = users_reg_data[theUsername].email;
    };
  }

  /*
  this creates a string of the invoice from cart.html
  this is what is emailed to the user
  used with help from previous invoice.html 
  */

  str =
    ` <link rel="stylesheet" href="./stylesheets/navbar.css">
    <link rel="stylesheet" href="./stylesheets/checkout.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Arvo">
    <style>
      body {
        font-family: 'Arvo', 'Open Sans';
      }
    </style>
    <header>
    <ul>
    <li style="float:left"><a href="./index.html">Just A Quick Peeker</a></li>
    <li><a href="./products_display.html">Stickers</a></li>
    <li style="float:right"><a class="active" href="./invoice.html">Shopping Cart</a></li>
  </ul>
  <br>
  <div class="row">
    <div class="col-25">
      <div class="container">
        <table>
          <tbody>
            <tr>
              <th style="text-align: left;" width="40%">Product</th>
              <th width="20%">Quantity</th>
              <th width="20%">Price</th>
              <th width="20%">Extended Price</th>
            </tr>
    </header>
        <h3 align="center">Thank you for your purchase, <font color="#629DD1">${theUsername}!</font>
    
        <!-- template taken from first invoice on assignment1 -->
        <section id="one" class="wrapper style1">
                <!--start of invoice table--> 
          <table>
            <tbody>
            <tr>
                            <td style="text-align: left;" width="40%"><strong>Product</strong></td>
                            <td width="20%"><strong>Quantity</strong></td>
                            <td width="20%"><strong>Price</strong></td>
                            <td width="20%"><strong>Extended Price</strong></td>
                        </tr>`;

  subtotal = 0; //subtotal starts off as 0
  for (product in allProducts) {
    for (i = 0; i < allProducts[product].length; i++) {

      qty = cart[`${product}${i}`];
      if (qty > 0) { //if a quantity is entered in the textbox 
        extended_price = qty * allProducts[product][i].price //equation for extended price
        subtotal += extended_price; //adds each subtotatl to get the the extrended price 

        str += `
                        <tr>
                            <td style= "text-align: left" width="40%">${allProducts[product][i].name}</td>
                            <td width="20%">${qty}</td>
                            <td width="20%">\$${allProducts[product][i].price}</td>
                            <td  width="20%">\$${extended_price.toFixed(2)}</td>
                        </tr>
                    `;
      }
    };
  }
  //compute tax information
  var tax_rate = 0.0471;
  var tax = tax_rate * subtotal;
  // Compute shipping
  if (subtotal <= 50) {
    shipping = 2;
  }
  else if (subtotal <= 100) {
    shipping = 5;
  }
  else {
    shipping = 0.05 * subtotal; // 5% of subtotal
  }
  // Compute grand total
  var total = subtotal + tax + shipping;

  str += `
              <tr>
              <td colspan="4" width="100%">&nbsp;</td>
            </tr>
            <tr>
              <td colspan="3" width="67%">Sub-total</td>
              <td width="54%">${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td  colspan="3" width="67%"><span>Tax at ${100 * tax_rate}%</span></td>
              <td width="54%">${tax.toFixed(2)}</td>
            </tr>
            <tr>
                <td  colspan="3" width="67%">Shipping</span></td>
                <td width="54%">${shipping.toFixed(2)}</td>
              </tr>
            <tr>
              <td colspan="3" width="67%"><strong>Total</strong></td>
              <td width="54%"><strong>${total.toFixed(2)}</strong></td>
            </tr>
            <tr>
              <td style="text-align: center;" colspan="4"> <strong>OUR SHIPPING POLICY IS: A subtotal $0 - $49.99 will be $2 shipping
                A subtotal $50 - $99.99 will be $5 shipping
                Subtotals over $100 will be charged 5% of the subtotal amount</strong>
              </td>
          </tr>
      </tbody>
        </table> 
      </section>`;

  //this code was made with help from assignment 3 example 
  var transporter = nodemailer.createTransport({ //create the transporter variable
    host: 'mail.hawaii.edu', //note on itmvm webserver have to use the mail from hawaii.edu
    port: 25,
    secure: false, //use tls
    tls: {
      //do not fail on invalid certs
      rejectUnauthorized: false
    }
  });
  var mailOptions = {
    from: 'csna@hawaii.edu', //sends the invoice from my personal gmail account
    to: custEmail, //sends the email to cookie from the account that was logged in
    subject: 'Invoice',
    html: str //the string then returns as html 
  };
  //notification in console if errors in sending email or if it sent properly 
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  response.send(str); // string goes to be displayed in browser
});

// Creating a session and encrypting -- Got code from Alyssa Mencel's Assignment 3
app.use(session({ //
  secret: 'ITM352 Rocks!', //encrypts the session 
  resave: true, //saves the session
  saveUninitialized: false, //deletes or forgets session when it is done
  httpOnly: false, //doesnt allow access of cookies 
  secure: true, //only uses cookies in HTTPS
  ephemeral: true //this deletes this cookie when browser is closed 
}));
//process the quantity_form when POST request is made
app.post("/process_purchase", function (request, response) {
  let POST = request.body; // data is in the body 

  if (typeof POST['addProducts${i}'] != 'undefined') { //if the POST request is defined
    var validAmount = true; //make the variable validAmount true 
    var amount = false; //make the variable amount equal to false 

    for (i = 0; i < `${(products_array[`type`][i])}`.length; i++) { //for any product
      qty = POST[`quantity_textbox${i}`]; //sets the variable qty to quantity textbox 

      if (qty > 0) {
        amount = true; //if greater than 0 it is goog 
      }

      if (isNonNegInt(qty) == false) { //if isNonNegInt is false then it is not a number
        validAmount = false; // it is not a valid amount
      }

    }

    const stringified = queryString.stringify(POST); //converts data from POST to JSON string 

    if (validAmount && amount) { //if it is a quanity and greater than 0
      response.redirect("./login.html?" + stringified); // redirect the page to login page if not logged in 
      return; //stops function
    }

    else { response.redirect("./index.html?" + stringified) } //if there is invalid sends back to home page with the string 

  }

});

//repeats the isNonNegInt function
function isNonNegInt(q, return_errors = false) {
  errors = []; // assume no errors at first
  if (q == '') q = 0; // handle blank inputs as if they are 0
  if (Number(q) != q) errors.push('<font color="red">Not a number</font>'); // Check if string is a number value
  if (q < 0) errors.push('<font color="red">Negative number</font>'); // Check if it is non-negative
  if (parseInt(q) != q) errors.push('<font color="red">Not a full product</font>'); // Check that it is an integer
  return return_errors ? errors : (errors.length == 0);
}

app.post("/process_login", function (req, res) { // Setting up a process_login that will use the data inputted to validate and send the user to the invoice if working properly
  var LogError = [];
  console.log(req.query);
  a_username = req.body.username.toLowerCase();
  if (typeof users_reg_data[a_username] != 'undefined') { // Main test to validate the data inputted (user information)
    if (users_reg_data[a_username].password == req.body.password) {
      req.query.username = a_username;
      console.log(users_reg_data[req.query.username].name);
      req.query.name = users_reg_data[req.query.username].name;
      custEmail = users_reg_data[req.query.username].email;
      res.cookie('username', a_username);
      res.redirect('/invoice.html?' + queryString.stringify(req.query));
      return;
    } else { // Pushes error for wrong passwords
      LogError.push = ('Invalid Password');
      console.log(LogError);
      req.query.username = a_username;
      req.query.name = users_reg_data[a_username].name;
      req.query.LogError = LogError.join(';');
    }
  } else { // Pushes error for wrong usernames
    LogError.push = ('Invalid Username');
    console.log(LogError);
    req.query.username = a_username;
    req.query.LogError = LogError.join(';');
  }
  res.redirect('./login.html?' + queryString.stringify(req.query)); // Redirects to the login page
});

/*
the following two functions validate the information in the form 
made with help from w3resource.com 
*/
function ValidateEmail(inputText) {
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; //email can only contain letter, numbers, @ symbo 
  if (inputText.match(mailformat)) { //the input must match above requirements to be a valid email 
    return true;
  }
  else {
    return false; //email is invalid 
  }
}


function isAlphaNumeric(input) {
  var letterNumber = /^[0-9a-zA-Z]+$/; //can only be variables or numbers 
  if (input.match(letterNumber)) { //the input must match above requirements 
    return true;
  }
  else {
    return false; //it is invalid 
  }
}

app.post("/process_register", function (req, res) { // Process registration, this will validate data inputted in the form
  qStr = req.body
  console.log(qStr);
  var errors = [];

  if (/^[A-Za-z]+$/.test(req.body.name)) {
  }
  else { // Requires letters only
    errors.push('Use Only Letters for Full Name')
  }

  if (req.body.name == "") { // Isn't inputting an actual full name, First + Last
    errors.push('Invalid Full Name');
  }

  if ((req.body.fullname.length > 25 && req.body.fullname.length < 0)) { // Length is above my set character limit
    errors.push('Full Name Too Long')
  }

  var reguser = req.body.username.toLowerCase();  // Converting the username to lowercase so that even someone input CoolDude, it would convert to cooldude. Makes validating easier.
  if (typeof users_reg_data[reguser] != 'undefined') {
    errors.push('Username is already being used') // Pushes an error if the username is taken
  }

  if (/^[0-9a-zA-Z]+$/.test(req.body.username)) { // Test allows username to only be letters and numbers, if not -> pushes error
  }
  else {
    errors.push('Letters And Numbers Only for Username')
  }


  if (req.body.password.length < 6) { // Sets character minimum of 6 for the password
    errors.push('Password Too Short')
  }

  if (req.body.password !== req.body.repeat_password) { // Requires the password to be entered twice, both need to be correct.
    errors.push('Password Not a Match')
  }

  if (errors.length == 0) { // If there are no errors, continues onto the invoice page
    POST = req.body
    console.log('no errors')
    var username = POST['username']
    users_reg_data[username] = {};
    users_reg_data[username].name = username;
    users_reg_data[username].password = POST['password'];
    users_reg_data[username].email = POST['email'];
    data = JSON.stringify(users_reg_data);
    fs.writeFileSync(filename, data, "utf-8");
    res.redirect('./invoice.html?' + queryString.stringify(req.query)); // Redirects to the invoice
  }

  if (errors.length > 0) { // If there are errors, send to the registration page again.
    console.log(errors)
    req.query.name = req.body.name;
    req.query.username = req.body.username;
    req.query.password = req.body.password;
    req.query.repeat_password = req.body.repeat_password;
    req.query.email = req.body.email;

    req.query.errors = errors.join(';');
    res.redirect('register.html?' + queryString.stringify(req.query));
  }
});

app.post('/logout', function (request, response) { 
  request.session.reset(); 
  response.redirect('/index.html'); 
});

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`)); // Makes sure to listen on port 8080