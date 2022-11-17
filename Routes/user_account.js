const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/user_jwt')

const user_account = require('../models/user_account')
const { route } = require('./user')

const router = express.Router()

router.post('/register',async (req,res, next)=>{
    const { name, email, number, password} = req.body;
    try{
        let userExist = await User.findOne({email: email});
        if(userExist){
            res.json({
                success: false,
                msg: 'user already exist'
            });
        }
        let user = new User();
        user.name= name;
        user.email = email;
        user.number= number;

        const salt= await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);


        await user.save();

        const payload ={
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, process.env.jwtUserToken, {
            expiresIn: 400000
        }, (err, token)=>{
            if(err) throw err;
            res.status(200).json({
                success: true,
                token: token
            })
        })

        
    }catch(err){
        console.log(err)
    }
})










//post balance of particular user
router.post('/deposit', auth, async (req, res, next) => {
    try {
        const user_detail = await user_account.create({
            account_balance: req.body.account_balance,
            user: req.user.id
        });

        if (!user_account) {
            return res.status(400).json({
                success: false,
                msg: 'Something went wrong'
            });

        }


        res.status(200).json({
            success: true,
            user_account_details: user_detail,
            msg: 'Done'
        });
    } catch (err) {
        next(err);
    }
})



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
