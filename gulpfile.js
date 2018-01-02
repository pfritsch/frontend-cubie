// Requirements
// -----------------------------------------------------------------------------
const gulp = require('gulp')

// Utils
const rename = require('gulp-rename')
const header = require('gulp-header')
const inject = require('gulp-inject')
const concat = require('gulp-concat')
const clean = require('gulp-clean')

// Template
const minifyHTML = require('gulp-minify-html')
const svgstore = require('gulp-svgstore')
const handlebars = require('gulp-hb')

// Images
const imagemin = require('gulp-imagemin')
const pngquant = require('imagemin-pngquant')

// Scripts
const jshint = require('gulp-jshint')
const stylish = require('jshint-stylish')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const es2015 = require('babel-preset-es2015')

// Styles
const sass = require('gulp-sass')
const plumber = require('gulp-plumber')
const sourcemaps = require('gulp-sourcemaps')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const styledown = require('gulp-styledown')

// Server
const browserSync = require('browser-sync')

// SEO
const sitemap = require('gulp-sitemap')

// Settings
// -----------------------------------------------------------------------------
var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('')

const src = './src/'
const dist = './app/'
const siteUrl = '<%= package.url %>'
const packages = require('./package.json')
const reload = browserSync.reload

// Gulp Tasks
// -----------------------------------------------------------------------------

// COPY
// Copy extra files like .htaccess, robots.txt
gulp.task('copy', function () {
  return gulp.src(['./.htaccess', './robots.txt'])
  .pipe(gulp.dest(dist))
})

// Copy fonts
gulp.task('fonts', function () {
  return gulp.src(src + 'assets/fonts/*')
    .pipe(gulp.dest(dist + 'assets/fonts/'))
})

// Copy docs
gulp.task('docs', function () {
  return gulp.src(src + 'assets/*')
    .pipe(gulp.dest(dist + 'assets/'))
})

// TEMPLATE
// Bower css and scripts inject +  SVG Sprite inject
gulp.task('template', function () {
  var svgs = gulp
    .src(src + 'assets/icons/*.svg')
    .pipe(imagemin({
      svgoPlugins: [{
        removeViewBox: false
      }]
    }))
    .pipe(rename({prefix: 'icon-'}))
    .pipe(svgstore({ inlineSvg: true }))
  function fileContents (filePath, file) {
    return file.contents.toString()
  }
  return gulp.src(src + '*.hbs')
    .pipe(handlebars()
      .partials(src + 'partials/**/*.hbs')
      .data(src + 'assets/data/**/*.{js,json}')
    )
    .pipe(rename({extname: '.html'}))
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(minifyHTML({
      conditionals: true,
      spare: true
    }))
    .pipe(gulp.dest(dist))
})

gulp.task('template-watch', ['template'], reload)

// IMAGES
// Optimization
gulp.task('images', function () {
  return gulp.src(src + 'assets/images/*')
    .pipe(gulp.dest(dist + 'assets/images/'))
    .pipe(reload({
      stream: true
    }))
})

gulp.task('svg-sprite', function () {
  return gulp
    .src(src + 'assets/icons/*.svg')
    .pipe(svgstore())
    .pipe(gulp.dest(dist + 'assets'))
})

// SCRIPTS
// JSHint, Uglify
gulp.task('scripts', function () {
  return gulp.src([src + 'scripts/*.js'])
    .pipe(babel({
      babelrc: false,
      presets: [es2015]
    }))
    .pipe(concat('main.min.js'))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(uglify())
    .pipe(gulp.dest(dist + 'scripts'))
    .pipe(reload({
      stream: true
    }))
})

// Vendors components main scripts files
gulp.task('vendors', function () {
  var vendorsJS = [''] // List the NPM components here
  return gulp.src(vendorsJS)
    .pipe(concat('vendors.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dist + 'scripts'))
})

// STYLES
// LibSass, Minified
gulp.task('styles', function () {
  var plugins = [
    autoprefixer({browsers: ['last 1 version']}),
    cssnano()
  ];
  return gulp.src(src + 'styles/{,*/}*.{scss,sass}')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: ['node_modules/normalize.css', 'node_modules/breakpoint-sass/stylesheets'],
      errLogToConsole: true
    }))
    .pipe(postcss(plugins))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(header(banner, {
      package: packages
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dist + 'styles'))
    .pipe(reload({
      stream: true
    }))
})

// Styleguide
// https://github.com/styledown/styledown
gulp.task('styleguide:assets', function () {
  return gulp.src([src + 'styleguide/styledown.css', src + 'styleguide/styledown.js'])
  .pipe(gulp.dest(dist + 'styleguide'))
})
gulp.task('styleguide:generate', function () {
  return gulp.src([src + 'styles/{,*/}*.scss', src + 'styles/{,*/}*.md'])
  .pipe(styledown({
    config: src + 'styleguide/config.md',
    filename: 'index.html'
  }))
  .pipe(gulp.dest(dist + 'styleguide/'))
})
gulp.task('styleguide:icons', ['styleguide:generate'], function () {
  var svgs = gulp
    .src(src + 'assets/icons/*.svg')
    .pipe(imagemin({
      svgoPlugins: [{
        removeViewBox: false
      }]
    }))
    .pipe(rename({prefix: 'icon-'}))
    .pipe(svgstore({ inlineSvg: true }))
  function fileContents (filePath, file) {
    return file.contents.toString()
  }
  return gulp.src(dist + 'styleguide/index.html')
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(gulp.dest(dist + 'styleguide/'))
})
gulp.task('styleguide', ['styleguide:assets', 'styleguide:generate', 'styleguide:icons'], reload)

// SEO
// Generate a Sitemap
gulp.task('sitemap', function () {
  return gulp.src(dist + '/*.html')
    .pipe(sitemap({
      siteUrl: siteUrl
    }))
    .pipe(gulp.dest(dist))
})

// CLEAN
// Generate a Sitemap
gulp.task('clean', function () {
  return gulp.src(dist)
    .pipe(clean())
})

// BUILD
gulp.task('build', ['copy', 'fonts', 'template', 'images', 'svg-sprite', 'vendors', 'scripts', 'styles', 'styleguide'], reload)

// SERVER
// Browser Sync (wait build task to be done)
gulp.task('serve', ['build'], function () {
  browserSync({
    notify: false,
    server: {
      baseDir: dist,
      routes: { '/bower_components': 'bower_components' }
    }
  })
  gulp.watch(src + '**/*.{html,hbs,json,svg}', ['template-watch', 'copy'])
  gulp.watch(src + 'scripts/*.js', ['scripts'])
  gulp.watch(src + 'assets/images/*', ['images', 'svg-sprite'])
  gulp.watch(src + 'styles/{,*/}*.{scss,sass}', ['styles', 'styleguide'])
  gulp.watch(src + '**/*.md', ['styleguide'])
})

// Gulp Default Task
// -----------------------------------------------------------------------------
// Having watch within the task ensures that 'sass' has already ran before watching
gulp.task('default', ['build', 'sitemap', 'serve'])
