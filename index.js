import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import userRoute from './routes/user.route.js'
import ejs from 'ejs'

import { connectDB } from './db/db.js'
connectDB()

const app = express()
const PORT = process.env.PORT || 8000

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.set('view engine','ejs')
app.set('views','./views')


//routes
//userRoute
app.use('/api/user',userRoute)


app.listen(PORT, () => {
    console.log('-----------------------------');
    console.log('-----------------------------');
    console.log(`server running on port `+PORT);
}); 