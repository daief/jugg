import through2 from 'through2';

export function filterTest() {
  return through2.obj((file, _, callback) => {
    const filename = file.path;
    if (/(\/__test__\/)|(\/test\/)|(\.test\.)|(\.spec\.)/gi.test(filename)) {
      return callback(null, null);
    }
    callback(null, file);
  });
}

export default filterTest;
