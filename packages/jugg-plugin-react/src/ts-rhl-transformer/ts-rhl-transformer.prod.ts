/**
 * 以下的目的应该是要移除 hot 的调用
 * ```js
 * import {hot} from 'react-hot-loader'
 * const a = hot(module)(Component)
 *
 * // 转变为
 * import {hot} from 'react-hot-loader'
 * const a = Component
 * ```
 *
 * 此处的 TS 实现会涉及到一些无辜代码，如：
 * ```js
 * function a(hot) {
 *  return hot(module)(Component)
 * }
 * ```
 *
 * 实际上 react-hot-loader/hot.prod 为：
 * ```js
 * export default () => Component => Component
 * ```
 *
 * 所以现在先不作处理
 */

import * as ts from 'typescript';

/*
const RHLPackage = 'react-hot-loader';

interface ISpecifier {
  kind: 'namespace' | 'named';
  local: string;
  id: ts.Identifier;
}

function getRHLContext(node: ts.SourceFile): ISpecifier[] {
  const children = node.statements;
  const context: ISpecifier[] = [];

  for (const item of children) {
    // 不是导入语句，导入不是 `react-hot-loader`
    if (!ts.isImportDeclaration(item)) {
      continue;
    }

    if (
      (ts.isStringLiteral(item.moduleSpecifier) &&
        item.moduleSpecifier.text.trim() !== RHLPackage) ||
      !item.importClause
    ) {
      continue;
    }

    // 不包括默认导入
    const { importClause } = item;

    const { namedBindings } = importClause;

    if (ts.isNamespaceImport(namedBindings)) {
      context.push({
        kind: 'namespace',
        local: namedBindings.name.getText(),
        id: namedBindings.name,
      });
    } else if (ts.isNamedImports(namedBindings)) {
      const { elements } = namedBindings;
      for (const importSpecifierItem of elements) {
        const { propertyName, name } = importSpecifierItem;
        const nameText = name.text;
        if (
          (propertyName && propertyName.text === 'hot') ||
          (!propertyName && nameText === 'hot')
        ) {
          context.push({
            kind: 'named',
            local: nameText,
            id: name,
          });
        }
      }
    }
  }

  return context;
}

export function createTransformer() {
  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    return transformerNode => {
      const rhlContext = getRHLContext(transformerNode);
      const cancel = !rhlContext.length;

      const visitorCallExpression: ts.Visitor = node => {
        if (cancel) {
          return node;
        }

        if (ts.isCallExpression(node) && ts.isCallExpression(node.expression)) {
          const childNode = node.expression;
          for (const specifier of rhlContext) {
            if (specifier.kind === 'named') {
              if (
                ts.isIdentifier(childNode.expression) &&
                childNode.expression.getText() === specifier.local &&
                // isImportedFromRHL(childNode, specifier.local) &&
                ts.isCallExpression(childNode.parent) &&
                node.arguments[0] &&
                ts.isIdentifier(node.arguments[0])
              ) {
                return node.arguments[0];
              }
            } else if (specifier.kind === 'namespace') {
              const childNodeExpression = childNode.expression;
              if (
                ts.isPropertyAccessExpression(childNodeExpression) &&
                ts.isIdentifier(childNodeExpression.expression) &&
                ts.isIdentifier(childNodeExpression.name) &&
                childNodeExpression.expression.getText() === specifier.local &&
                childNodeExpression.name.text === 'hot' &&
                node.arguments[0] &&
                ts.isIdentifier(node.arguments[0])
              ) {
                return node.arguments[0];
              }
            }
          }
        }
        return ts.visitEachChild(node, visitorCallExpression, context);
      };

      return ts.visitNode(transformerNode, visitorCallExpression);
    };
  };

  return transformer;
}
*/

/**
 * do nothing
 */
export function createTransformer() {
  const transformer: ts.TransformerFactory<ts.SourceFile> = () => {
    return transformerNode => {
      return transformerNode;
    };
  };
  return transformer;
}

export default createTransformer;
