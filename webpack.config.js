// module: {
//     rules: [
//         {
//             test: /\.m?js$/,
//             exclude: /(node_modules|bower_components)/,
//             optimization: {
//                 minimize: true,
//                 minimizer: [
//                   new TerserPlugin({
//                     ignore: ['./node_modules/@mui/system/esm/style.js'], // Add this line to ignore the specific file
//                   }),
//                 ],
//               },
//             use: {
//                 loader: 'babel-loader',
//                 options: {
//                     presets: ['@babel/preset-env', '@babel/preset-react']
//                 }
//             }
//         }
//     ]
// }


  module.exports = {
module: {
    rules: [
        {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            optimization: {
                minimize: true,
                minimizer: [
                  new TerserPlugin({
                    ignore: ['./node_modules/@mui/system/esm/style.js'], // Add this line to ignore the specific file
                  }),
                ],
              },
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react']
                }
            }
        }
    ]
},
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            ecma: 6,
            warnings: false,
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
            },
            mangle: {
              safari10: true,
            },
            keep_classnames: undefined,
            keep_fnames: false,
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
          exclude: [/node_modules\/@mui\/system\/esm\/style\.js/],
        }),
      ],
    },
  };