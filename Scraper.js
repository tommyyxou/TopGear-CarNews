//Scraping

//mongodb://heroku_g37wngbt:30oujek3ij40c6gq1fjjso50pd@ds235708.mlab.com:35708/heroku_g37wngbt

let axios = require("axios")
let cheerio = require("cheerio")


var mongojs = require('mongojs')
if (process.env.MONGO_URI) {
    var db = mongojs(process.env.MONGO_URI, ['topGearHeadline']);
} else {
    var db = mongojs('TommyDatabase', ['topGearHeadline']);
}


axios.get("https://www.topgear.com/car-news").then(function(response) {

    var $ = cheerio.load(response.data);

    db.topGearHeadline.remove();

    $("div.teaser__text-content").each(function(i,element){
        let headline = "";
        let headlineURL = "";
        let description = "";
        let imageURL = "";
    
        // if ($(element).children(".teaser__title").text() != null || undefined || " ") {
            headline = $(element).children(".teaser__title").text();
            //console.log (headline);
        // };
        
        // if ($(element).children(".teaser__title").children().attr("href") != null || undefined || " ") {
            headlineURL = $(element).children(".teaser__title").children().attr("href");
            //console.log (headlineURL);
        // };
        
        // if ($(element).children(".teaser__description").children().text() != null || undefined || " ") {
            description = $(element).children(".teaser__description").children().text();
            //console.log (description);
        // };
        
        //if ($(element).parent().children(".teaser__image").children().children().attr("data-srcset") != null) {
            imageURL = $(element).parent().children(".teaser__image").children().children().attr("data-srcset")//.split(",")
            //console.log (imageURL);
        //};
        
        
        db.topGearHeadline.insert(
            {
                Headline:headline,
                HeadlineURL: headlineURL,
                Description: description,
                ImageURL: imageURL
            },
            
        );
    });
    console.log ("Data Entered")
});

//Server

let express = require('express');
// =============================================================
let app = express();
app.use(express.json());
let PORT = 8080;

//Handle Bars 
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//Handle Bars

app.get("/", function (req, res){
    db.topGearHeadline.find(function (err, docs) {
        //res.json(docs);
        //console.log (docs)
        let hbsObject = {data: docs}
        res.render("index", hbsObject);
    });
});

app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});