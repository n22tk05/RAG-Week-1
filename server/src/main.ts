import dotenv from "dotenv"
import express from 'express'
import cors from 'cors'
dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended : true}))
app.listen(PORT ,() => {
    console.log('port', PORT)
})
app.get('', (req, res) => {
    res.json("Hello World")
})