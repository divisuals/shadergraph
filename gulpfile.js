var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var browserify = require('browserify');
var vsource    = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');
var watch = require('gulp-watch');
var KarmaServer = require('karma').Server;

var builds = {
  core:   'build/shadergraph-core.js',
  bundle: 'build/shadergraph.js',
  css:    'build/shadergraph.css',
};

var products = [
  builds.core,
  builds.bundle,
];

var vendor = [
];

var css = [
  'src/**/*.css',
];

var core = [
  '.tmp/index.js'
];

var coffees = [
  'src/**/*.coffee',
]

var bundle = vendor.concat(core);

var test = [
  'node_modules/three/build/three.js',
].concat(bundle).concat([
  'test/**/*.spec.coffee',
]);

gulp.task('browserify', function () {
  return gulp.src('src/index.coffee', { read: false })
      .pipe(browserify({
        debug: false,
        //detectGlobals: false,
        //bare: true,
        transform: ['coffeeify'],
        extensions: ['.coffee'],
      }))
      .pipe(rename({
        extname: ".js"
      }))
      .pipe(gulp.dest('.tmp/'))
});

gulp.task('coffee2js', function() {
// set up the browserify instance on a task basis
  var b = browserify({
    entries: 'src/index.coffee',
    extensions: ['.coffee'],
    read: false,
    debug: false,
    // bare: true,
    // defining transforms here will avoid crashing your stream
    transform: ['coffeeify']
  });
  return b.bundle()
    .pipe(vsource('index.js'))
    .pipe(buffer())
    .pipe(gulp.dest('.tmp/'));
});

gulp.task('css', function () {
  return gulp.src(css)
    .pipe(concat(builds.css))
    .pipe(gulp.dest('.'));
});

gulp.task('core', function () {
  return gulp.src(core)
    .pipe(concat(builds.core))
    .pipe(gulp.dest('.'));
});

gulp.task('bundle', function () {
  return gulp.src(bundle)
    .pipe(concat(builds.bundle))
    .pipe(gulp.dest('.'));
});

gulp.task('uglify', function () {
  return gulp.src(products)
    .pipe(uglify())
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('karma', function (done) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    files: test,
    singleRun: true,
  }, function(err) {
      if(err === 0){
        done();
      }
  }).start();
});

gulp.task('watch-karma', function() {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    files: test,
  }, function(err) {
      if(err === 0){
        done();
      }
  }).start();
});

gulp.task('watch-build-watch', function () {
  watch(coffees.concat(css), function () {
    return gulp.start('build');
  });
});

// Main tasks

gulp.task('build',
  gulp.series('coffee2js', gulp.parallel('css', 'core', 'bundle'), function(done) {
  done();
}));

gulp.task('default',
  gulp.series('build', 'uglify', function(done) {
  done();
}));

gulp.task('test',
  gulp.series('build', 'karma', function(done) {
  done();
}));

gulp.task('watch-build',
  gulp.series('build', 'watch-build-watch', function(done) {
  done();
}));

gulp.task('watch',
  gulp.series('watch-build', 'watch-karma', function(done) {
  done();
}));
