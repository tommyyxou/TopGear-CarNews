//Scraping

let axios = require("axios")
let cheerio = require("cheerio")


const mongoose = require('mongoose');
// if (process.env.MONGODB_URI) {
//     mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});
// } else {
    mongoose.connect('mongodb://localhost/TommyDatabase', {useNewUrlParser: true});
// }
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log ("we're connected!")
});

var Schema = mongoose.Schema;

var topGearHeadline = new Schema({
    Headline: String,
    HeadlineURL: String,
    Description: String,
    ImageURL: String
});

var headlineModel = mongoose.model('Headline', topGearHeadline);

axios.get("https://www.topgear.com/car-news").then(function(response) {

    var $ = cheerio.load(response.data);
    
    headlineModel.remove();

    $("div.teaser__text-content").each(function(i,element){
        
        headline = $(element).children(".teaser__title").text();
        console.log (headline);
        
        headlineURL = $(element).children(".teaser__title").children().attr("href");
        
        description = $(element).children(".teaser__description").children().text();
            
        imageURL = $(element).parent().children(".teaser__image").children().children().attr("data-srcset")

        
        var TGheadline = new headlineModel({ 
            Headline: headline,
            HeadlineURL: headlineURL,
            Description: description,
            ImageURL: imageURL 
        });
            TGheadline.save(function (err) {
            if (err) return handleError(err);
            console.log ("saved!")
            });
            
        // headlineModel.create({ 
        //     Headline: headline,
        //     HeadlineURL: headlineURL,
        //     Description: description,
        //     ImageURL: imageURL 
        // }, function (err) {
        //     if (err) return handleError(err,headlineModel);
        //     console.log ();
        //   });
    });
    console.log ("Data Entered")
});

//Server

let express = require('express');
// =============================================================
let app = express();
app.use(express.json());
let PORT = process.env.PORT || 8080;

//Handle Bars 
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//Handle Bars

app.get("/", function (req, res){
    var headlineModel = mongoose.model('Headline', topGearHeadline);

    let data = headlineModel.find({ Headline: '*', function(err) {
        if (err) return handleError(err);
    }
    });
    console.log (data);
    // db.topGearHeadline.find(function (err, docs) {
    //     //res.json(docs);
    //     //console.log (docs)
    //     let hbsObject = {data: docs}
    //     res.render("index", hbsObject);
    // });
    
});

app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});