import * as ts from 'typescript';
import { join } from 'path';
import transformerFactory from '../src/ts-rhl-transformer/ts-rhl-transformer.dev';
import { readdirSync, statSync, readFileSync } from 'fs';
const printer = ts.createPrinter();
const FIXTURES_DIR = join(__dirname, '__fixtures__');

describe('ts-rhl-transformer', () => {
  describe('react components', () => {
    readdirSync(FIXTURES_DIR).forEach(fixtureName => {
      const fixtureFile = join(FIXTURES_DIR, fixtureName);

      if (statSync(fixtureFile).isFile()) {
        it(fixtureName, () => {
          const sourceCode = readFileSync(fixtureFile, 'utf-8');
          const source = ts.createSourceFile(fixtureName, sourceCode, ts.ScriptTarget.ES2016, true);
          const result = ts.transform(source, [transformerFactory()]);
          const transformedSourceFile = result.transformed[0];
          const resultCode = printer.printFile(transformedSourceFile);
          expect(resultCode).toMatchSnapshot();
        });
      }
    });
  });

  describe('copies arrow function body block onto hidden class methods', () => {
    const fixturesDir = join(FIXTURES_DIR, 'class-properties');

    readdirSync(fixturesDir).forEach(fixtureName => {
      const fixtureFile = join(fixturesDir, fixtureName);

      if (statSync(fixtureFile).isFile()) {
        it(fixtureName, () => {
          const sourceCode = readFileSync(fixtureFile, 'utf-8');
          const source = ts.createSourceFile(fixtureName, sourceCode, ts.ScriptTarget.ES2016, true);
          const result = ts.transform(source, [transformerFactory()]);
          const transformedSourceFile = result.transformed[0];
          const resultCode = printer.printFile(transformedSourceFile);
          expect(resultCode).toMatchSnapshot();
        });
      }
    });
  });
});
