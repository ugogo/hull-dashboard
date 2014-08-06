
var gulp    = require('gulp')
  , plumber = require('gulp-plumber')
  , del      = require('del')

  // dev

  , jade        = require('gulp-jade')
  , sass        = require('gulp-sass')
  , gutil       = require('gulp-util')
  , prefix      = require('gulp-autoprefixer')
  , source      = require('vinyl-source-stream')
  , jshint      = require('gulp-jshint')
  , stylish     = require('jshint-stylish')
  , imagemin    = require('gulp-imagemin')
  , pngcrush    = require('imagemin-pngcrush')
  , browserify  = require('browserify')
  , browserSync = require('browser-sync')
  , browserReload = browserSync.reload


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
  var opts = {
    force: true
  };
  return del('dev/*.html', opts);
});

gulp.task('dev-jade', function(){
  var opts = {
    pretty: true
  };
  return gulp.src(['./src/jade/**/*.jade', '!./src/jade/partials/**'])
    .pipe(plumber())
    .pipe(jade(opts))
    .pipe(gulp.dest('./dev/'))
    .pipe(browserReload({ stream: true }))
    ;
});

gulp.task('dev-css-autoprefix', ['dev-css-sass'], function(){
  return gulp.src('./dev/css/*.css')
    .pipe(plumber())
    .pipe(prefix('last 1 version', '> 1%', 'ie 8', 'ie 7'))
    .pipe(gulp.dest('./dev/css/'))
    .pipe(browserReload({ stream: true }))
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
  return browserify('./src/js/app.js')
    .bundle(opts)
    .on('error', handleError)
    .pipe(source('app.js'))
    .pipe(gulp.dest('./dev/js/'))
    .pipe(browserReload({
      stream: true,
      once: true
    }))
    ;
});

gulp.task('dev-js-jshint', function(){
  return gulp.src('./src/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    ;
});

gulp.task('dev-images', function (){
  return gulp.src(['./src/images/**', '!./src/images/HD/**', '!./src/images/HD'])
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngcrush()]
    }))
    .pipe(gulp.dest('./dev/images/'))
    ;
});

gulp.task('dev-serve', function(){
  var opts = {
    // open: false
    server: {
      baseDir: './dev'
    }
  };
  browserSync.init(opts);
});

gulp.task('dev-watch', function(){
  gulp.watch('src/js/**',     ['dev-js']);
  gulp.watch('src/scss/**',   ['dev-css']);
  gulp.watch('src/jade/**',   ['dev-jade']);
  gulp.watch('src/images/**', ['dev-images']);
});



// build task

gulp.task('build-clean', function(){
  var opts = {
    force: true
  };
  return del('build/', opts);
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

gulp.task('build-images', function(){
  return gulp.src('./dev/images/**')
    .pipe(gulp.dest('./dist/images/'))
    ;
});



// deploy

gulp.task('deploy', function(){
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
  'dev-html-clean',
  'dev-js',
  'dev-css',
  'dev-html',
  'dev-images'
]);

gulp.task('default', [
  'dev-generate-files',
  'dev-serve',
  'dev-watch'
]);

gulp.task('build', [
  'build-clean',
  'build-images',
  'build-html',
  'build-css',
  'build-js'
]);
