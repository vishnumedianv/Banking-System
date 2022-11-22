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
        max: 9999999999
    },
    password:{
        type: String,
        require: true,
    },
    Balance:{
        type: Number,
        default: 0
    },
    token:{
        type: String,
        default: ''
    },
    emailverification:{
        type: String,
        default: ''
    },
    temp:{
        type: String,
        default: ''
    },
    verified:{
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('user', userSchema);