var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var topGearHeadlineSchema = new Schema({
  Headline: {
    type: String,
    trim: true
  },
  HeadlineURL: {
    type: String
  },
  Description: {
    type: String
  },
  ImageURL: {
    type: String,
  },
  Author: {
    type: String
  },
  PostDate: {
    type: String
  },
  Comments: {
    type: Array,
    default:null
  },
  Favorite: {
    type: Boolean,
    default:false
  },
  TimeStamp: {
    type:Date,
    default:Date.now
  }
});

var headline = mongoose.model("topGearHeadlines", topGearHeadlineSchema);
module.exports = headline;