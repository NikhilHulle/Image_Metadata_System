const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const imageSchema = new Schema({

	img: 
    {     
        data: Buffer, 
        contentType: String 
    }

},{strict: false});

module.exports = imagedb = mongoose.model('imagedb', imageSchema);
