var multer  = require('multer')
const path = require('path')

var  storage =  multer({
    limits: {fileSize: 500000000000},
    storage:multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${__dirname}/../uploads/clientimg`)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
  }
})
})

module.exports = storage;