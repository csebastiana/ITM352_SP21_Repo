// Server.js for Assignment 2 -- Chavez Ancheta -- Just A Quick Peek -- Used examples from the Assignment1 Example and Lab13 to create this server. Also read a lot online 

var data = require('./public/products.js'); // Pulls the data from products.js and sets it in a variable called data
var products_array = data.products; // Create an array using the products from the newly made data variable
const queryString = require('query-string'); // creating a const variable called queryString so that I can use the querystring module, this is the default code for accessing. (per nodejs.org)
var express = require('express'); // creating the variable express so that i can use the express module
var app = express(); // putting the express module into a variable called app
var myParser = require("body-parser"); // created to allow me to use the body-parser module
var filename = 'user_data.json'; // If I didn't have to update this file (with new users) I would have set it as a constant, but since we update, it's a variable
var fs = require('fs'); // initializes file system

app.all('*', function (request, response, next) { // this is required because i am using express to route. it will allow me to make requests
  console.log(request.method + ' to ' + request.path); // this writes the request into the console
  next();
});

app.use(myParser.urlencoded({ extended: true })); // setting the parser to true to deal with nested objects. (read more about what this line does on stackoverflow)

if (fs.existsSync(filename)) {
  data = fs.readFileSync(filename, 'utf-8');

  users_reg_data = JSON.parse(data); // converting this string
}
else {
  console.log(filename + ' does not exist.'); // Just in case the file isn't there
}

app.post("/process_login", function (req, res) { // Setting up a process_login that will use the data inputted to validate and send the user to the invoice if working properly
  var LogError = [];
  console.log(req.query);
  a_username = req.body.username.toLowerCase();
  if (typeof users_reg_data[a_username] != 'undefined') { // Main test to validate the data inputted (user information)
    if (users_reg_data[a_username].password == req.body.password) {
      req.query.username = a_username;
      console.log(users_reg_data[req.query.username].name);
      req.query.name = users_reg_data[req.query.username].name
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

app.post("/process_purchase", function (request, response) {
  let POST = request.body;

  // If statement created to determine whether or not values are positive.
  if (typeof POST['submitPurchase'] != 'undefined') {
    var hasvalidquantities = true; // creating a variable assuming that it'll be true
    var hasquantities = false
    for (i = 0; i < products.length; i++) {

      qty = POST[`quantity${i}`];
      hasquantities = hasquantities || qty > 0; // Checks if quantity is greater than 0
      hasvalidquantities = hasvalidquantities && isNonNegInt(qty);    // Uses an and statement to return whether or not both conditions are true (not negative and greater than 0)    
    }
    // Runs this part of the if statement if all conditions are met 
    const stringified = queryString.stringify(POST);
    if (hasvalidquantities && hasquantities) {
      response.redirect("./login.html?" + stringified); // This will use the login.html file
      return;
    }
    else {
      response.redirect("./products_display.html?" + stringified) // If there are no valid numbers input in the quantity, it will redirect to the products_display page.
    }
  }
});
/* Since the server is totally separate from the pages, I had to copy and paste the isNonNegInt function onto the server itself, or it would not be able to check. */
function isNonNegInt(q, returnErrors = false) {
  errors = []; // Setting up an array called errors
  if (q == "") { q = 0; }
  if (Number(q) != q) errors.push('Not a number!'); // pushes an error if the number is not an actual number
  if (q < 0) errors.push('Negative value!'); // pushes an error if it's a negative number
  if (parseInt(q) != q) errors.push('Not an integer!'); // pushes an error if it's not a whole number
  return returnErrors ? errors : (errors.length == 0);
}

app.use(express.static('./public')); // this sets public as the root for the express node module
app.listen(8080, () => console.log(`listening on port 8080`));  //For this server it was required for us to make it listen on port 8080. 
