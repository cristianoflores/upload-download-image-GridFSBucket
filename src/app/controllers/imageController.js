const router = require('express').Router()
const mongoose = require('mongoose')
const multer = require('multer');
const multerConfig = require('../middleware/multer')
const fs = require('fs')

const conn = mongoose.connection

let GridFSBucket;

conn.once('open', () => {
    GridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads',
    });
});

// @route POST /upload
// @desc  Uploads file to DB
router.post('/upload', multer(multerConfig).single('file'), (req, res) => {
    res.json({ file: req.file });
    //res.redirect('/');
});

// @route GET /files/:filename
// @desc  Display single file object
router.get('/files/:filename', (req, res) => {

    GridFSBucket.find({ filename: req.params.filename }, (err, file) => {

        console.log({ filename: req.params.filename })

        // Check if file
        if (!file || file.length === 0) {
            console.log(err)
            return res.status(404).json({ err: 'No file exists' });
        }

        return res.json({ file });
    });
});

// @route GET /image/:filename
// @desc Display Image
router.get('/image/:filename', async (req, res) => {
    await GridFSBucket.find({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = fs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});

// @route GET /files
// @desc  Display all files in JSON
router.get('/files', async (req, res) => {
    await GridFSBucket.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }

        // Files exist
        return res.json(files);
    });
});

// @route DELETE /files/:id
// @desc  Delete file
router.delete('/files/:id', (req, res) => {
    GridFSBucket.delete({ _id: req.params.id }, (err, gridStore) => {
        if (err) {
            return res.status(404).json({ err: 'Error on delete' });
        }

        return res.json({ ok: 'file deleted' })
        //res.redirect('/');
    });
});

/* --- PARA RENDERIZAR HTML CASO FRONTEND ESTAR JUNTO COMO BACKEND ---
// @route GET /
// @desc Loads form
router.get('/', (req, res) => {
    GridFSBucket.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            res.render('index', { files: false });
        } else {
            files.map(file => {
                if (
                    file.contentType === 'image/jpeg' ||
                    file.contentType === 'image/png'
                ) {
                    file.isImage = true;
                } else {
                    file.isImage = false;
                }
            });
            res.render('index', { files: files });
        }
    });
});
*/

module.exports = router;