/**
 * ts transformer, from react-hot-loader@4 https://github.com/gaearon/react-hot-loader/blob/master/src/babel.dev.js
 * a simple version, handle the class declaration node
 * using this with ts-loader and without babel, you can also make react hot-reload well in typescript
 */

import * as ts from 'typescript';
import { join } from 'path';

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

// const buildRegistration = template(
//   'reactHotLoader.register(ID, NAME, FILENAME);',
// );

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
  `(function () {
     var enterModule = require('react-hot-loader').enterModule;
     enterModule && enterModule(module);
   }())`
);

// const buildTagger = template(
//   `
//     (function () {
//       var reactHotLoader = require('react-hot-loader').default;
//       var leaveModule = require('react-hot-loader').leaveModule;
//       if (!reactHotLoader) {
//         return;
//       }
//       REGISTRATIONS
//       leaveModule(module);
//     }());
//   `
// );

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
            ...registrations,
            ts.createStatement(ts.createIdentifier('\nleaveModule(module)\n')),
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
    case ts.SyntaxKind.VariableDeclaration: {
      const { initializer } = node as ts.VariableDeclaration;
      if (
        initializer &&
        ts.isCallExpression(initializer) &&
        initializer.expression &&
        initializer.expression.getText() === 'require'
      ) {
        return false;
      }
      return true;
    }
    default:
      return false;
  }
}

function isExportDefaultDeclaration(node: ts.Node): node is ts.DeclarationStatement {
  return (
    node.modifiers &&
    node.modifiers.filter(({ kind }) =>
      [ts.SyntaxKind.ExportKeyword, ts.SyntaxKind.DefaultKeyword].includes(kind)
    ).length === 2
  );
}

export function createTransformer() {
  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    return transformerNode => {
      // XXX absolute file name
      const FILE_NAME = join(__dirname, transformerNode.fileName);
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
            if (ts.isMethodDeclaration(classEle) || ts.isPropertyDeclaration(classEle)) {
              const propName = classEle.name.getText();
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
            return;
          }
          // XXX
          const id = ts.createUniqueName('_default');
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
          } else if (ts.isClassDeclaration(node)) {
            /**
             * statements like this
             *  - export default class {}
             *  - export default class A {}
             */
            expression = ts.createClassExpression(
              node.modifiers.filter(
                m => ![ts.SyntaxKind.ExportKeyword, ts.SyntaxKind.DefaultKeyword].includes(m.kind)
              ),
              node.name,
              node.typeParameters,
              node.heritageClauses,
              node.members
            );
          } else if (ts.isExportAssignment(node)) {
            /**
             * statements like this
             *  - export default () => {}
             *  - export default ''
             */
            expression = node.expression;
          }
          // else {
          //   // TODO with decorator
          //   // @xxx
          //   // class A {}
          // }

          REGISTRATIONS.push(
            buildRegistrationExpression(
              id,
              ts.createStringLiteral('default'),
              ts.createStringLiteral(FILE_NAME)
            )
          );

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

      const visitorTopScope: ts.Visitor = node => {
        return node;
      }; // end ---------------------------------- visitorTopScope

      let newSourceFile = ts.visitNode(transformerNode, visitorTopScope);
      newSourceFile = ts.visitNode(transformerNode, visitorClassLike);
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
