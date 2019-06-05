var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var commentSchema = new Schema({
  Headline: {
    type: String,
    trim: true
  },
  Author: {
    type: String,
    default:"Anonymous"
  },
  PostDate: {
    type: Date,
    default: Date.now
  },
  Comment: {
    type: String
  },
});

var comment = mongoose.model("topGearComments", commentSchema);
module.exports = comment;