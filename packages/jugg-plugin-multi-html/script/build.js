#!/usr/bin/env node

const copy = require('copy');
const path = require('path');

copy(
  path.join(process.cwd(), 'src', '*.ejs'),
  path.join(process.cwd(), 'lib'),
  function(err, files) {
    if (err) throw err;
    console.log('ejs copy done!');
    // `files` is an array of the files that were copied
  }
);
