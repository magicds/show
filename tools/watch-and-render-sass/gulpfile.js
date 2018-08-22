const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const path = require('path');
const fs = require('fs');

const wtachFolders = [
    // 全部scss文件
    'fui/**/*.scss',
    // 全部scss文件
    'pages/**/*.scss',
    // 排除 _开头的
    '!**/_*.scss',
    // 排除 node_modules
    '!node_modules/**'
];

/**
 * 编译单个文件
 * @param {String} filePath 文件路径
 */
function renderFile(filePath) {
    if (fs.existsSync(filePath)) {
        return gulp.src(filePath)
            .pipe(sass({
                outputStyle: 'compressed'
            }).on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: ["> 0.005%", "ie >= 8"],
                cascade: true
            }))
            .pipe(gulp.dest(path.dirname(filePath)));
    }
}

gulp.task('default', function () {
    return gulp.watch(wtachFolders, {
        events: ['add', 'change'],
        read: false
    }, function (e) {
        console.log('[file change]' + e.path);
        return renderFile(e.path);
    });
});