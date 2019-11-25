import * as fs from 'fs';
import * as path from 'path';
import { compileVueFile } from '../src/gulpVue';

const VUE_DIR = path.resolve(__dirname, 'vue-files');

describe('compile-vue-file', () => {
  fs.readdirSync(VUE_DIR).forEach(filename => {
    it(`compile [${filename}]`, () => {
      const fullpath = path.resolve(VUE_DIR, filename);
      const result = compileVueFile(
        fs.readFileSync(fullpath, 'utf-8'),
        filename,
      );
      expect(result).toMatchSnapshot();
    });
  });
});
