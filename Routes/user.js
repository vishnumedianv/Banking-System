const express = require('express')
const router = express.Router()

const User = require('../models/user')
const bcrypt = require('bcrypt')
const { application } = require('express')


const user_account = require('../models/user_account')

const user_jwt = require('../middleware/user_jwt')
const jwt = require('jsonwebtoken')
const { token } = require('morgan')
const user = require('../models/user')


const nodemailer = require('nodemailer')
const randomstring = require('randomstring')

const sendresetmail = async (name, email, temp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'john.satterfield36@ethereal.email',
                pass: '1jj6ffycy6GjMZMRrX'
            }
        });


        const mailOptions = {
            from: 'john.satterfield36@ethereal.email',
            to: 'wirova3970@fdsdfdfddfddfdfdfdd.com',
            subject: 'Reset password',
            html: '<p> Hi, please click <a href="http://localhost:5000/api/reset?token=' + temp + '"> here</a>'

        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
            }
            else {
                console.log("mail sent", info.response)
            }
        })

    } catch (error) {
        console.log(error)
    }
}


//user verification email
const verifyuser = async (name, email, emailtemp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'john.satterfield36@ethereal.email',
                pass: '1jj6ffycy6GjMZMRrX'
            }
        });


        const mailOptions = {
            from: 'john.satterfield36@ethereal.email',
            to: 'wirova3970@fdsdfdfddfddfdfdfdd.com',
            subject: 'Verification',
            html: '<p> Hi, please click <a href="http://localhost:5000/api/verify?etemp=' + emailtemp + '"> here</a> to verify</p>'

        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
            }
            else {
                console.log("mail sent", info.response)
            }
        })

    } catch (error) {
        console.log(error)
    }
}



//get all users
router.get('/users', async (req, res, next) => {
    const all_users_data = await User.find().select(['name', 'id', 'email'])
    res.send(all_users_data)
})


//get particular user


router.get('/user/:id', async (req, res, next) => {
    const singleUserData = await User.findById(req.params.id).select(['-password', '-token', '-balance'])
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

        const etemp = randomstring.generate()
        verifyuser(user.name, user.email, etemp);

        user.emailverification= etemp;
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
            user.token = token

            res.status(200).json({
                success: true,
                token: token,
                msg: "verification mail sent to registered email please verify"
            })
        })

        await user.save()

    } catch (err) {
        console.log(err)
    }
})


//user verification mail
router.post('/verify', async (req, res) => {
    try {
        const temp = req.query.etemp
        const tokenData = await User.findOne({ emailverification: temp })
        if (!temp) {
            res.status(400).json({
                msg: 'invalid token'
            })
        }


        const userData = await User.findByIdAndUpdate({ _id: tokenData.id }, { $set: { verified: true, emailverification: '' } }, { new: true })

        res.status(200).json({userAccount: userData.id, username: userData.name, useremail: userData.email, msg: 'verification successful'})
    } catch (error) {
        res.status(400).json({
            msg: 'something went wrong'
        })
    }
})



//Login
// router.post('/login', async (req, res, next) => {
//     const email = req.body.email;
//     const password = req.body.password;

//     try {
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

//         const payload = {
//             user: {
//                 id: user.id
//             }
//         }

//         jwt.sign(
//             payload, process.env.jwtUserToken,
//             {
//                 expiresIn: 40000
//             }, (err, token) => {
//                 if (err) throw err;

//                 res.status(200).json({
//                     success: true,
//                     msg: 'user login successful',
//                     token: token,
//                     user: user
//                 });
//             }
//         )

//     } catch (err) {
//         res.status(401).json({
//             success: false,
//             msg: 'something went wrong'
//         })
//     }
// })





//login with user verfification

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

                
                if(user.verified == false){
                    res.status(200).json({
                        success: true,
                        msg: 'please verify your email address before fund transfer!!!',
                        token: token,
                        user: user
                    });
                }else{
                    res.status(200).json({
                    success: true,
                    msg: 'user login successful',
                    token: token,
                    user: user
                });}

                
            }
        )

    } catch (err) {
        res.status(401).json({
            success: false,
            msg: 'something went wrong'
        })
    }
})


//forgot password
router.post('/forgot', async (req, res, next) => {
    try {
        const email = req.body.email

        let user = await User.findOne({ email: email })
        if (!user) {
            return res.status(400).json({
                msg: 'user not found'
            })
        }
        const temp = randomstring.generate()
        sendresetmail(user.name, user.email, temp);

        await User.findByIdAndUpdate({ _id: user.id }, { $set: { temp: temp } }, { new: true })

        res.status(200).send('Email sent')


    } catch (err) {
        res.status(400).json({
            msg: 'not found'

        })
        next()
    }
})

//reset password
router.post('/reset', async (req, res) => {
    try {
        const temp = req.query.token
        const tokenData = await User.findOne({ temp: temp })
        if (!temp) {
            res.status(400).json({
                msg: 'invalid token'
            })
        }

        const password = req.body.newPassword
        const updatedPassword = await bcrypt.hash(password, 10)

        const userData = await User.findByIdAndUpdate({ _id: tokenData.id }, { $set: { password: updatedPassword, temp: '' } }, { new: true })

        res.status(200).json(userData)
    } catch (error) {
        res.status(400).json({
            msg: 'something went wrong'
        })
    }
})


//change password

// router.post('/change', user_jwt, async (req, res, next) => {

//     const email = req.body.email
//     const password = req.body.password
//     const newPassword = req.body.newPassword

//     try {

//         const userData = User.findOne({ email: email })
//         if (!userData) {
//             res.status(400).json({ msg: 'user with this email does not exist' })
//         }
//         const isMatch = await bcrypt.compare(password, user.password)
//         if(!isMatch){
//             res.status(401).send('invalid password')
//         }
//         const updatedPassword = await bcrypt.hash(newPassword, 10)

//         const updatedUserDetails = await User.findOneAndUpdate({ _id: userData.id }, { $set: { password: updatedPassword } }, { new: true })

//         res.status(200).json(updatedUserDetails)

//     } catch (error) {
//         res.status(400).json({
//             msg: 'user not found'
//         })
//     }
// })


//change password
router.post('/change', user_jwt, async (req, res, next) => {

    const email = req.body.email
    const password = req.body.password
    const newPassword = req.body.newPassword
    try {

        let user1 = await user.findOne({email: email});
        if (!user1) {
            return res.status(400).json({
                success: false,
                msg: 'not exsists'
            })
        }

        const isMatch = await bcrypt.compare(password, user1.password)
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid Password'
            })
        }
        

        const updatedPassword = await bcrypt.hash(newPassword,10)

        const newuserdetails= await user.findOneAndUpdate({_id: user1.id}, { $set: { password: updatedPassword} }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            userDetails: newuserdetails,
            msg: 'password changed successfully'
        })

    } catch (err) {
        next(err)
    }

})




module.exports = router;