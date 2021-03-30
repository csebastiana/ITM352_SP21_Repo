 // Server.js for Assignment 1 -- Chavez Ancheta -- Just A Quick Peek -- Used examples from the Assignment1 Example and Lab13 to create this server. Also read a lot online 

var data = require('./public/products.js'); // Pulls the data from products.js and sets it in a variable called data
var products_array = data.products; // Create an array using the products from the newly made data variable
const queryString = require('query-string'); // creating a const variable called queryString so that I can use the querystring module, this is the default code for accessing. (per nodejs.org)
var express = require('express'); // creating the variable express so that i can use the express module
var app = express(); // putting the express module into a variable called app
var myParser = require("body-parser"); // created to allow me to use the body-parser module

app.all('*', function (request, response, next) { // this is required because i am using express to route. it will allow me to make requests
    console.log(request.method + ' to ' + request.path); // this writes the request into the console
    next(); 
});

app.use(myParser.urlencoded({ extended: true })); // setting the parser to true to deal with nested objects. (read more about what this line does on stackoverflow)

app.post("/process_purchase", function (request, response) {
    let POST = request.body; // Forms the data in the body

    // If statement created to determine whether or not values are positive.
    if (typeof POST['submitPurchase'] != 'undefined') {
        var hasvalidquantities=true; // creating a varibale assuming that it'll be true
        var hasquantities=false
        for (i = 0; i < products.length; i++) {
            
                        qty=POST[`quantity${i}`];
                        hasquantities=hasquantities || qty>0; // Checks if quantity is greater than 0
                        hasvalidquantities=hasvalidquantities && isNonNegInt(qty);    // Uses an and statement to return whether or not both conditions are true (not negative and greater than 0)    
        } 
        // Runs this part of the if statement if all conditions are met 
        const stringified = queryString.stringify(POST);
        if (hasvalidquantities && hasquantities) {
            response.redirect("./invoice.html?"+stringified); // This will use the invoice.html file
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
