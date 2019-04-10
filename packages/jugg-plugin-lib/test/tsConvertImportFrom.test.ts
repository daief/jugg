import * as ts from 'typescript';
import transformerFactory from '../src/tsConvertImportFrom';

describe('ts-convert-import-from', () => {
  describe('convert-vue-2-js', () => {
    it('import, export, require', () => {
      const CODE = `
        import A from 'A/A.vue';
        import B from './A.vue';
        import C from 'A.vue';
        export * from '../../A.vue'
        export * from './A.tsx'
        export { A }
        require('A.vue');
        require('A.png');
        // not
        A.require('A.vue');

        ;(A, B, C)
      `;
      const tsResult = ts.transpileModule(CODE, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2015,
        },
        transformers: {
          before: [transformerFactory()],
        },
      });
      const resultCode = tsResult.outputText;
      expect(resultCode).toMatchSnapshot();
    });

    it('with-comment-disable-convert', () => {
      const CODE = `
        import { C } from '../A.vue';  // jugg-lib-disable not converts

        export * from '../../A.vue' // jugg-lib-disable

        //  jugg-lib-disable
        export * from './B.vue'

        export * from './C.vue' // jugg-lib-disable

        require('A.vue'); // jugg-lib-disable

        // jugg-lib-disable
        require('A.vue');

        // jugg-lib-disable require('A.vue');

        require('A.vue'); /* jugg-lib-disable converts*/

        ;(C)
      `;
      const tsResult = ts.transpileModule(CODE, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2015,
          lib: ['es6'],
          // module: ts.ModuleKind.CommonJS,
        },
        transformers: {
          before: [transformerFactory()],
        },
      });
      const resultCode = tsResult.outputText;
      expect(resultCode).toMatchSnapshot();
    });
  });
});
