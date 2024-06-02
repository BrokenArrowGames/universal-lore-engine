import gulp, { parallel } from 'gulp';
import markdown, { marked } from 'gulp-markdown';
import rename from 'gulp-rename';
import frontMatter from 'gulp-front-matter';
import concat from 'gulp-concat';
import { join } from 'path';
import { liquidjs, postprocess } from './liquid-markdown.mjs';
import { rmSync } from 'fs';

marked.use({ extensions: [liquidjs] });

const srcDir = 'site';
const dstDir = '_site';
const viewDir = 'views';
const publicDir = 'public';

export function clean(cb) {
	rmSync(dstDir, { recursive: true, force: true });
	cb();
}

export function compileMarkdown(cb) {
	gulp.src(join(srcDir, viewDir, '**', '*.md'))
		.pipe(frontMatter())
		.pipe(markdown())
		.pipe(postprocess())
		.pipe(rename({ extname: '.liquid' }))
		.pipe(gulp.dest(join(dstDir, viewDir)));
  cb();
}

export function compileHtml(cb) {
	gulp.src(join(srcDir, viewDir, '**', '*.liquid'))
		.pipe(frontMatter())
		.pipe(postprocess())
		.pipe(gulp.dest(join(dstDir, viewDir)));
  cb();
}

export function compileCss(cb) {
	gulp.src(join(srcDir, publicDir, '**', '*.css'))
		.pipe(concat(join('style', 'bundle.css')))
		.pipe(gulp.dest(join(dstDir, publicDir)));
	cb();
}

export function copyOut(cb) {
	gulp.src(join(srcDir, publicDir, '**', '*.png'), { encoding: 'binary' })
		.pipe(gulp.dest(join(dstDir, publicDir), { encoding: 'binary' }));
	cb();
}

export const build = parallel(
	compileMarkdown,
	compileHtml,
	compileCss,
	copyOut
);

export const watch = () => {
	gulp.watch(join(srcDir, viewDir, '**', '*.md'), compileMarkdown);
	gulp.watch(join(srcDir, viewDir, '**', '*.liquid'), compileHtml);
	gulp.watch(join(srcDir, publicDir, '**', '*.css'), compileCss);
	gulp.watch(join(srcDir, publicDir, '**', '*.png'), copyOut);
};