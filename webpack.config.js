const path = require('path')

module.exports = {
  entry: './stegcloak.js',
  output: {
    filename: 'stegcloak.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'StegCloak'
  }
}
