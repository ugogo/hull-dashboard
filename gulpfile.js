
var gulp    = require('gulp')
  , clean   = require('gulp-clean')
  , plumber = require('gulp-plumber')

  // dev

  , jade        = require('gulp-jade')
  , sass        = require('gulp-sass')
  , gutil       = require('gulp-util')
  , prefix      = require('gulp-autoprefixer')
  , source      = require('vinyl-source-stream')
  , jshint      = require('gulp-jshint')
  , stylish     = require('jshint-stylish')
  , browserify  = require('browserify')
  , browserSync = require('browser-sync')

  // build

  , htmlmin = require('gulp-minify-html')
  , cssmin  = require('gulp-cssmin')
  , jsmin   = require('gulp-uglify')
  , deploy  = require('gulp-gh-pages')
  ;



// handle errors

function handleError(err) {
  var taskErrorMessage = 'An error occurred';
  var errorMessage = err.toString();
  gutil.log(gutil.colors.red(taskErrorMessage));
  gutil.log(gutil.colors.red(errorMessage));
  this.emit('end');
};



// dev tasks

gulp.task('dev-html-clean', function(){
  return gulp.src('./dev/*.html', { read:false })
    .pipe(clean({ force: true }))
    ;
});

gulp.task('dev-jade', function(){
  var opts = {
    pretty: true
  };
  return gulp.src('./src/*.jade')
    .pipe(plumber())
    .pipe(jade(opts))
    .pipe(gulp.dest('./dev/'))
    ;
});

gulp.task('dev-css-autoprefix', ['dev-css-sass'], function(){
  return gulp.src('./dev/css/*.css')
    .pipe(plumber())
    .pipe(prefix('last 1 version', '> 1%', 'ie 8', 'ie 7'))
    .pipe(gulp.dest('./dev/css/'))
    ;
});

gulp.task('dev-css-sass', function(){
  var opts = {
    sourceMap: 'none',
    sourceComments: 'map'
  };
  return gulp.src('./src/scss/*.scss')
    .pipe(sass())
    .on('error', handleError)
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
    .on('error', handleError)
    .pipe(source('app.js'))
    .pipe(gulp.dest('./dev/js/'))
    ;
});

gulp.task('dev-js-jshint', function(){
  return gulp.src('./src/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    ;
});

gulp.task('dev-serve', function() {
  browserSync.init('dev/**', {
    // open: false
    server: {
      baseDir: './dev',
      proxy: 'localhost:3000'
    }
  });
});

gulp.task('dev-watch', function(){
  gulp.watch('src/**/*.js',   ['dev-js']);
  gulp.watch('src/**/*.jade', ['dev-jade']);
  gulp.watch('src/**/*.scss', ['dev-css']);
});



// build task

gulp.task('build-clean', function(){
  return gulp.src('./dist/**/*', { read:false })
    .pipe(clean({ force: true }))
    ;
});

gulp.task('build-html', function(){
  var opts = {
    comments: false
  };
  return gulp.src('./dev/*.html')
    .pipe(htmlmin(opts))
    .pipe(gulp.dest('./dist/'))
    ;
});

gulp.task('build-css', function(){
  return gulp.src('./dev/css/*.css')
    .pipe(cssmin())
    .pipe(gulp.dest('./dist/css/'))
    ;
});

gulp.task('build-js', function(){
  return gulp.src('./dev/js/**/*.js')
    .pipe(jsmin())
    .pipe(gulp.dest('./dist/js/'))
    ;
});

gulp.task('build-deploy', function(){
  return gulp.src('./dist/**/*')
    .pipe(deploy())
    ;
});



// group tasks

gulp.task('dev-html', [
  'dev-html-clean',
  'dev-jade'
]);

gulp.task('dev-css', [
  'dev-css-autoprefix'
]);

gulp.task('dev-js', [
  'dev-js-browserify',
  'dev-js-jshint'
]);

gulp.task('dev-generate-files', [
  'dev-html',
  'dev-css',
  'dev-js'
]);

gulp.task('default', [
  'dev-generate-files',
  'dev-serve',
  'dev-watch'
]);

gulp.task('build', [
  'dev-generate-files',
  'build-clean',
  'build-html',
  'build-css',
  'build-js',
  'build-deploy'
]);
