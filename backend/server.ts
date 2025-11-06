import express from "express"
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import userRoutes from './routes/userRoutes.js'

dotenv.config()


const app = express()
app.use(express.json())

await connectDB()


app.use('/',userRoutes)




app.listen(process.env.PORT,()=>console.log('Server running'))