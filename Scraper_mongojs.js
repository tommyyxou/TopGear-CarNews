//Scraping

let axios = require("axios")
let cheerio = require("cheerio")
var mongojs = require('mongojs')

if (process.env.MONGODB_URI) {
    var db = mongojs(process.env.MONGODB_URI, ['topGearHeadline']);
} else {
    var db = mongojs('TommyDatabase', ['topGearHeadline'])
}


axios.get("https://www.topgear.com/car-news").then(function(response) {

    var $ = cheerio.load(response.data);

    db.topGearHeadline.remove();

    $("div.teaser__text-content").each(function(i,element){

        let headline = $(element).children(".teaser__title").text();
            
        let headlineURL = $(element).children(".teaser__title").children().attr("href");
        
        let description = $(element).children(".teaser__description").children().text();
        
        if ($(element).parent().children(".teaser__image").children().children().attr("data-srcset") != null) {
            imageURL = $(element).parent().children(".teaser__image").children().children().attr("data-srcset");
        } else if ($(element).parent().children(".teaser__image").children().children().children().attr("data-srcset") != null) {
            imageURL = $(element).parent().children(".teaser__image").children().children().children().attr("data-srcset");
        } else {
            imageURL = $(element).parent().children(".teaser__image").children().children().attr("src");
        };
        
        let author = $(element).children(".teaser__details").children(".teaser__author").text();

        let postDate = $(element).children(".teaser__details").children(".teaser__date").text();
        
        db.topGearHeadline.insert(
            {
                Headline:headline,
                HeadlineURL: headlineURL,
                Description: description,
                ImageURL: imageURL,
                Author: author,
                PostDate: postDate
            },
            
        );
    });
    console.log ("Data Entered")
});

//Server

let express = require('express');
let path = require("path");
// =============================================================
let app = express();
app.use(express.json());
let PORT = 8080;

//Handle Bars 
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//Handle Bars

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(express.static(__dirname + '/assets'));

app.get("/", function (req, res){
    res.redirect("/Car-news")
});

app.get("/Car-news", function (req, res){
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