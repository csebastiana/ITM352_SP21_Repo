// i didn't know how to use a json file with pictures so i just kept it as a javascript file
products = [
    {
    "name": "Bunta Peeker",
    "price": 7.99,
    "description": "Bunta, the original driver of the 'white ghost of Akina', will be a great addition to your fancy whip!",
    "image": "./images/bunta.png"
    },
    {
    "name": "Chrollo Peeker",
    "price": 9.99,
    "description": "The leader of the Phantom Troupe, having this sticker on your whip will give everyone that spooky vibe",
    "image": "./images/chrolo.png"
    },
    {
    "name": "Hisoka Peeker",
    "price": 8.99,
    "description": "Hisoka is shook as hell in this peeker, are you shook too?",
    "image": "./images/hisoka.png"
    },
    {
    "name": "Zenitsu Peeker",
    "price": 11.99,
    "description": "Show off how sleeper you are with a sleeping Zenitsu peeker",
    "image": "./images/zenitsu.png"
    },
    {
    "name": "Zero Two Peeker",
    "price": 10.99,
    "description": "Zero Two, the babe among babes. She's looking a little feisty, perfect for your bad girl vibe",
    "image": "./images/zerotwo.png"
    },
    {
    "name": "Killua Peeker",
    "price": 9.99,
    "description": "Killua, an assassin from the Zoldyck family, ready to turn up.",
    "image": "./images/killua.png"
    }
]
if (typeof module != 'undefined') {
    module.exports.products = products;
  }