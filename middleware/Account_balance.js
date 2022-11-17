const express = require('express')
const mongoose = require('mongoose')


const user_account = require('../models/user_account')


const router = express.Router()




// router.use('/register', async (req, res, next) => {
//     try {
//         const user_detail = user_account({
//             account_balance: 0,
//             user: req.body.id
//         });

//         if (!user_account) {
//             return res.status(400).json({
//                 success: false,
//                 msg: 'Something went wrong'
//             });

//         }

//         user_detail.save()


//         res.status(200).json({
//             success: true,
//             user_account_details: user_detail,
//             msg: 'Done'
//         });
//     } catch (err) {
//         next(err);
//     }
// })


module.exports = router