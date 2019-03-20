const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');

const { PORT, MONGO_URI } = require('./src/constants/constants')

const app = express();

// Create mongo connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true })

// Middleware - configs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

app.use('/', require('./src/app/controllers/imageController'))

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
