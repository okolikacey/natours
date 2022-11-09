const fs = require('fs')
const path = require('path');
const express = require('express')
const router = express.Router();

const users = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'dev-data', 'data', 'users.json')))


router.get('/', (req, res) => {
    res.send('not yet implemented')
})

router.get('/:id', (req, res) => {
    res.send('not yet implemented')
})

router.post('/', async(req, res) => {
   res.send('not yet implemented')
})

router.patch('/:id', async(req, res) => {
    // if(!tour) return res.status(404).send(`Tour with id ${req.params.id} not found`)
    res.send('Updated')

})

module.exports = router