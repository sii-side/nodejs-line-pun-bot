// secret info
const MONGODB_URI = 'ないしょ'
const LINE_CHANNEL_SECRET = 'ないしょ'
const LINE_CHANNEL_TOKEN = 'ないしょ'

// common module
const crypto = require('crypto')

// express
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const request = require('request')

// mongodb
const mongoose = require('mongoose')
const schemaPun = new mongoose.Schema({
  body: String
}, {
  collection: 'pun'
})
const pun = mongoose.model('pun', schemaPun)

// functions
/**
 * dbからdocumentを指定数無作為抽出
 * @param {mongoose.model} model mongooseのmodel
 * @param {number} num 抽出数（デフォルトは1）
 * @param {function} callback コールバック
 */
const getRandomDocuments = (model, num = 1, callback) => {
  mongoose.connect(MONGODB_URI)

  model.aggregate({
    $sample: {
      size: num
    }
  }, (err, result) => {
    if(err) {
      throw new Error(err)
    }

    if (typeof callback === 'function') {
      callback(result)
    }
  })
}

// main
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

const server = app.listen(process.env.PORT || 5000, () => {
  const host = server.address().address
  const port = server.address().port
  console.log('Started listening at...', host, port)
})

app.get('/', (req, res) => {
  getRandomDocuments(pun, 1, pun => {
    res.send(pun[0].body)
  })
})

app.post('/', (req, res) => {
  const signature = req.get('X-Line-Signature')
  const hash = crypto.createHmac('sha256', LINE_CHANNEL_SECRET).update(new Buffer(JSON.stringify(req.body))).digest('base64')

  if (!signature || signature !== hash) {
    return res.send('Invalid request')
  }

  if (req.body.events[0].message.text.indexOf('ダジャレ') !== -1) {
    getRandomDocuments(pun, 1, pun => {
      request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer {${LINE_CHANNEL_TOKEN}}`,
        },
        json: true,
        body: {
          replyToken: req.body.events[0].replyToken,
          messages: [
            {
              type: 'text',
              text: pun[0].body
            }
          ]
        }
      })
    })
  }
})
