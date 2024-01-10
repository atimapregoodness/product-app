const express = require('express')
const router = express.Router()
const wrapAsync = require('../utils/wrapAsync')
const Product = require('../models/product')
const flash = require('connect-flash')
const { productSchema } = require('../schemas/validateProduct')

const categories = [
      'fruits',
      'vegetables',
      'meat',
      'bread',
      'books'
];

const productValidator = (req, res, next) => {
      const {error} = productSchema.validate(req.body)
      if (error) {
            const msg = error.details.map(el => el.message).join(',')
            throw new routerError(msg, 400)

      } else{
            next()
      }
}

router.get('/', wrapAsync(async (req, res, next) => {
      const { category } = req.query;
      
      if (category) {
            const products = await Product.find({category})
            res.render('products/index', { products, categories, category})
            
      } else {
            const products = await Product.find({})
            res.render('products/index', {products, categories, category: 'All Products'})
      } 
}))

router.get('/add', (req, res) => {
      res.render('products/add', {categories})
})

router.get('/:id', wrapAsync(async (req, res, next) => {
      const { id } = req.params;
      const foundProduct = await Product.findById(id).populate('farm')
      if (!foundProduct) throw new routerError('Product Not Found', 404)
      const farmId = foundProduct.farm._id     

      res.render('products/productInfo', { foundProduct, categories, farmId})
}))

router.get('/:id/info', wrapAsync(async (req, res, next) => {
      const { id } = req.params;
      const foundProduct = await Product.findById(id).populate('farm')
      if (!foundProduct) throw new routerError('Product Not Found', 404)
      
      const farmId = foundProduct.farm._id
      
      res.render('products/info', { foundProduct, categories, farmId})
}))

router.get('/:id/edit', wrapAsync(async (req, res, next) => {
      const { id } = req.params;
      const product = await Product.findById(id)
      const farmId = product.farm._id

      res.render('products/edit', { product, categories, farmId }) 
}))

router.put('/:id', productValidator, wrapAsync (async (req, res, next) => {
      const { id } = req.params;
      const foundProduct = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true })
      res.redirect(`${foundProduct._id}`)  
}))


router.delete('/:id', async (req, res) => {
      const { id } = req.params
      const deletedProduct = await Product.findByIdAndDelete(id)
      const farmId = deletedProduct.farm._id

      res.redirect(`/farms/${farmId}`)

})

module.exports = router