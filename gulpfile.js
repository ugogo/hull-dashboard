
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

  // build

  , htmlmin = require('gulp-minify-html')
  , cssmin  = require('gulp-cssmin')
  , jsmin   = require('gulp-uglify')
  , deploy  = require('gulp-gh-pages')
  ;



// dev tasks

gulp.task('dev-html-clean', function(){
  return gulp.src('./dev/*.html', { read:false })
    .pipe(clean({force: true}))
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
    .pipe(connect.reload())
    ;
});

gulp.task('dev-css', function(){
  var opts = {
    style: 'expanded',
    sourceComments: 'map'
  };
  return gulp.src('./src/scss/*.scss')
    .pipe(plumber())
    .pipe(sass(opts))
    .pipe(gulp.dest('./dev/css/'))
    .pipe(connect.reload())
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
    .pipe(connect.reload())
    ;
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
    livereload: true,
    port: 8000
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
    .pipe(clean({force: true}))
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



// main tasks

gulp.task('dev-js', [
  'dev-js-browserify',
  'dev-jshint'
]);

gulp.task('dev-html', [
  'dev-html-clean',
  'dev-jade'
]);

gulp.task('default', [
  'dev-html',
  'dev-css',
  'dev-js',
  'dev-connect',
  'dev-watch'
]);

gulp.task('build', [
  'build-clean',
  'build-html',
  'build-css',
  'build-js',
  'build-deploy'
]);