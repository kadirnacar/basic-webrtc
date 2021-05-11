const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  devServer: {
    host: '0.0.0.0',
    // https: true,
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, './dist'),
    disableHostCheck: true,
    open: true,
    compress: true,
    hot: true,
    port: 8080,
  },
  entry: {
    main: ['./src/main.ts'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'js/[name].js',
  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /server/,
      },
      {
        test: /\.(html|svelte)$/,
        exclude: /server/,
        use: {
          loader: 'svelte-loader-hot',
          options: {
            dev: true,
            // emitCss: true,
            preprocess: require('svelte-preprocess')({}),
            hotReload: true,
            hotOptions: {
              preserveLocalState: false,
              noPreserveStateKey: '@!hmr',
              noReload: false,
              optimistic: true,
              acceptAccessors: true,
              acceptNamedExports: true,
            },
          },
        },
      },
      {
        // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
        test: /node_modules\/svelte\/.*\.mjs$/,
        exclude: /server/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/,
        exclude: /server/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  resolve: {
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
    },
    extensions: ['.tsx', '.ts', '.mjs', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
    // fallback: {
    //   fs: false,
    //   tls: false,
    //   net: false,
    //   path: false,
    //   zlib: false,
    //   http: false,
    //   https: false,
    //   stream: false,
    //   crypto: false,
    // },
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        // commons: {
        //     chunks: "initial",
        //     minChunks: 2,
        //     maxInitialRequests: 5, // The default limit is too small to showcase the effect
        //     minSize: 0 // This is example is too small to create commons chunks
        // },
        vendor: {
          test: (module) => {
            if (module.resource && /^.*\.(css|scss|sass)$/.test(module.resource)) {
              return false;
            }
            return module.context && module.context.indexOf('node_modules') !== -1;
          },
          chunks: 'initial',
          name: 'vendor',
          priority: 10,
          enforce: true,
        },
      },
    },
    minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin({})],
  },
  // externals: [{ express: 'express' }],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin(),
    new MiniCssExtractPlugin(),
    new NodePolyfillPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        debug: true,
        cache: true,
      },
    }),
  ],
};
