// converter.js

/**
 * Advanced Audio Conversion Engine
 * This module provides functionality to convert audio files between multiple formats.
 */

const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg'); // A wrapper around FFmpeg

/**
 * Converts audio file from one format to another.
 * @param {string} inputFile - Path to the input audio file.
 * @param {string} outputFile - Path to save the converted audio file.
 * @param {Function} callback - Callback function to run after conversion.
 */
function convertAudio(inputFile, outputFile, callback) {
    ffmpeg(inputFile)
        .toFormat(path.extname(outputFile).substring(1))
        .on('end', () => {
            console.log('Conversion finished!');
            callback(null);
        })
        .on('error', (err) => {
            console.error('Error during conversion:', err);
            callback(err);
        })
        .save(outputFile);
}

module.exports = { convertAudio };