var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var rename = require("gulp-rename");
var server = require("browser-sync").create();
var del = require("del");

gulp.task("clean", () => {
    return del("build");
});

gulp.task("copy", () => {
    return gulp
        .src([
            "source/fonts/**/*.{woff,woff2,ttf}",
            "source/img/**",
            "source/js/**"
        ], {
        base: "source" //учитывает структуру каталогов внутри каталога source
        })
        .pipe(gulp.dest("build"));
});   


gulp.task("style", (done) => {
    gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
        autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream())
    done();
});


gulp.task("sprite", (done) => {
    return gulp
        .src("source/img/icon-*.svg")
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("build/img"))
});


gulp.task("html", () => {
    return gulp
        .src("source/*.html")
        .pipe(posthtml([
            include()
        ]))
        .pipe(gulp.dest("build"));
});


gulp.task("build", gulp.series("clean", "copy", "style", "sprite", "html"));


gulp.task("serve", function() {
    server.init({
        server: "build"
    });
    server.watch("source/less/**/*.less", gulp.series("style", server.reload));
    server.watch("source/*.html", gulp.series("html", server.reload))
});


///////////


gulp.task("images", () => {
    return gulp
        .src("source/img/**/*.{png,jpg,svg}")
        .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest("source/img"));
});


gulp.task("webp", function () {
    return gulp
        .src("source/img/**/*.{png,jpg}")
        .pipe(webp({quality: 90}))
        .pipe(gulp.dest("source/img"));
});