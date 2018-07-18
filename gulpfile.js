var gulp = require('gulp'),
    concat = require('gulp-concat'), //- 多个文件合并为一个；  
    cleanCSS = require('gulp-clean-css'), //- 压缩CSS为一行；  
    uglify = require('gulp-uglify'), //压缩js  
    imageMin = require('gulp-imagemin'), //压缩图片  
    pngquant = require('imagemin-pngquant'), // 深度压缩  
    htmlMin = require('gulp-htmlmin'), //压缩html  
    changed = require('gulp-changed'), //检查改变状态  
    less = require('gulp-less'), //压缩合并less  
    del = require('del'),
    rename = require('gulp-rename');
browserSync = require("browser-sync").create(), //浏览器实时刷新 
    babel = require("gulp-babel"),
    watch = require("gulp-watch"),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'), //steam流
    buffer = require('vinyl-buffer'), //buffer流
    glob = require('glob'); //遍历文件

//删除dist下的所有文件  
gulp.task('delete', function(cb) {
    return del(['dist/*', '!dist/images'], cb);
})

//压缩html  
gulp.task('html', function() {
    var options = {
        removeComments: true, //清除HTML注释  
        collapseWhitespace: true, //压缩HTML  
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"  
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"  
        minifyJS: true, //压缩页面JS  
        minifyCSS: true //压缩页面CSS  
    };
    gulp.src('src/*.html')
        .pipe(changed('dist', { hasChanged: changed.compareSha1Digest }))
        .pipe(htmlMin(options))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({ stream: true }));
});

//实时编译less  
gulp.task('less', function() {
    gulp.src(['./src/less/*.less']) //多个文件以数组形式传入  
        .pipe(changed('dist/css', { hasChanged: changed.compareSha1Digest }))
        .pipe(less()) //编译less文件  
        .pipe(cleanCSS()) //压缩新生成的css  
        .pipe(gulp.dest('dist/css')) //将会在css下生成main.css  
        .pipe(browserSync.reload({ stream: true }));
});

// 压缩图片  
gulp.task('images', function() {
    gulp.src('./src/images/*.*')
        .pipe(changed('dist/images', { hasChanged: changed.compareSha1Digest }))
        .pipe(imageMin({
            progressive: true, // 无损压缩JPG图片  
            svgoPlugins: [{ removeViewBox: false }], // 不移除svg的viewbox属性  
            use: [pngquant()] // 使用pngquant插件进行深度压缩  
        }))
        .pipe(gulp.dest('dist/images'))
        .pipe(browserSync.reload({ stream: true }));
});

//browserify加载包到本地，babel转换到es5
gulp.task("script", function(cb) {
    glob('./src/js/*.js', function(err, files) {
        var b = browserify();
        files.forEach(function(file) {
            b.add(file);
        });
        //babel转换
        b.transform("babelify", {
                "presets": [
                    "es2015",
                    "stage-0"
                ],
                "plugins": [
                    [
                        "transform-runtime",
                        {
                            "helpers": false,
                            "polyfill": false,
                            "regenerator": true,
                            "moduleName": "babel-runtime"
                        }
                    ]
                ]
            })
            .bundle()
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest('./dist/js'))
            .pipe(browserSync.reload({ stream: true }));

        cb();
    })

});


//启动热更新  
gulp.task('serve', ['delete'], function() {
    gulp.start('script', 'less', 'html');
    browserSync.init({
        port: 2018,
        server: {
            baseDir: ['dist']
        }
    });
    gulp.watch('src/js/*.js', ['script']); //监控文件变化，自动更新  
    gulp.watch('src/less/*.less', ['less']);
    gulp.watch('src/*.html', ['html']);
    gulp.watch('src/images/*.*', ['images']);
});

gulp.task('default', ['serve']);