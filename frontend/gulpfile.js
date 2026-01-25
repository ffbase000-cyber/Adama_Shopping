const gulp = require('gulp');
const terser = require('gulp-terser');
const csso = require('gulp-csso');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-replace');

// API URL comes from environment variable (Netlify)
// Local fallback for development
const API_URL = process.env.API_URL || 'http://localhost:3000';

/**
 * Process JavaScript:
 * - Replace API_BASE_URL placeholder
 * - Minify JS
 * - Output to dist/scripts
 */
gulp.task('js', () => {
  return gulp.src('scripts/**/*.js')
    .pipe(replace('API_BASE_URL', `"${API_URL}"`))
    .pipe(terser())
    .pipe(gulp.dest('dist/script'));
});

/**
 * Process CSS:
 * - Minify CSS
 * - Output to dist/styles
 */
gulp.task('css', () => {
  return gulp.src('styles/**/*.css')
    .pipe(csso())
    .pipe(gulp.dest('dist/styles'));
});

/**
 * Process HTML:
 * - Minify HTML
 * - Output to dist/
 */
gulp.task('html', () => {
  return gulp.src('*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest('dist'));
});

/**
 * Default task:
 * Run all tasks in parallel
 */
gulp.task('default', gulp.parallel('js', 'css', 'html'));
