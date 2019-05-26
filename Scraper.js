//Scraping

let axios = require("axios")
let cheerio = require("cheerio")


var mongojs = require('mongojs')
var db = mongojs('TommyDatabase', ['topGearHeadline']);

axios.get("https://www.topgear.com/car-news").then(function(response) {

    //console.log (response);
    var $ = cheerio.load(response.data);
    
    $("a.faux-block-link").each(function(i,element){

        console.log ($(element));
        
        // let headline = $(element).attr("href");
        // console.log (headline);
        // console.log ($(element).text());

        // db.NHLHeadline.insert(
        //     {
        //         Headline:headline,
        //         Link: link
        //     }

        // );
        console.log ("Data Entered")
    });
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

app.get("/NHL/get", function (req, res){
    db.NHLHeadline.find(function (err, docs) {
        //res.json(docs);
        //console.log (docs)
        let hbsObject = {data: docs}
        res.render("index", hbsObject);
    });
});

app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});