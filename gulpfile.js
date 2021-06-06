const { task, src, dest, series, parallel, pipe, watch } = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var uglify     = require('gulp-uglify-es').default;
var browserify = require('browserify');
var vsource    = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');
var karma = require('karma');

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

task('coffee', function() {
  return src(coffees)
    .pipe(coffee({bare: true}))
    .pipe(dest('./cjs/'))
});

task('browserify', function () {
  return src('src/index.coffee', { read: false })
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
      .pipe(dest('.tmp/'))
});

task('coffee2js', function() {
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
    // .pipe(uglify())
    .pipe(dest('.tmp/'));
});

task('css', function () {
  return src(css)
    .pipe(concat(builds.css))
    .pipe(dest('.'));
});

task('core', function () {
  return src(core)
    .pipe(concat(builds.core))
    .pipe(dest('.'));
});

task('bundle', function () {
  return src(bundle)
    .pipe(concat(builds.bundle))
    .pipe(dest('.'));
});

task('uglify', function () {
  return src(products)
    .pipe(uglify())
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(dest('build'));
});

task('karma', function (done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    files: test,
    singleRun: true,
  }, function(err) {
      if (err > 0) {
        return done(new Error(`Karma exited with status code ${err}`));
      }
      done();
  }).start();
});

task('watch-karma', function(done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    files: test,
    singleRun: false,
  }, function(err) {
      if (err > 0) {
          return done(new Error(`Karma (watch) exited with status code ${err}`));
      }
  }).start();
  done();
});

// NEW: Add karma runner, triggered after every build
task('run-karma', function (done) {
    new karma.runner.run({
    configFile: __dirname + '/karma.conf.js',
    files: test,
    singleRun: true
  }, function(err) {
      if (err > 0) {
          return done(new Error(`Karma runner exited with status code ${err}`));
      }
      done();
    });
});

// Main tasks

task('build',
  series('coffee2js', parallel('css', 'core', 'bundle'), function(done) {
  done();
}));

task('default',
  series('build', 'uglify', function(done) {
  done();
}));

task('test',
  series('build', 'karma', function(done) {
  done();
}));

task('watch-build', function(done) {
  watch(coffees.concat(css), series('build', 'run-karma'));
  done();
});

task('watch',
  series('watch-karma', 'watch-build', function(done) {
  done();
}));
