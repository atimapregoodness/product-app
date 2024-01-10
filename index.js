const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const appError = require('./utils/appError')
const flash = require('connect-flash')
const farms = require('./routes/farms')
const products = require('./routes/products')

// const farmRoute = require('./routes/farmRoute')

const categories = [
      'fruits',
      'vegetables',
      'meat',
      'bread',
      'books'
];

mongoose.connect('mongodb://127.0.0.1:27017/farmProducts', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
      console.log("CONNECTION SUCCEEDED")
}).catch(err => {
      console.log(`CONNECTION FAILED`)
      console.log(err)
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate)

app.use(express.urlencoded({ extended: true })) 
app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash())


// app.use((req, res, next) => {
//       res.locals.messages = req.flash('success')
//       next()
// })

app.get('/', (req, res) => {
      res.redirect('/home')
})


//farm routs ++++++++++++++++++++
app.use('/farms', farms)

app.use('/products', products)


//product routs
app.use((err, req, res, next) => {
      if (err.name === "CastError") {
            next(new appError('Page not found', 404))
      }
      else if (err.status === 404) {
            next(new appError(err.message, 404))
      }
      else if (err.status === 400) {
            next(new appError(err.message, 400))
      }
      // else if (err.name === 'ValidationError') {
      //       next(err.message, 400)
      // }
})

app.all('*', (req, res, next) => {
      next(new appError('Page not found', 404))
})

app.use((err, req, res, next) => {
      const { status = 500 } = err;
      if(!err.message) message = 'Something Went wrong!!!'
      res.status(status).render('errorPage/error', {err})
})


app.listen(3000, (req, res) => {
      console.log('LISTENING TO PORT 3000')
})