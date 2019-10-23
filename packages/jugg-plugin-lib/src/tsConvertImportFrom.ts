/**
 * adjust `import` and `require` statement, convert `match` to `target`
 * can use `// jugg-lib-disable` to disable
 * @example
 *    opt = { match: /\.vue$/, target: '.js' }
 *
 *    import A from '../A.vue'
 *    import A from '../A.js'
 *
 *    require('A.vue')
 *    require('A.js')
 *
 *    require('A.vue') // jugg-lib-disable
 *    require('A.vue')
 */

import * as ts from 'typescript';

export interface IOptions {
  match?: string | RegExp;
  target?: string;
}

export function createTransformer(opts: IOptions = {}) {
  const { match = /\.vue$/i, target = '.js' } = opts;

  // TODO 生成的类型文件中的导出没能随着更新
  const createNewStringLiteralByOpts = (node: ts.StringLiteral) => {
    const newText = node.text.replace(match, target);
    /**
     * XXX 未变化时，返回原节点，新增的节点会有如下影响
     * ```ts
     *  import { functionA, InterfaceA } from 'some.vue'
     *  // ! 在结果文件 js 中，类型 `InterfaceA` 应该被删除，但实际上会被保留
     *  import { functionA, InterfaceA } from 'some.js'
     * ```
     */
    return newText !== node.text ? ts.createStringLiteral(newText) : node;
  };

  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    return transformerNode => {
      const hasDisableComment = (node: ts.Node) => {
        const range =
          ts.getTrailingCommentRanges(transformerNode.text, node.end) || [];

        return (
          range
            .map(ran => {
              return transformerNode.text.substring(ran.pos, ran.end);
            })
            // use `jugg-lib-disable` to disable converting
            .filter(comment => /\/\/\s*jugg-lib-disable/i.test(comment))
            .length > 0
        );
      };

      const visitorImport: ts.Visitor = node => {
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
          const importFrom = node.moduleSpecifier as ts.StringLiteral;
          if (!importFrom || hasDisableComment(node)) {
            return node;
          }
          const newImportFrom = createNewStringLiteralByOpts(importFrom);
          return ts.isImportDeclaration(node)
            ? ts.updateImportDeclaration(
                node,
                node.decorators,
                node.modifiers,
                node.importClause,
                newImportFrom,
              )
            : ts.updateExportDeclaration(
                node,
                node.decorators,
                node.modifiers,
                node.exportClause,
                newImportFrom,
              );
        }
        return ts.visitEachChild(node, visitorImport, context);
      };

      const visitRequire: ts.Visitor = node => {
        if (
          ts.isExpressionStatement(node) &&
          ts.isCallExpression(node.expression)
        ) {
          /**
           * make is `require('..')`
           */
          const callExpression = node.expression;
          const expression = callExpression.expression;
          const args = callExpression.arguments;
          const requireStr = args[0];
          if (
            !ts.isIdentifier(expression) ||
            expression.text !== 'require' ||
            args.length !== 1 ||
            !ts.isStringLiteral(requireStr) ||
            hasDisableComment(node)
          ) {
            return node;
          }

          return ts.updateExpressionStatement(
            node,
            ts.createIdentifier(
              `require("${createNewStringLiteralByOpts(requireStr).text}")`,
            ),
          );
        }
        return ts.visitEachChild(node, visitRequire, context);
      };

      return ts.visitNode(
        ts.visitNode(transformerNode, visitorImport),
        visitRequire,
      );
    };
  };
  return transformer;
}

export default createTransformer;
