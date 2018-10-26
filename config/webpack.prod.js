const commonWebpack = require('./webpack.common.js');

module.exports = {
    ...commonWebpack("production"),
    mode: "production",
    devtool: 'source-map',

};
