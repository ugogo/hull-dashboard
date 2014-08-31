
var del = require('del'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  browserSync = require('browser-sync'),
  browserReload = browserSync.reload,
  deploy  = require('gulp-gh-pages'),

  // html
    jade = require('gulp-jade'),
    htmlmin = require('gulp-minify-html'),

  // css
    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer'),
    cssmin  = require('gulp-cssmin'),

  // js
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    streamify = require('gulp-streamify'),
    uglify = require('gulp-uglify'),

  // imgs
    imagemin = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush'),


  // opts
    opts = {
      del: {
        force: true
      },
      jade: {
        pretty: true
      },
      htmlmin: {
        comments: false
      },
      sass: {
        sourceMap: 'none',
        sourceComments: 'map'
      },
      browserify: {
        debug: true,
        insertGlobals: false
      },
      browserSync: {
        // open: false,
        server: {
          baseDir: 'dist/'
        }
      }
    };


// handle errors
  var handleError = function(err) {
    var taskErrorMessage = 'An error occurred';
    var errorMessage = err.toString();
    gutil.log(gutil.colors.red(taskErrorMessage));
    gutil.log(gutil.colors.red(errorMessage));
    this.emit('end');
  };

// html tasks
  gulp.task('dev-html', function(){
    return gulp.src(['./src/jade/**/*.jade', '!./src/jade/partials/**'])
      .pipe(jade(opts.jade))
      .on('error', handleError)
      .pipe(gulp.dest('./dist/'))
      .pipe(browserReload({ stream: true }));
  });
  gulp.task('build-html', function(){
    del('dist/*.html', opts.del);
    return gulp.src(['./src/jade/**/*.jade', '!./src/jade/partials/**'])
      .pipe(jade())
      .on('error', handleError)
      .pipe(htmlmin(opts.htmlmin))
      .on('error', handleError)
      .pipe(gulp.dest('./dist/'));
  });

// css tasks
  gulp.task('dev-css', function(){
    return gulp.src('./src/scss/*.scss')
      .pipe(sass(opts.sass))
      .on('error', handleError)
      .pipe(prefix('last 1 version', '> 1%', 'ie 8', 'ie 7'))
      .on('error', handleError)
      .pipe(gulp.dest('./dist/css/'))
      .pipe(browserReload({ stream: true }));
  });
  gulp.task('build-css', function(){
    return gulp.src('./src/scss/*.scss')
      .pipe(sass())
      .on('error', handleError)
      .pipe(prefix('last 1 version', '> 1%', 'ie 8', 'ie 7'))
      .on('error', handleError)
      .pipe(cssmin())
      .on('error', handleError)
      .pipe(gulp.dest('./dist/css/'));
  });

// js tasks
  gulp.task('dev-js', function(){
    gulp.src('./src/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));

    return browserify('./src/js/app.js', opts.browserify)
      .bundle()
      .on('error', handleError)
      .pipe(source('app.js'))
      .pipe(gulp.dest('dist/js/'))
      .pipe(browserReload({
        stream: true,
        once: true
      }));
  });
  gulp.task('build-js', function(){
    gulp.src('src/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));

    return browserify('./src/js/app.js')
      .bundle()
      .on('error', handleError)
      .pipe(source('app.js'))
      .pipe(streamify(uglify()))
      .pipe(gulp.dest('dist/js/'));
  });

// webfonts tasks
  gulp.task('dev-fonts', function(){
    return gulp.src('./src/fonts/**')
      .pipe(gulp.dest('./dist/fonts/'))
  });

// imgs tasks
  gulp.task('dev-imgs', function (){
    return gulp.src('src/imgs/**')
      .pipe(gulp.dest('dist/imgs/'));
  });
  gulp.task('build-imgs', function (){
    return gulp.src('src/imgs/**')
      .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngcrush()]
      }))
      .pipe(gulp.dest('dist/imgs/'));
  });

// local tasks
  gulp.task('dev-watch', function(){
    gulp.watch('src/js/**',    ['dev-js']);
    gulp.watch('src/scss/**',  ['dev-css']);
    gulp.watch('src/jade/**',  ['dev-html']);
    gulp.watch('src/imgs/**',  ['dev-imgs']);
    gulp.watch('src/fonts/**', ['dev-fonts']);
  });
  gulp.task('dev-serve', function(){
    browserSync.init(opts.browserSync);
  });
  gulp.task('dev-generate-files', [
    'build-clean',
    'dev-html',
    'dev-css',
    'dev-js',
    'dev-imgs',
    'dev-fonts'
  ]);
  gulp.task('default', [
    'dev-generate-files',
    'dev-serve',
    'dev-watch'
  ]);

// build tasks
  gulp.task('build-clean', function(){
    return del('dist/', opts.del);
  });
  gulp.task('deploy', function(){
    return gulp.src('./dist/**/*')
      .pipe(deploy());
  });
  gulp.task('build', [
    'build-clean',
    'build-html',
    'build-css',
    'build-js',
    'build-imgs'
  ]);
