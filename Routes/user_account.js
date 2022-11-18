const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/user_jwt')

const user_account = require('../models/user_account')
const { route } = require('./user')
const user = require('../models/user')

const router = express.Router()


//deposit fund **PUT METHOD** optional

// router.put('/deposit/:id', auth ,async (req, res, next) => {
//     try {

//         let user1 = await user_account.findById(req.params.id);
//         if (!user1) {
//             return res.status(400).json({
//                 success: false,
//                 msg: 'not exsists'
//             })
//         }


//         let newAmount = req.body.account_balance
//         const singleUserData = await user_account.findById(req.params.id)
//         const total = singleUserData.account_balance + newAmount


//         user1 = await user_account.findByIdAndUpdate(req.params.id, { 'account_balance': total },
//             {
//                 new: true,
//                 runValidators: true
//             });



//         res.status(200).json({
//             success: true,
//             userDetails: user1,
//             msg: 'updated successfully'
//         })

//     } catch (err) {
//         next(err)
//     }

// })


//Deposite Fund

router.post('/deposit/:id', auth, async (req, res, next) => {
    try {

        let user1 = await user.findById(req.params.id);
        if (!user1) {
            return res.status(400).json({
                success: false,
                msg: 'not exsists'
            })
        }


        let newAmount = req.body.account_balance
        const singleUserData = await user.findById(req.params.id)
        const total = singleUserData.Balance + newAmount


        const userBalance = await user_account.create({
            account_balance: newAmount,
            transaction: 'Credit',
            user: user1.id
        })

        await userBalance.save()

        await user.findByIdAndUpdate(req.params.id, { 'Balance': total }, {
            new: true,
            runValidators: true
        });

        const updatedUser = await user.findById(req.params.id)

        res.status(200).json({
            success: true,
            userDetails: updatedUser,
            msg: 'updated successfully'
        })

    } catch (err) {
        next(err)
    }

})

//user transactions
router.get('/transaction/:ac_no', auth, async (req, res, next) => {
    try {
        const userTransaction = await user_account.find({ 'user': req.params.ac_no })
        res.json(userTransaction)
    } catch (error) {
        next(error)
    }
})

//fetch user balance

router.get('/balance/:id', auth, async (req, res, next) => {
    try {

        const user1 = await user.findById(req.params.id).select(['Balance', 'name'])

        if (!user1) {
            return res.status(400).json({
                success: false,
                msg: 'something went wrong'
            })
        }

        res.status(200).json({
            user: user1,
            account_balance: user1.account_balance,
            msg: 'users account details fetched successfully'
        })
    } catch (err) {
        next(err)
    }
})


//withdraw **PUT METHOD** optional
// router.put('/withdraw/:id', auth, async (req, res, next) => {
//     try {

//         let user1 = await user_account.findById(req.params.id);
//         if (!user1) {
//             return res.status(400).json({
//                 success: false,
//                 msg: 'not exsists'
//             })
//         }

//         let newAmount = req.body.account_balance
//         const singleUserData = await user_account.findById(req.params.id)


//         if (newAmount > singleUserData.account_balance) {
//             res.json({
//                 msg: "insuficient fund!!!"
//             })

//             var total = singleUserData.account_balance
//         }else{
//             total = singleUserData.account_balance - newAmount 

//         }

//         user1 = await user_account.findByIdAndUpdate(req.params.id, { 'account_balance': total },
//             {
//                 new: true,
//                 runValidators: true
//             });

//         res.status(200).json({
//             success: true,
//             userDetails: user1,
//             msg: 'updated successfully'
//         })

//     } catch (err) {
//         next(err)
//     }

// })



//Withdraw fund
router.post('/withdraw/:id', auth, async (req, res, next) => {
    try {

        let user1 = await user.findById(req.params.id);
        if (!user1) {
            return res.status(400).json({
                success: false,
                msg: 'not exsists'
            })
        }


        let newAmount = req.body.account_balance
        const singleUserData = await user.findById(req.params.id)
        if(newAmount>singleUserData.Balance){
            res.json({
                msg: 'insuficient fund'
            })
            var total = singleUserData.Balance
        }else{
            total = singleUserData.Balance - newAmount
        }

        const userBalance = await user_account.create({
            account_balance: newAmount,
            transaction: 'Debit',
            user: user1.id
        })

        userBalance.save()

        await user.findByIdAndUpdate(req.params.id, { 'Balance': total }, {
            new: true,
            runValidators: true
        });

        const userUpdate = await user.findById(req.params.id)

        res.status(200).json({
            success: true,
            userDetails: userUpdate,
            msg: 'updated successfully'
        })

    } catch (err) {
        next(err)
    }

})


//Transfer fund

router.post('/transfer/:id', auth, async (req, res, next) => {
    try {

        const sendAmount = req.body.transferamount;
        const receiver = req.body.receiverID
        
        let user1 = await user.findById(req.params.id);
        if (!user1) {
            return res.status(400).json({
                success: false,
                msg: 'not exsists'
            })
        }

        //sender 
        const senderUser = await user.findById(req.params.id)
        if(sendAmount>senderUser.Balance){
            res.json({
                msg: 'insuficient fund'
            })
            throw Error
        }else{
            total = senderUser.Balance - sendAmount
        }

        const userBalance = await user_account.create({
            account_balance: sendAmount,
            transaction: 'Debit',
            user: user1.id
        })

        userBalance.save()

        await user.findByIdAndUpdate(req.params.id, { 'Balance': total }, {
            new: true,
            runValidators: true
        });

        //Receiver

        const receiverUser = await user.findById(receiver)
        const receiverTotal = receiverUser.Balance + sendAmount


        const receiverUserBalance = await user_account.create({
            account_balance: sendAmount,
            transaction: 'Credit',
            user: receiverUser.id
        })

        receiverUserBalance.save()

        await user.findByIdAndUpdate(receiver, { 'Balance': receiverTotal }, {
            new: true,
            runValidators: true
        });

        const userUpdate = await user.findById(req.params.id)
        const receiverUpdate = await user.findById(receiver)

        res.status(200).json({
            success: true,
            userDetails: userUpdate,
            msg: 'sent successfully',
            
        })

    } catch (err) {
        next(err)
    }

})





module.exports = router;
