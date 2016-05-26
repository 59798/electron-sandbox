import gulp from 'gulp';
import gulpWatch from 'gulp-watch';
import { join as joinPaths } from 'path';
import { spawn } from 'child_process';
import { parse } from 'shell-quote';
import browserify from 'browserify';
import { createWriteStream } from 'fs';

gulp.task('default', ['src', 'reboot']);
gulp.task('reboot', () => {
  gulp.start('src-watch');

  const cwd = joinPaths(__dirname, 'app');
  spawn('nodemon', parse('--exec "electron ." --ignore renderer'), { cwd, stdio: 'inherit' });
});

const srcFiles = joinPaths(__dirname, 'src', '**', '*.js');
gulp.task('src-watch', () => {
  gulpWatch(srcFiles, () => {
    gulp.start('src');
  });
});

gulp.task('src', ['src-env', 'src-main', 'src-renderer']);
gulp.task('src-env', () => {
  process.env.NODE_ENV = 'production';
});
gulp.task('src-main', () =>
  browserify('src/main/index.js', {
    bundleExternal: false,
    transform: [
      'babelify',
    ],
    debug: true,
  }).bundle().pipe(createWriteStream('app/main/index.js'))
);
gulp.task('src-renderer', () =>
  browserify('src/renderer/index.js', {
    bundleExternal: false,
    transform: [
      'babelify',
    ],
    debug: true,
  }).bundle().pipe(createWriteStream('app/renderer/index.js'))
);
