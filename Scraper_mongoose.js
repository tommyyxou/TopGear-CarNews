//Scraping
const axios = require("axios")
const cheerio = require("cheerio")
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/TommyDatabase";
mongoose.connect(MONGODB_URI, {useNewUrlParser: true});
mongoose.set('useFindAndModify', false);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log ("DB connected!")
});

const headlineModel = require ("./headline");
const commentModel = require ("./comment") 

axios.get("https://www.topgear.com/car-news").then(function(response) {

    let $ = cheerio.load(response.data);
    
    headlineModel.deleteMany({
        Favorite:false
    }).then(function(data){
    }).catch(function (err){
        if (err) return handleError(err);
    });

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
            
        headlineModel.create({
            Headline: headline,
            HeadlineURL: headlineURL,
            Description: description,
            ImageURL: imageURL,
            Author: author,
            PostDate: postDate,
        }).then(function (data){
            
        }).catch(function (err){
            if (err) return handleError(err);
        })
    });
    //console.log ("Data Entered")
});

//Server

const express = require('express');
const path = require("path");
// =============================================================
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(express.static(__dirname + '/assets'));

const PORT = process.env.PORT || 8080;

//Handle Bars 
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//Handle Bars

app.get("/", function (req, res){
    res.redirect("/Car-news")
});

app.get("/Car-news", function (req, res){

    headlineModel.find({
        Favorite:false
    }).sort({TimeStamp: 1 }).then(function (docs) {
        let hbsObject = {data: docs};
        res.render("index", hbsObject)
    }).catch(function (err){
        if (err) return handleError(err);
    })
});


app.get("/favorite", function (req, res){

    headlineModel.find({
        Favorite:true
    }).then(function (headlineDocs) {
        if (headlineDocs.length > 0) {
            for (let i = 0; i < headlineDocs.length; i++) {
                let headline = headlineDocs[i].Headline;

                commentModel.find({
                    Headline: headline
                }).then(function (docs){
                    if (docs.length > 0) {
                        let comments = docs
                        let headline = docs[0].Headline;
                        headlineModel.findOneAndUpdate({
                            Headline: headline,
                            Favorite:true
                        },{
                            Comments: comments
                        }).then( function () {
                            if (i == headlineDocs.length - 1) {
                                display()
                            }
                        }
                        ).catch(function (err3){
                            //if (err3) return handleError(err3);
                        })
                    } else {display()};
                }).catch(function (err2){
                    //if (err2) return handleError(err2);
                })
            };
        } else {display()}
    }).catch(function (err1){
        if (err1) return handleError(err1);
    });

    function display () {
        headlineModel.find({
            Favorite:true
        }).then(function (docs) {
            let hbsObject = {data: docs};
        res.render("favorite", hbsObject)
        }).catch(function (err){
            if (err) return handleError(err);
        });
    }
});

app.get("/alreadyInFavorite", function (req, res){
    res.render("Favorited")
});

app.post("/favorite/:id/:title", function (req, res){
    let id = req.params.id
    let title = req.params.title

    headlineModel.find({
        Headline:title,
        Favorite:true
    }).then(function (data){
        //console.log (data.length);
        if (data.length === 0) {
            headlineModel.findOneAndUpdate({
                _id:id
            },{
                Favorite:true
            },{
                new:true
            }).then(function (data){
                res.redirect("/favorite")
            }).catch( function (err){
                if (err) return handleError(err);
            })
        } else {
            res.redirect("/alreadyInFavorite")
        };
    }); 
});

app.post("/comment/:headline", function (req, res){
    let headline = req.params.headline;
    let author = req.body.author;
    let comment = req.body.comment;

    commentModel.create({
        Headline: headline,
        Author: author,
        Comment: comment
    }).then(function (data){
        res.redirect("/favorite")
    }).catch(function (err){
        if (err) return handleError(err);
    });
});

app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});