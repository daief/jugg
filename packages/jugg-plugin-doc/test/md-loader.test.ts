import * as fs from 'fs';
import * as path from 'path';
import compiler from './compiler';

const FIXTURE_DIR = path.resolve(__dirname, 'fixture');
describe('Test loader', () => {
  fs.readdirSync(FIXTURE_DIR).forEach(_ => {
    it(_, async done => {
      const ENTRY = path.resolve(FIXTURE_DIR, _);
      const stats = await compiler(ENTRY);

      stats.toJson().modules.forEach((m: any) => {
        expect(m.source).toMatchSnapshot(m.name);
      });

      done();
    });
  });
});
