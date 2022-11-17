const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/user_jwt')

const user_account = require('../models/user_account')
const { route } = require('./user')
const user = require('../models/user')

const router = express.Router()


//deposit fund
router.put('/deposit/:id', async (req, res, next) => {
    try {

        let user1 = await user_account.findById(req.params.id);
        if (!user1) {
            return res.status(400).json({
                success: false,
                msg: 'not exsists'
            })
        }

    
        let newAmount = req.body.account_balance
        const singleUserData = await user_account.findById(req.params.id)
        const total= singleUserData.account_balance + newAmount
        

        user1 = await user_account.findByIdAndUpdate(req.params.id, { 'account_balance': total} ,
            {
                new: true,
                runValidators: true
            });

    

        res.status(200).json({
            success: true,
            userDetails: user1,
            msg: 'updated successfully'
        })

    } catch (err) {
        next(err)
    }

})


//post balance of particular user


//fetch user data

router.get('/balance', auth, async (req, res, next) => {
    try {

        const user1 = await user_account.find({ user: req.user.id })

        if (!user1) {
            return res.status(400).json({
                success: false,
                msg: 'something went wrong'
            })
        }

        res.status(200).json({
            user: user1,
            msg: 'users account details fetched successfully'
        })
    } catch (err) {
        next(err)
    }
})


//update account balance



router.put('/withdraw/:id', async (req, res, next) => {
    try {

        let user1 = await user_account.findById(req.params.id);
        if (!user1) {
            return res.status(400).json({
                success: false,
                msg: 'not exsists'
            })
        }

        user1 = await user_account.findByIdAndUpdate(req.params.id, req.body,
            {
                new: true,
                runValidators: true
            });

        res.status(200).json({
            success: true,
            userDetails: user1,
            msg: 'updated successfully'
        })

    } catch (err) {
        next(err)
    }

})


//withdraw fund





module.exports = router;
