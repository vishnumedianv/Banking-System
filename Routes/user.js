const express = require('express')
const router = express.Router()

const random = require('randomstring')

const User = require('../models/user')
const bcrypt = require('bcrypt')
const { application } = require('express')


const user_account = require('../models/user_account')

const user_jwt = require('../middleware/user_jwt')
const jwt = require('jsonwebtoken')
const { token } = require('morgan')
const user = require('../models/user')



//get all users
router.get('/users', async (req, res, next) => {
    const all_users_data = await User.find().select(['name', 'id', 'email'])
    res.send(all_users_data)
})


//get particular user


router.get('/user/:id', async (req, res, next) => {
    const singleUserData = await User.findById(req.params.id).select(['-password', '-token      '])
    res.send(singleUserData)
})

//authentication
// router.get('/', user_jwt ,async (req, res, next)=>{
//     try{
//         const user= await User.findById(req.user.id).select('-password');
//         res.status(200).json({
//             success: true,
//             user: user
//         })
//     }catch(err){
//         console.log(err.message);
//         next()
//     }
// } )

//user register routes

router.post('/register', async (req, res, next) => {
    const { name, email, number, password } = req.body;
    try {
        let userExist = await User.findOne({ email: email });
        if (userExist) {
            res.json({
                success: false,
                msg: 'user already exist'
            });
        }


        let user = new User();
        user.name = name;
        user.email = email;
        user.number = number;

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);


        await user.save();

        let NewAccountBalance = user_account({
            account_balance: 0,
            user: user.id
        })

        await NewAccountBalance.save();



        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, process.env.jwtUserToken, {
            expiresIn: 400000
        }, (err, token) => {
            if (err) throw err;
            res.status(200).json({
                success: true,
                token: token
            })
        })


    } catch (err) {
        console.log(err)
    }
})


//Login

router.post('/login', async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        let user = await User.findOne({ email: email })
        if (!user) {
            res.status(400).json({
                success: false,
                msg: 'user not exsists'
            })
        }


        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid Password'
            })
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload, process.env.jwtUserToken,
            {
                expiresIn: 40000
            }, (err, token) => {
                if (err) throw err;

                res.status(200).json({
                    success: true,
                    msg: 'user login successful',
                    token: token,
                    user: user
                });
            }
        )

    } catch (err) {
        res.status(401).json({
            success: false,
            msg: 'something went wrong'
        })
    }
})



//change password

// router.post('/change', user_jwt, async (req, res, next) => {
//     try {

//         const password = req.body.password;
//         const email = req.body.email;
//         const newPassword = req.body.newPassword;

//         let user = await User.findOne({ email: email })
//         if (!user) {
//             res.status(400).json({
//                 success: false,
//                 msg: 'user not exsists'
//             })
//         }


//         const isMatch = await bcrypt.compare(password, user.password)
//         if (!isMatch) {
//             return res.status(400).json({
//                 success: false,
//                 msg: 'Invalid Password'
//             })
//         }

//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(newPassword, salt);

//         User.findByIdAndUpdate(req.params.id, { 'password': user.password }, {
//             new: true,
//             runValidators: true
//         })

//     } catch (error) {
//         next(error)
//     }
// })



module.exports = router;