const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');

module.exports = (mode) => {

    const babelPresets = [
        "@babel/preset-env",
        "@babel/preset-react",
    ];

    if (mode === "production") {
        /**
         * This is a temporary fix, because there is an issue with babel-preset-minify.
         * https://github.com/babel/minify/issues/904
         */
        babelPresets.push(["babel-preset-minify", {
            builtIns: false,
        }])
    }

    return {
        entry: ['@babel/polyfill', './dev/index.js'],
        mode,
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: babelPresets,
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: "style-loader"
                        },
                        {
                            loader: "css-loader",
                            options: {
                                modules: true,
                                localIdentName: '[path][name]__[local]--[hash:base64:5]'
                            }
                        }
                    ],
                }
            ]
        },
        devServer: {
            compress: true,
            port: 3000,
            historyApiFallback: true
        },
        output: {
            filename: 'main.js',
            path: path.resolve('./build/'),
            publicPath: '/',
            pathinfo: false
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin(),
            new HtmlWebPackPlugin({
                template: "./public/index.html",
                filename: "./index.html"
            })
        ],
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        enforce: true,
                        chunks: 'all'
                    }
                }
            }
        }
    }
};
