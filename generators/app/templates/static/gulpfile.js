var gulp = require('gulp');
var settings = require('./settings.json');
var crypto = require('crypto');

var password = (function(){
    var decipher = crypto.createDecipher('aes192', 'password');
    var encrypted = settings.password;
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
})();

var credentials = {
    username: settings.username,
    password: password
};

// Auto loads all package.json dependencies prefixed with 'gulp-'
require('matchdep').filterDev('gulp*').forEach(function(module){
    var module_name = module.replace(/^gulp-/, '').replace(/-/, '');
    global[module_name] = require( module );
});

gulp.task('default', ['compile:css', 'compile:js']);

gulp.task('watch', function(){
    gulp.watch('src/sass/**/*.scss', ['push:css']);
    gulp.watch('src/ts/**/*.ts', ['push:js']);
    gulp.watch('customCalendar/calendar.html', ['push:html']);
});

gulp.task('compile:sass', function(){
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([
            require('autoprefixer')({ browsers: ['last 2 versions']}),
            require('css-mqpacker')
        ]))
        .pipe(gulp.dest('./customCalendar/css'))
        .pipe(postcss([
            require('cssnano')
        ]))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('./customCalendar/css'))
});

gulp.task('push:css', ['compile:sass'], function(){
    return gulp.src('./customCalendar/css/*.{css,map}')
        .pipe(spsave({
            siteUrl: settings.siteUrl,
            folder: settings.directory + '/css'
        }, credentials))
});

gulp.task('compile:ts', function(){
    return gulp.src('./src/ts/**/*.ts')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('./customCalendar/js'))
});

gulp.task('push:js', ['compile:ts'], function(){
    return gulp.src('./customCalendar/js/*.{js,map}')
        .pipe(spsave({
            siteUrl: settings.siteUrl,
            folder: settings.directory + '/js'
        }, credentials))
});

gulp.task('push:bower_components', function(){
    return gulp.src('./customCalendar/bower_components/**/*.{js,json}')
        .pipe(spsave({
            siteUrl: settings.siteUrl,
            folder: settings.directory + '/bower_components',
            flatten: false
        }, credentials))
});

gulp.task('push:html', function(){
    return gulp.src('./customCalendar/calendar.html')
        .pipe(spsave({
            siteUrl: settings.siteUrl,
            folder: settings.directory
        }, credentials))
});

gulp.task('push:images', function(){
    return gulp.src('./customCalendar/images/*.{png,jpg,gif}')
        .pipe(spsave({
            siteUrl: settings.siteUrl,
            folder: settings.directory + '/images'
        }, credentials))
});

gulp.task('push:all', ['push:js', 'push:bower_components', 'push:css', 'push:images', 'push:html'], function(){
    console.log('Successfully pushed all files...');
});
