const express= require('express')
const router= express.Router()
const User= require('../models/user')
const bcrypt= require('bcrypt')
const { application } = require('express')

const user_jwt = require('../middleware/user_jwt')
const jwt = require('jsonwebtoken')
const { token } = require('morgan')


//authentication
router.get('/', user_jwt ,async (req, res, next)=>{
    try{
        const user= await User.findById(req.user.id).select('-password');
        res.status(200).json({
            success: true,
            user: user
        })
    }catch(err){
        console.log(err.message);
        next()
    }
} )

//user register routes

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


//Login

router.post('/login', async(req, res, next)=>{
    const email = req.body.email;
    const password= req.body.password;

    try{
        let user = await User.findOne({email: email})
        if(!user){
            res.status(400).json({
                success: false,
                msg: 'user not exsists'
            })
        }


        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({
                success: false,
                msg: 'Invalid Password'
            })
        }

        const payload ={
            user:{
                id: user.id
            }
        }

        jwt.sign(
            payload, process.env.jwtUserToken,
            {
                expiresIn: 40000
            }, (err, token)=>{
                if(err) throw err;

                res.status(200).json({
                    success: true,
                    msg: 'user login successful',
                    token: token,
                    user: user
                });
            }
        )

    }catch(err){
        res.status(401).json({
            success: false,
            msg: 'something went wrong'
        })
    }
})

module.exports = router;