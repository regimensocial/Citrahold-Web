const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');

gulp.task('minify-html', () => {
    return gulp.src('static/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify-js', () => {
    return gulp.src('static/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('minify-css', () => {
    return gulp.src('static/styling/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest('dist/styling'));
});

gulp.task('default', gulp.parallel('minify-html', 'minify-js', 'minify-css'));
