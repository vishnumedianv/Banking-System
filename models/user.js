const mongoose= require('mongoose')

const userSchema= new mongoose.Schema({
    name:{
        type: String,
        require: true,
    },
    email:{
        type: String,
        require: true,
        unique: true
    },
    number:{
        type: Number,
        require: true,
        maxlength: 10
    },
    password:{
        type: String,
        require: true,
    },
})

module.exports = mongoose.model('user', userSchema);