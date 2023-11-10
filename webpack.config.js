const path = require('path');

module.exports = {
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.scss$/i,
                use: ["style-loader", "css-loader", "sass-loader"],
            },

        ],
    },
    target: "web",
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'citrahold.js',
        path: path.resolve(__dirname, 'server', "static", "js"),
        library: {
            name: 'citrahold',
            type: 'window',
            export: 'default'
        }
    },
    watchOptions: {
        ignored: './server/**.*'
    },
};