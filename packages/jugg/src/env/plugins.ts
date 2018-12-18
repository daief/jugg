import { Compiler } from 'webpack';

export class FilterCSSConflictingWarning {
  apply(compiler: Compiler) {
    compiler.hooks.afterEmit.tap('FilterWarning', compilation => {
      compilation.warnings = (compilation.warnings || []).filter(warning => {
        return warning.message.indexOf('Conflicting order between:') === -1;
      });
    });
  }
}
