
var gulp    = require('gulp')
  , clean   = require('gulp-clean')
  , plumber = require('gulp-plumber')

  // dev

  , jade       = require('gulp-jade')
  , sass       = require('gulp-sass')
  , prefix     = require('gulp-autoprefixer')
  , source     = require('vinyl-source-stream')
  , jshint     = require('gulp-jshint')
  , connect    = require('gulp-connect')
  , stylish    = require('jshint-stylish')
  , browserify = require('browserify')
  ;



// dev tasks

gulp.task('dev-html-clean', function() {

  return gulp.src('./dev/*.html', { read:false })
    .pipe(clean({force: true}))
    ;
});

gulp.task('dev-jade', function() {

  var opts = { pretty: true }

  return gulp.src('./src/*.jade')
    .pipe(plumber())
    .pipe(jade(opts))
    .pipe(gulp.dest('./dev/'))
    ;
});

gulp.task('dev-css', function() {

  var sass_opts = {
    style: 'expanded',
    sourceComments: 'map'
  };

  // scss generation

  return gulp.src('./src/scss/*.scss')
    .pipe(plumber())
    .pipe(sass(sass_opts))
    .pipe(gulp.dest('./dev/css/'))
    ;
});

gulp.task('dev-js-browserify', function(){

  var opts = {
    insertGlobals: false,
    debug: true
  };

  return browserify('./src/js/app')
    .bundle(opts)
    .pipe(source('app.js'))
    .pipe(gulp.dest('./dev/js/'))
});

gulp.task('dev-jshint', function(){
  return gulp.src('./src/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    ;
});

gulp.task('dev-connect', function(){
  connect.server({
    root: 'dev',
    port: 8000
  });
});

gulp.task('dev-watch', function(){
  gulp.watch('src/**/*.js',   ['dev-js']);
  gulp.watch('src/**/*.jade', ['dev-jade']);
  gulp.watch('src/**/*.scss', ['dev-css']);
});



// main tasks

gulp.task('dev-js',   ['dev-js-browserify', 'dev-jshint']);
gulp.task('dev-html', ['dev-html-clean', 'dev-jade']);

gulp.task('default', ['dev-html', 'dev-css', 'dev-js', 'dev-connect', 'dev-watch']);
