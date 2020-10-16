const express = require('express')
require('dotenv').config()
const cors = require('cors')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const fs = require('fs-extra')
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('images'))
app.use(fileUpload())

const port = 8080
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qhxza.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {

  const customerServices = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION_CUSTOMER);

  const customerReviews = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION_REVIEW);

  const adminServices = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION_ADMIN);

  const adminEmails = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION_ADMIN_EMAIL);
  console.log('monodb connected YAY')

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.get('/services', (req, res) => {
    adminServices.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/servicesByCustomer', (req, res) => {
    const queryEmail = req.query.email
    console.log(queryEmail)
    customerServices.find({ email: queryEmail })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/checkAdmin', (req, res) => {
    const queryEmail = req.query.email
    console.log(queryEmail)
    adminEmails.find({ email: queryEmail })
      .toArray((err, documents) => {
        res.send(documents.length > 0)
      })
  })

 app.get('/findServicesForAdmin', (req, res) => {
    customerServices.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

 

  app.get('/reviews', (req, res) => {
    customerReviews.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.post('/addServiceByCustomer', (req, res) => {

    const file = req.files.file
    const catagory = req.body.catagory
    const details = req.body.details
    const email=req.body.email
    const filePath = `${__dirname}/images/${file.name}`

    file.mv(filePath, err => {
      const newImg = fs.readFileSync(filePath)
      const encImg = newImg.toString('base64')

      const image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')

      }

      customerServices.insertOne({ catagory, details, image,email })
        .then(result => {
          fs.remove(filePath)

        })
      return res.send({ name: file.name, path: `/${file.name}` })
    })


  })


  app.post('/addReviewByCustomer', (req, res) => {
    const reviewData = req.body;
    console.log(reviewData)
    customerReviews.insertOne(reviewData)

  })

  app.post('/addServiceByAdmin', (req, res) => {
    const file = req.files.file
    const title = req.body.title
    const desc = req.body.desc
    const filePath = `${__dirname}/images/${file.name}`

    file.mv(filePath, err => {
      const newImg = fs.readFileSync(filePath)
      const encImg = newImg.toString('base64')

      const image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')

      }

      adminServices.insertOne({ title, desc, image })
        .then(result => {
          fs.remove(filePath)

        })
      return res.send({ name: file.name, path: `/${file.name}` })
    })


  })
  app.post('/addAdminEmail', (req, res) => {
    const addEmail = req.body;
    console.log(addEmail)
    adminEmails.insertOne(addEmail)
    res.send('admin added successfully')
  })

});


app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})