// global
var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var browserReload = browserSync.reload;
var deploy  = require('gulp-gh-pages');
var options = require('minimist')(process.argv.slice(2));

// html
var jade = require('gulp-jade');
var htmlmin = require('gulp-minify-html');

// css
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var cssmin  = require('gulp-cssmin');

// js
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');

// imgs
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');

// opts
var opts = {
  del: { force: true },
  jade: { pretty: true },
  htmlmin: { comments: false },
  sass: {
    sourceMap: 'none',
    sourceComments: 'map'
  },
  browserSync: {
    // open: false,
    server: { baseDir: 'dist/' }
  }
};

// env
var inProd = options.prod;


// handle errors
  var handleError = function(err) {
    var taskErrorMessage = 'An error occurred';
    var errorMessage = err.toString();
    gutil.log(gutil.colors.red(taskErrorMessage));
    gutil.log(gutil.colors.red(errorMessage));
    this.emit('end');
  };

// html task
  gulp.task('html', function(){
    if(inProd)
      del('dist/*.html', opts.del);
    
    return gulp.src(['./src/jade/**/*.jade', '!./src/jade/partials/**'])
      .pipe(inProd ? jade() : jade(opts.jade))
      .on('error', handleError)
      .pipe(inProd ? htmlmin(opts.htmlmin) : gutil.noop())
      .pipe(gulp.dest('./dist/'))
      .pipe(inProd ? gutil.noop() : browserReload({ stream: true }));
  });

// css task
  gulp.task('css', function(){
    return gulp.src('./src/scss/*.scss')
      .pipe(inProd ? sass() : sass(opts.sass))
      .on('error', handleError)
      .pipe(prefix('last 1 version', '> 1%', 'ie 8', 'ie 7'))
      .on('error', handleError)
      .pipe(inProd ? cssmin() : gutil.noop())
      .pipe(gulp.dest('./dist/css/'))
      .pipe(inProd ? gutil.noop() : browserReload({ stream: true }));
  });

// js task
  gulp.task('js', function(){
    gulp.src('./src/js/**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(inProd ? streamify(uglify()) : gutil.noop())
      .pipe(gulp.dest('dist/js/'))
      .pipe(inProd ? gutil.noop() : browserReload({ stream: true, once: true}));
  });

// webfonts task
  gulp.task('fonts', function(){
    return gulp.src('./src/fonts/**')
      .pipe(gulp.dest('./dist/fonts/'))
  });

// imgs task
  gulp.task('imgs', function(){
    return gulp.src('src/imgs/**')
      .pipe(inProd ? imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngcrush()]
      }) : gutil.noop())
      .pipe(gulp.dest('dist/imgs/'));
  });

// watch task
  gulp.task('watch', function(){
    gulp.watch('src/js/**',    ['js']);
    gulp.watch('src/scss/**',  ['css']);
    gulp.watch('src/jade/**',  ['html']);
    gulp.watch('src/imgs/**',  ['imgs']);
    gulp.watch('src/fonts/**', ['fonts']);
  });

// serve task
  gulp.task('serve', function(){
    browserSync.init(opts.browserSync);
  });

// group tasks
  gulp.task('generate-files', [
    'prebuild',
    'html',
    'imgs',
    'fonts',
    'css',
    'js'
  ]);
  gulp.task('default', [
    'generate-files',
    'serve',
    'watch'
  ]);

// build tasks
  gulp.task('prebuild', function(){
    return del('dist/', opts.del);
  });
  gulp.task('deploy', function(){
    return gulp.src('./dist/**/*')
      .pipe(deploy());
  });
