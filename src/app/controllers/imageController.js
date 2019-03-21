const router = require('express').Router()
const mongoose = require('mongoose')
const multer = require('multer');
const multerConfig = require('../middleware/multer')
const ObjectID = require('mongodb').ObjectID;
const mongodb = require('mongodb');
const fs = require('fs')

const conn = mongoose.connection

conn.once('open', () => {

    const GridFSBucket = new mongodb.GridFSBucket(conn.db, {
        bucketName: 'uploads',
    });

    /**
     * @route POST /upload
     * @desc  Upload file to DB
     */
    router.post('/upload', multer(multerConfig).single('file'), (req, res) => {
        res.json({ file: req.file });
        //res.redirect('/');
    });

    /**
     * @route GET /download/:id
     * @desc  Download file
     * */
    router.get('/download/:id', (req, res) => {

        const imageId = new ObjectID(req.params.id);

        GridFSBucket.openDownloadStream(imageId)
            .pipe(
                fs.createWriteStream('./image.jpg')
            )
            .on('error', error => {
                res.json({ error: error })
            })
            .on('finish', () => {
                res.json({ download: 'ok' })
            });
    })

    /**
     * @route GET /files/:id
     * @desc  Display single file object
     * */
    router.get('/files/:id', (req, res) => {

        const imageId = new ObjectID(req.params.id);

        GridFSBucket.openDownloadStream(imageId)
            .on('data', chunk => {
                res.write(chunk);
            })
            .on('error', error => {
                res.json({ error: error })
            })
            .on('end', () => {
                res.end();
            });
    });

    /**
    * @route GET /image/:id
    * @desc Display Image
    * */
    router.get('/image/:id', (req, res) => {

        const imageId = new ObjectID(req.params.id);

        GridFSBucket.find(imageId)
            .on('error', error => {
                res.json({ image: error, ERROR: 'imagem não encontrada' })
            })
            .on('data', file => {
                res.json({ file });
            })
            .on('end', () => {
                res.end();
            });
    });

    /**
     * @route GET /files
     * @desc  Display all files in JSON
     * */
    router.get('/files', (req, res) => {

        GridFSBucket.find().toArray((error, files) => {
            if (!files || files.length === 0) {
                return res.json({ database: error, ERROR: 'não há imagens para listar' });
            } else {
                return res.json({ files });
            }
        });
    });

    /**
     * @route DELETE /files/:id
     * @desc  Delete file
     * */
    router.delete('/files/:id', (req, res) => {

        const imageId = new ObjectID(req.params.id);

        GridFSBucket.delete(imageId, error => {
            if (!imageId) {
                return res.json(error)
            } else {
                return res.json({ image: 'deleted' })
            }
        })
    });

    /**
    * @route GET /drop
    * @desc remove all files and chunks
    * */
    router.get('/drop', (req, res) => {

        GridFSBucket.drop(() => {
            res.json({ delete: 'all files and chunks' })
        })
    });
});

module.exports = router;

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
