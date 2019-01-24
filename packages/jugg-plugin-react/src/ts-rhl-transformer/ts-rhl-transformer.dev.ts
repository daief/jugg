/**
 * ts transformer, from react-hot-loader@4 https://github.com/gaearon/react-hot-loader/blob/master/src/babel.dev.js
 * using this with ts-loader and without babel, you can also make react hot-reload well in typescript
 * thanks: https://github.com/Jetsly/ts-react-hot-transformer
 */

import * as ts from 'typescript';

const PREFIX = '__reactstandin__';
const REGENERATE_METHOD = `${PREFIX}regenerateByEval`;

/**
 * 设定 code 字符中的占位符规则，用以替换
 * @babel/template，https://babeljs.io/docs/en/babel-template#placeholderpattern
 */
const placeholderPattern = /^([A-Z0-9]+)([A-Z0-9_]+)$/;

const shouldIgnoreFile = (file: string) =>
  !!file
    .split('\\')
    .join('/')
    .match(/node_modules\/(react|react-hot-loader)([\/]|$)/);

/**
 * 低配版 @babel/template
 * 配合 ts.createIdentifier()
 * @param tpl code string
 */
const template = (tpl: string) => (data: { [k: string]: any } = {}) =>
  tpl
    .split(/\b/)
    .map(section =>
      section.replace(
        placeholderPattern,
        substring =>
          Array.isArray(data[substring]) ? data[substring].join('\n') : data[substring] || ''
      )
    )
    .join('');

const emptyStatement = ts.createStatement(ts.createIdentifier('\n\n'));

function createParenthesizedExpression(expression: ts.Expression) {
  const node = ts.createNode(ts.SyntaxKind.ParenthesizedExpression) as ts.ParenthesizedExpression;
  node.expression = expression;
  return node;
}

/**
 * 生成如下语句
 * ```js
 * reactHotLoader.register(ID, NAME, FILENAME);
 * ```
 * @param id
 * @param name
 * @param filename
 */
const buildRegistrationExpression = (
  id: ts.Identifier,
  name: ts.StringLiteral,
  filename: ts.StringLiteral
) => {
  return ts.createExpressionStatement(
    ts.createCall(
      ts.createPropertyAccess(
        ts.createIdentifier('reactHotLoader'),
        ts.createIdentifier('register')
      ),
      undefined,
      [id, name, filename]
    )
  );
};

const headerTemplate = template(
  `
(function () {
  var enterModule = require('react-hot-loader').enterModule;
  enterModule && enterModule(module);
}())
`
);

/**
 * 生成如下语句
 * ```js
 * (function () {
 * var reactHotLoader = require('react-hot-loader').default;
 *  var leaveModule = require('react-hot-loader').leaveModule;
 *  if (!reactHotLoader) {
 *    return;
 *  }
 *  // registration statements here
 *  leaveModule(module);
 * }());
 * ```
 * @param regisrations registration statements
 */
const buildTaggerExpression = (registrations: ts.ExpressionStatement[]) => {
  const list: ts.Statement[] = [];
  // 添加换行
  registrations.forEach(s => list.push(s, ts.createStatement(ts.createIdentifier('\n'))));
  return ts.createExpressionStatement(
    createParenthesizedExpression(
      ts.createCall(
        ts.createFunctionExpression(
          undefined,
          undefined,
          undefined,
          undefined,
          [],
          undefined,
          ts.createBlock([
            ts.createStatement(
              ts.createIdentifier(
                `
var reactHotLoader = require('react-hot-loader').default;
var leaveModule = require('react-hot-loader').leaveModule;
if (!reactHotLoader) {
  return;
}
`
              )
            ),
            ...list,
            ts.createStatement(ts.createIdentifier('leaveModule(module)')),
          ])
        ),
        undefined,
        []
      )
    )
  );
};

function shouldRegisterBinding(node: ts.Node) {
  switch (node.kind) {
    case ts.SyntaxKind.FunctionDeclaration:
    case ts.SyntaxKind.ClassDeclaration:
    case ts.SyntaxKind.VariableStatement:
      return true;
    default:
      return false;
  }
}

function hasExportAndDefaultKeyWord(kind: ts.SyntaxKind) {
  return [ts.SyntaxKind.ExportKeyword, ts.SyntaxKind.DefaultKeyword].includes(kind);
}

function isExportDefaultDeclaration(node: ts.Node): node is ts.DeclarationStatement {
  return (
    node.modifiers &&
    node.modifiers.filter(({ kind }) => hasExportAndDefaultKeyWord(kind)).length === 2
  );
}

export function createTransformer() {
  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    return transformerNode => {
      // XXX absolute file name ?
      // const FILE_NAME = join(__dirname, transformerNode.fileName);
      const FILE_NAME = transformerNode.fileName;
      const REGISTRATIONS: ts.ExpressionStatement[] = [];

      /**
       * visit `ClassDeclaration` node, then add a method to the class.
       * the method looks like this:
       * ```ts
       *    __reactstandin__regenerateByEval (key, code) {
       *      this[key] = eval(code);
       *    }
       * ```
       */
      const visitorClassLike: ts.Visitor = node => {
        if (ts.isClassLike(node)) {
          let hasRegenerateMethod = false;
          let hasMethods = false;

          /**
           * check hasMethods and hasRegenerateMethod
           */
          node.members.forEach(classEle => {
            let hasStatic = false;
            for (const ele of classEle.modifiers || []) {
              if (ele.kind === ts.SyntaxKind.StaticKeyword) {
                hasStatic = true;
                break;
              }
            }

            if (hasStatic) {
              return;
            }

            // notice node type check
            if (
              ts.isMethodDeclaration(classEle) ||
              ts.isPropertyDeclaration(classEle) ||
              ts.isConstructorDeclaration(classEle)
            ) {
              const propName = classEle.name ? classEle.name.getText() : 'constructor';
              hasMethods = propName !== REGENERATE_METHOD;
              hasRegenerateMethod = propName === REGENERATE_METHOD;
            }
          });

          if (hasMethods && !hasRegenerateMethod) {
            /**
             * create the method
             */
            const method = ts.createMethod(
              undefined,
              undefined,
              undefined,
              // method name
              REGENERATE_METHOD,
              undefined,
              undefined,
              // parameters
              [
                ts.createParameter(undefined, undefined, undefined, 'key'),
                ts.createParameter(undefined, undefined, undefined, 'code'),
              ],
              undefined,
              // method body
              ts.createBlock([
                ts.createExpressionStatement(ts.createIdentifier('this[key] = eval(code)')),
              ])
            );

            // update the AST ClassDeclaration node, and recursive
            return ts.visitEachChild(
              ts.isClassDeclaration(node)
                ? ts.updateClassDeclaration(
                    node,
                    node.decorators,
                    node.modifiers,
                    node.name,
                    node.typeParameters,
                    node.heritageClauses,
                    node.members.concat([method])
                  )
                : ts.updateClassExpression(
                    node,
                    node.modifiers,
                    node.name,
                    node.typeParameters,
                    node.heritageClauses,
                    node.members.concat([method])
                  ),
              visitorClassLike,
              context
            );
          }
        }

        return ts.visitEachChild(node, visitorClassLike, context);
      }; // end ---------------------------------- visitorClassLike

      /**
       * 对默认导出语句变换
       * ```js
       * export default class {}
       *
       * // ---- 变换为如下形式 ----
       *
       * const _default = class {}
       * export default _default
       * ```
       * @param node
       */
      const visitorExportDefault: ts.Visitor = node => {
        if (ts.isExportAssignment(node) || isExportDefaultDeclaration(node)) {
          /**
           * handle export default:
           *  - export default class {}
           *  - export default class A {}
           *  - export default function() {}
           *  - export default () => {}
           *  - export default ''
           *  - ...
           */
          if (node.name) {
            return node;
          }

          const id = ts.createUniqueName('_default');

          REGISTRATIONS.push(
            buildRegistrationExpression(
              id,
              ts.createStringLiteral('default'),
              ts.createStringLiteral(FILE_NAME)
            )
          );

          let expression: ts.Expression;
          if (ts.isFunctionDeclaration(node)) {
            /**
             * statements like this
             *  - export default function() {}
             */
            expression = ts.createFunctionExpression(
              node.modifiers,
              node.asteriskToken,
              node.name,
              node.typeParameters,
              node.parameters,
              node.type,
              node.body
            );
          } else if (ts.isClassDeclaration(node) && !node.decorators) {
            /**
             * without decorators
             * statements like this
             *  - export default class {}
             *  - export default class A {}
             */
            expression = ts.createClassExpression(
              node.modifiers.filter(m => !hasExportAndDefaultKeyWord(m.kind)),
              node.name,
              node.typeParameters,
              node.heritageClauses,
              node.members
            );
          } else if (ts.isClassDeclaration(node) && node.decorators) {
            /**
             * with decorators
             * statements like this
             *  -
             *    @ddd
             *    export default class {}
             */
            return [
              ts.updateClassDeclaration(
                node,
                node.decorators,
                node.modifiers.filter(m => !hasExportAndDefaultKeyWord(m.kind)),
                id,
                node.typeParameters,
                node.heritageClauses,
                node.members
              ),
              ts.createExportAssignment(undefined, undefined, false, id),
            ];
          } else if (ts.isExportAssignment(node)) {
            /**
             * statements like this
             *  - export default () => {}
             *  - export default ''
             */
            expression = node.expression;
          }

          return [
            ts.createVariableDeclarationList(
              [ts.createVariableDeclaration(id, undefined, expression)],
              ts.NodeFlags.Const
            ),
            ts.createExportAssignment(undefined, undefined, false, id),
          ];
        }

        return ts.visitEachChild(node, visitorExportDefault, context);
      }; // end ---------------------------------- visitorExportDefault

      /**
       * 寻找顶层变量声明，进行记录，之后进行注册操作
       * @param node
       */
      const visitorTopScope: ts.Visitor = node => {
        if (shouldRegisterBinding(node)) {
          const ids: ts.Identifier[] = [];

          if (ts.isVariableStatement(node)) {
            node.declarationList.declarations.forEach(declaration => {
              const { initializer } = declaration;
              if (
                initializer &&
                ts.isCallExpression(initializer) &&
                initializer.expression &&
                initializer.expression.getText() === 'require'
              ) {
                return;
              }

              const declarationNameNode = declaration.name;
              if (
                ts.isObjectBindingPattern(declarationNameNode) ||
                ts.isArrayBindingPattern(declarationNameNode)
              ) {
                declarationNameNode.elements.forEach(el => ids.push(el.name as any));
              } else {
                ids.push(declarationNameNode);
              }
            });
          } else if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
            ids.push(node.name);
          }

          ids
            .filter(id => !!id)
            .forEach(id =>
              REGISTRATIONS.push(
                buildRegistrationExpression(
                  id,
                  ts.createStringLiteral(id.text),
                  ts.createStringLiteral(FILE_NAME)
                )
              )
            );
          return node;
        }

        return ts.visitEachChild(node, visitorTopScope, context);
      }; // end ---------------------------------- visitorTopScope

      let newSourceFile = ts.visitNode(transformerNode, visitorTopScope);
      newSourceFile = ts.visitNode(newSourceFile, visitorClassLike);
      newSourceFile = ts.visitNode(newSourceFile, visitorExportDefault);

      if (REGISTRATIONS.length && !shouldIgnoreFile(FILE_NAME)) {
        const header: ts.Statement[] = [
          ts.createStatement(ts.createIdentifier(headerTemplate())),
          emptyStatement,
        ];
        const footer: ts.Statement[] = [
          emptyStatement,
          buildTaggerExpression(REGISTRATIONS),
          emptyStatement,
        ];
        return ts.updateSourceFileNode(
          newSourceFile,
          header.concat(newSourceFile.statements).concat(footer)
        );
      }

      return newSourceFile;
    };
  };

  return transformer;
}

export default createTransformer;
