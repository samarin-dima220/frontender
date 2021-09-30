const {src,dest,series,parallel,watch, registry} = require('gulp')
const gulp = require('gulp');
const gp = require('gulp-load-plugins')();
const fileinclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify-es').default;
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const  gcmq = require('gulp-group-css-media-queries');
const del = require('del');
const fs = require('fs');

function server() {
	browserSync.init({ 
		server: { baseDir: 'dist/' }, 
		notify: false, 
		online: true 
	})
}

function html() {
 return src('src/assets/html/*.html')
 .pipe(gp.plumber({
  errorHandler : function(err) {
      gp.notify.onError({
          title:    "HTML Error",
          message:  "Error: <%= error.message %>"
      })(err);
      this.emit('end');
  }
}))
.pipe(fileinclude({
  prefix: '@@'
}))
.pipe(dest('dist/'))
.pipe(browserSync.reload({stream:true}));
}

function styles() {
  return src('src/assets/scss/styles.scss')
  .pipe(gp.plumber({
    errorHandler : function(err) {
        gp.notify.onError({
            title:    "HTML Error",
            message:  "Error: <%= error.message %>"
        })(err);
        this.emit('end');
    }
  }))
  .pipe(gp.sourcemaps.init())
  .pipe(sass({
    includePaths: './node_modules/'
}))
.pipe(gcmq())
.pipe(gp.autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
.pipe(gp.csso())
.pipe(gp.rename({suffix: ".min"}))
.pipe(gp.sourcemaps.write('.'))
.pipe(dest('dist/assets/css'))
.pipe(browserSync.reload({stream:true}));
}
function scripts() {
  return src('src/assets/js/*.js')
  .pipe(gp.plumber({
    errorHandler : function(err) {
        gp.notify.onError({
            title:    "HTML Error",
            message:  "Error: <%= error.message %>"
        })(err);
        this.emit('end');
    }
  }))
  .pipe(gp.sourcemaps.init())
  .pipe(gp.rigger())
  .pipe(uglify())
  .pipe(gp.rename({suffix: ".min"}))
  .pipe(gp.sourcemaps.write('.'))
  .pipe(dest('dist/assets/js'))
  .pipe(browserSync.reload({stream:true}));
}
function images() {
  return src('src/assets/images/**/*.{jpg,jpeg,png,gif,ico,svg}')
  .pipe(gp.cache(gp.image({
    pngquant: true,
    optipng: false,
    zopflipng: true,
    jpegRecompress: false,
    mozjpeg: true,
    gifsicle: true,
    svgo: true,
    concurrent: 10,
    quiet: true 
  })))
  .pipe(dest('dist/assets/images'))
  .pipe(browserSync.reload({stream:true}));
}
function fonts() {
  src('src/assets/fonts/**.ttf')
		.pipe(ttf2woff())
		.pipe(dest('dist/assets/fonts/'))
	return src('src/assets/fonts/**.ttf')
  .pipe(ttf2woff2())
  .pipe(dest('dist/assets/fonts/'))
  .pipe(browserSync.reload({stream:true}));
}
function cb ()  {}
let srcFonts = 'src/assets/scss/fonts.scss';
let distFonts = 'dist/assets/fonts';

function fontsStyle  (done)  {
	let file_content = fs.readFileSync(srcFonts);

	fs.writeFile(srcFonts, '', cb);
	fs.readdir(distFonts, function (err, items) {
		if (items) {
			let c_fontname;
			for (var i = 0; i < items.length; i++) {
				let fontname = items[i].split('.');
				fontname = fontname[0];
				if (c_fontname != fontname) {
					fs.appendFile(srcFonts, '@include font-face("' + fontname + '", "' + fontname + '", 400);\r\n', cb);
				}
				c_fontname = fontname;
			}
		}
	})

	done();
}
function resources() {
  return src('src/assets/resources/**/*.*')
  .pipe(dest('dist/'))
  .pipe(browserSync.reload({stream:true}));
}
function clean() {
  return del('dist') 
}
function startWatch() {
  watch('src/assets/html/**/*.html', html);
  watch('src/assets/scss/**/*.scss',styles);
  watch('src/assets/js/**/*.js',scripts);
  watch('src/assets/images/**/*.{jpg,jpeg,png,gif,ico,svg}',images);
  watch('src/assets/fonts/**.ttf', fonts);
  watch('src/assets/resources/**/*.*',resources);
}
exports.server = server;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;
exports.resources = resources;
exports.clean = clean;
exports.startWatch = startWatch;
exports.default = series(clean,html,styles,scripts,images,fonts,fontsStyle,resources,parallel(server,startWatch));