const express= require('express')
const mongoose= require('mongoose')
const bodyparser= require('body-parser')
const cors= require('cors')
const app = express()

require('dotenv/config')

//const router = require('./Routes/user')

//middleware
app.use(bodyparser.json())
app.use(cors())


app.use(express.json())


//user router /api 
//app.use('/api',router);

app.use('/api/', require('./Routes/user'));
app.use('/api/', require('./Routes/user_account'));

//Routes
app.get('/api/welcome', (req,res)=>{
    res.send('Welcome to Bank of Ahmedabad')
})


//mongo connect
mongoose.connect(process.env.DB_CONNECT)
.then(()=>{console.log('connected to mongo')})
.catch((err)=>{console.log(err)})



//listen
app.listen(5000, {useNewUrlParser: true,
    useUnifiedTopology: true,} , ()=>{console.log(`Running on port 5000`)})

//http://localhost:5000/api/register