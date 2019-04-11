import gulp from 'gulp';

// ref: https://github.com/ant-design/antd-tools/blob/b28fd3685406d06dabb8e0cc8ffe4603336aab69/lib/cli/run.js#L16
export function runTask(toRun: string) {
  const metadata: any = { task: toRun };
  // Gulp >= 4.0.0 (doesn't support events)
  const taskInstance = gulp.task(toRun);
  if (taskInstance === undefined) {
    gulp.emit('task_not_found', metadata);
    return;
  }
  const start = process.hrtime();
  gulp.emit('task_start', metadata);
  try {
    // @ts-ignore
    taskInstance.apply(gulp);

    metadata.hrDuration = process.hrtime(start);
    gulp.emit('task_stop', metadata);
    gulp.emit('stop');
  } catch (err) {
    err.hrDuration = process.hrtime(start);
    err.task = metadata.task;
    gulp.emit('task_err', err);
  }
}
