'use strict'
require('dotenv').config({silent: true});

/*

the only important tasks are:

 - default (dev watcher)
 - dist (production build)
 - dev (development build)

*/

const argv          = require('yargs').argv
const babel         = require('gulp-babel')
const concat        = require('gulp-concat')
const del           = require('del')
const fs            = require('fs')
const gulp          = require('gulp')
const gutil         = require('gulp-util')
const hash          = require('gulp-hash')
const notify        = require('gulp-notify')
const mustache      = require('gulp-mustache')
const plumber       = require('gulp-plumber')
const rename        = require('gulp-rename')
const runSequence   = require('run-sequence')
const uglify        = require('gulp-uglify')
const watch         = require('gulp-watch')
const webpack       = require('webpack')
const webpackStream = require('webpack-stream')
const WebpackServer = require('webpack-dev-server')

const paths = {
    browser_js: 'frontend/**/*.+(js|jsx)',
}

const babelrc = fs.readFileSync('./.babelrc');
let babelConfig = {};
babelConfig = JSON.parse(babelrc);

const hashOptions = {
    algorithm: 'md5',
    hashLength: 10,
    template: '<%= name %>.<%= hash %><%= ext %>'
};

const host = (argv.host || process.env.DEV_HOST) || 'localhost'
const port = (argv.port || process.env.DEV_PORT) || 3030

const productionLoaders = {
    loaders: [
        {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: babelConfig
        },
    ]
}

const devLoaders = {
    loaders: [
        {
            test: /\.jsx?$/,
            loaders: [
                'babel-loader?' + JSON.stringify(babelConfig)
            ],
            exclude: /node_modules/,
        },
    ]
}

const webpackConfig = {
    cache: true,
    context: __dirname + '/frontend',
    entry: {
        'DboxOverlay': './DboxOverlay.jsx',
        'DboxPanel': './DboxPanel.jsx'
    },
    output: {
        path: __dirname + '/dist/frontend',
        filename: '[name].js',
        publicPath: 'http://'+host+':'+port+'/dist/frontend/'
    },
    plugins: [],
    resolve: {
        root: [
            __dirname + '/dist/frontend',
        ],
        extensions: ['', '.js', '.jsx'],
    },
}

//
// this probably doesn't need to be ran.
//
gulp.task('clean', cb => {
    del(['dist'], cb)
})

gulp.task('js:webpack', cb => {

    webpackConfig.module = productionLoaders
    webpackConfig.plugins.push(
        new webpack.DefinePlugin({
            __CLIENT__: true,
            __SERVER__: false,
            __DEVELOPMENT__: false,
            __DEVTOOLS__: false,  // <-------- DISABLE redux-devtools HERE
            'process.env': {
                'NODE_ENV': JSON.stringify('production'),
                'CSRF_KEY': JSON.stringify(process.env.CSRF_KEY),
            }
        })
    )

    return gulp.src(paths.browser_js)
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest('dist/frontend'))
})

gulp.task('js:minify', cb => {
    return gulp.src('dist/frontend/*.js')
            .pipe(uglify())
            //.pipe(hash(hashOptions))
            .pipe(gulp.dest("dist/frontend"))
})

gulp.task('js:dist', cb => {
    runSequence('js:webpack', 'js:minify', cb)
})

gulp.task('index:build', cb => {
    runSequence(['index:build:overlay', 'index:build:panel'], cb)
})

gulp.task('index:build:overlay', cb => {
    return gulp.src('./frontend/overlay.html.tmpl')
        .pipe(mustache({
            dev: process.env.NODE_ENV !== 'production',
            devserverHost: host,
            devserverPort: port,
        }))
        .pipe(rename('overlay.html'))
        .pipe(gulp.dest('dist/frontend'))
})

gulp.task('index:build:panel', cb => {
    return gulp.src('./frontend/panel.html.tmpl')
        .pipe(mustache({
            dev: process.env.NODE_ENV !== 'production',
            devserverHost: host,
            devserverPort: port,
        }))
        .pipe(rename('panel.html'))
        .pipe(gulp.dest('dist/frontend'))
})

const devCompiler = webpack(webpackConfig);

gulp.task("webpack-dev-server", function(cb) {
    // modify some webpack config options
    webpackConfig.module = devLoaders;
    webpackConfig.devtool = 'eval',
    webpackConfig.debug = true;

    for (var i in webpackConfig.entry) {
        var originalEntry = webpackConfig.entry[i];
        webpackConfig.entry[i] = [
            'webpack-dev-server/client?http://'+host+':'+port,
            'webpack/hot/only-dev-server',
            originalEntry
        ];
    }

    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    webpackConfig.plugins.push(new webpack.NoErrorsPlugin());

    webpackConfig.plugins.push(
        new webpack.DefinePlugin({
            __CLIENT__: true,
            __SERVER__: false,
            __DEVELOPMENT__: true,
            __DEVTOOLS__: true,
            'process.env': {
                'CSRF_KEY': JSON.stringify(process.env.CSRF_KEY),
            },
        })
    );

    // Start a webpack-dev-server
    new WebpackServer(webpack(webpackConfig), {
        contentBase: "dist/frontend",
        publicPath: 'http://'+host+':'+port+'/dist/frontend',
        hot: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        stats: {
          colors: true,
          progress: true
        }
    }).listen(port, host, function(err) {
        if(err) throw new gutil.PluginError("webpack-dev-server", err);
        gutil.log("[webpack-dev-server]", 'http://'+host+':'+port+'/webpack-dev-server/index.html');
    });

    var gracefulShutdown = function() {
        process.exit()
    }

    // listen for INT signal e.g. Ctrl-C
    process.on('SIGINT', gracefulShutdown);
});

gulp.task('dist', ['js:dist', 'index:build'])
gulp.task('watch', ['webpack-dev-server'])
gulp.task('dev', ['index:build'])
gulp.task('default', ['watch', 'dev'])