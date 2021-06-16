import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import Pusher from 'pusher'

import mongoData from './mongoDataSchema.js'
dotenv.config()

// app config
const app = express()
const port = process.env.PORT || 9000

const pusher = new Pusher({
    appId: process.env.APP_ID,
    key: process.env.KEY,
    secret: process.env.SECRET,
    cluster: process.env.CLUSTER,
    useTLS: true
})

// middlewares
app.use(cors())
app.use(express.json())

// db config
const mongoURI = process.env.MONGO_URI
mongoose.connect(mongoURI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.connection.once('open', () => {
    console.log('DB Connected')

    const changeStream = mongoose.connection.collection('conversations').watch()

    changeStream.on('change', (change) => {
        console.log(change)
        if(change.operationType === 'insert') {
            pusher.trigger('channels', 'newChannel', {
                'change': change
            })
        } else if (change.operationType === 'update') {
            pusher.trigger('conversation', 'newMessage', {
                'change': change
            })
        } else {
            console.log('error triggering pusher')
        }
    })
})

// api routes
app.get('/', (req,res) => res.status(200).send('HELLO ITS WORKING'))

app.post('/new/channel', (req, res) => {
    const dbData = req.body

    mongoData.create(dbData, (err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

app.post('/new/message', (req, res) => {
    const id = req.query.id
    const newMessage = req.body

    mongoData.update(
        {_id: id},
        {$push:{ conversation: newMessage }},
        (err, data) => {
            if(err) {
                res.status(500).send(err)
            } else {
                res.status(201).send(data)
            }
        }
    )
})

app.get('/get/channelList', (req, res) => {
    mongoData.find((err,data) => {
        if(err) {
            res.status(500).send(err)
        } else {
           let channels = []

           data.map((channelData) => {
               const channelInfo = {
                   id: channelData._id,
                   name: channelData.channelName
               }
               channels.push(channelInfo)
           })

           res.status(200).send(channels)
        }
    })
})

app.get('/get/conversations', (req, res) => {
    const id = req.query.id

    mongoData.find({ _id: id }, (err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

// listen
app.listen(port, () => console.log(`listening on port ${port}`))