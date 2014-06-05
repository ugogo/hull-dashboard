
var gulp    = require('gulp')
  , clean   = require('gulp-clean')
  , plumber = require('gulp-plumber') 

  // dev

  , jade = require('gulp-jade')

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



// tasks

gulp.task( 'default', ['dev-html'] );
