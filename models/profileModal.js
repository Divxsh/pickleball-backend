const {Schema, models} = require('mongoose');

const profileSchema = new Schema({

},{
    timestamps:true
})

const profileModel = model('profile_detail', profileSchema)

module.exports = profileModel