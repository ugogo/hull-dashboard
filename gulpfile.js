
var gulp    = require('gulp')
  , clean   = require('gulp-clean')
  , plumber = require('gulp-plumber') 

  // dev

  , jade   = require('gulp-jade')
  , sass   = require('gulp-sass')
  , prefix = require('gulp-autoprefixer')
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


// tasks

gulp.task( 'default', ['dev-html'] );
