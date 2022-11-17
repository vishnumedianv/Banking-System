const mongoose = require('mongoose')


const userAccount = new mongoose.Schema({
    account_balance:{
        type: Number,

    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
})


module.exports = mongoose.model('user_account', userAccount)