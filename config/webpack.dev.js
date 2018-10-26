const commonWebpack = require('./webpack.common.js');

module.exports = {
    ...commonWebpack("development"),
    mode: "development",
    devtool: 'source-map',
};
