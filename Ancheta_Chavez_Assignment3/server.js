// Server.js for Assignment 3 -- Chavez Ancheta -- Just A Quick Peek -- Used examples from the Assignment1 Example and Lab13 to create this server. Also read a lot online 

var data = require('./public/products.js'); // Loads products.js
var allProducts = data.allProducts; // Creating a variable called allProducts using the data variable 
const queryString = require('query-string'); // Creating the constant for queryString
var express = require('express'); // Using the express module
var app = express(); // Creating an app for the express module
var myParser = require("body-parser"); // Using the body parser module and setting it to myParser
var fs = require('fs'); // Using the fs module and setting it to fs
var filename = 'user_data.json'; // setting a variable called filename for the user_data.json
var cookieParser = require('cookie-parser'); //using the cookie-parser
var session = require('express-session'); //using the express-session module 
/* end of variable declarations */

app.use(myParser.urlencoded({ extended: true })); //putting data in the body 
const nodemailer = require("nodemailer"); //using the node mailer module 
app.use(cookieParser()); //using cookie-parser middleware

/* The next section is for express routing to create requests */
app.all('*', function (request, response, next) { 
  console.log(request.method + ' to ' + request.path); 
  next();
});

/* Reading the data using the fs module*/
if (fs.existsSync(filename)) {
  data = fs.readFileSync(filename, 'utf-8');

  users_reg_data = JSON.parse(data); // converting this string
}
else {
  console.log(filename + ' does not exist.'); // Just in case the file isn't there
}

/*via Alyssa Mencel's Assignment 3, and Noah Kim's Assignment 3. Tailored to fit my project*/
app.post("/generateInvoice", function (request, response) {
  cart = JSON.parse(request.query['cartData']); // Parses the cart data 
  cookie = JSON.parse(request.query['cookieData']); // Parses cookies
  var theCookie = cookie.split(';');
  for (i in theCookie) {
    // Got function from stackoverflow
    function split(theCookie) { // Splits the cookie (before "=")
      var i = theCookie.indexOf("=");

      if (i > 0)
        return theCookie.slice(0, i);// Takes off the string after the =
      else {
        return "";
      }
    };

    var key = split(theCookie[i]);

    /* Creating a variable for holding the username and customer email*/
    if (key == ' username') {
      var theUsername = theCookie[i].split('=').pop();
      var custEmail = users_reg_data[theUsername].email;
    };
  }

  /*
  Uses my old invoice.html (rest in peace) and generates it on the page
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

  // This was made via the Assignment 3 example
  var transporter = nodemailer.createTransport({ // Creating the transporter variable using the nodemailer
    host: 'mail.hawaii.edu', // Required to use mail.hawaii.edu
    port: 25, // Port set to 25
    secure: false, 
    tls: {
      rejectUnauthorized: false
    }
  });
  var mailOptions = {
    from: 'csna@hawaii.edu', // Email sent from my hawaii.edu
    to: custEmail, // Sends the email to the customer --> Variable that was created earlier
    subject: 'Invoice',
    html: str // String returns as html
  };
  // Creates a console message
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

    for (i = 0; i < `${(products_array[`type`][i])}`.length; i++) { // Using the array
      qty = POST[`quantity_textbox${i}`]; // Changes the variable qty to the information from quantity_textbox

      if (qty > 0) {
        amount = true; 
      }

      if (isNonNegInt(qty) == false) { 
        validAmount = false; 
      }

    }

    const stringified = queryString.stringify(POST); // Converts data to JSON

    if (validAmount && amount) { // Testing to see if the quantity is greater than 0
      response.redirect("./login.html?" + stringified); // Redirects user to login page
      return; //stops function
    }

    else { response.redirect("./index.html?" + stringified) } // If information is invalid, should send to index page.

  }

});

// Repeat of the isNonNegInt function
function isNonNegInt(q, return_errors = false) {
  errors = []; // Setting up an array called errors
  if (q == '') q = 0; 
  if (Number(q) != q) errors.push('<font color="red">Not a number</font>'); // pushes an error if the number is not an actual number
  if (q < 0) errors.push('<font color="red">Negative number</font>'); // pushes an error if it's a negative number
  if (parseInt(q) != q) errors.push('<font color="red">Not a full product</font>'); // pushes an error if it's not a whole number
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
Got following 2 code via Alyssa Mencel's Assignment 3
*/
function ValidateEmail(inputText) {
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // Email can only contain numbers or symbols
  if (inputText.match(mailformat)) { // Input must match a valid email
    return true;
  }
  else {
    return false; // If email is not valid
  }
}


function isAlphaNumeric(input) {
  var letterNumber = /^[0-9a-zA-Z]+$/; // Only possible to be variables or numbers
  if (input.match(letterNumber)) { // Input must match letter and number
    return true;
  }
  else {
    return false;
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

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`)); // Makes sure to listen on port 8080