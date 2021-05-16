// Ancheta, Chavez -- Assignment 3 -- products page
var peekers = [
    {
        "name": "Hisoka",
        "price": 8.99,
        "image": "./images/hisoka.png"
    },
    {
        "name": "Zenitsu",
        "price": 11.99,
        "image": "./images/zenitsu.png"
    },
    {
        "name": "Killua",
        "price": 9.99,
        "image": "./images/killua.png"
    }
]
var apparel = [
    {
        "name": "Naruto",
        "price": 19.99,
        "image": "./images/naruto.jpeg"
    },
    {
        "name": "Pikachu",
        "price": 10.99,
        "image": "./images/pikachu.jpg"
    },
    {
        "name": "Asce",
        "price": 9.99,
        "image": "./images/asce.png"
    }
]
var carJunk = [
    {
        "name": "Senpai",
        "price": 10.00,
        "image": "./images/senpai.jpg"
    },
    {
        "name": "Jinchuriki",
        "price": 11.00,
        "image": "./images/jinchuriki.png"
    },
    {
        "name": "Happy Endings",
        "price": 12.00,
        "image": "./images/happyendings.jpg"
    }
]
var lifestyle = [
    {
        "name": "Hinata Jet Tag",
        "price": 5.99,
        "image": "./images/hinata.jpg"
    },
    {
        "name": "Demon Slayer Phone Case",
        "price": 11.99,
        "image": "./images/kimetsunoyaiba.png"
    },
    {
        "name": "Waifu Pop Socket",
        "price": 10.99,
        "image": "./images/waifu.jpg"
    }
]

var allProducts = {
    "peekers": peekers,
    "apparel": apparel,
    "carJunk": carJunk,
    "lifestyle": lifestyle
}

if (typeof module != 'undefined') {
    module.exports.allProducts = allProducts;
}