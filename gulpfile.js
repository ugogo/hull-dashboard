
var gulp    = require('gulp')
  , clean   = require('gulp-clean')
  , plumber = require('gulp-plumber') 

  // dev

  , jade   = require('gulp-jade')
  , sass   = require('gulp-sass')
  , prefix = require('gulp-autoprefixer')
  , jshint = require('gulp-jshint')
  , stylish = require('jshint-stylish')
  , browserify = require('gulp-browserify')
  ;



// dev tasks

gulp.task('dev-html', function() {

  var opts = { pretty: true }

  // delete old html files

  gulp.src('./dev/*.html')
    .pipe(clean({force: true}))
    ;

  // generate news

  gulp.src('./src/*.jade')
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

  gulp.src('./src/scss/*.scss')
    .pipe(plumber())
    .pipe(sass(sass_opts))
    .pipe(gulp.dest('./dev/css/'))
    ;
});

gulp.task('dev-js', function(){

  var opts = {
    insertGlobals: false,
    debug: true
  };

  // browserify

  gulp.src('./src/js/*.js', {read: false})
    .pipe(browserify(opts))
    .pipe(gulp.dest('./dev/js/'))
    ;

  // jshint

  gulp.src('./src/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"))
    ;
});


// tasks

gulp.task( 'default', ['dev-html'] );
