//Scraping
const axios = require("axios")
const cheerio = require("cheerio")
const mongojs = require('mongojs')

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/TommyDatabase";
const db = mongojs(MONGODB_URI, ['topGearHeadline']);

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
});

//Server
const express = require('express');
const path = require("path");
// =============================================================
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;

//Handle Bars 
const exphbs = require("express-handlebars");
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