/**
 * ts transformer, from react-hot-loader@4 https://github.com/gaearon/react-hot-loader/blob/master/src/babel.dev.js
 * a simple version, handle the class declaration node
 * using this with ts-loader and without babel, you can also make react hot-reload well in typescript
 */

import * as ts from 'typescript';

const PREFIX = '__reactstandin__';
const REGENERATE_METHOD = `${PREFIX}regenerateByEval`;

export function createTransformer() {
  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    return transformerNode => {
      const visitor: ts.Visitor = node => {
        /**
         * visit `ClassDeclaration` node, then add a method to the class.
         * the method looks like this:
         * ```ts
         *    __reactstandin__regenerateByEval (key, code) {
         *      this[key] = eval(code);
         *    }
         * ```
         */
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

            if (classEle.name.getText() !== REGENERATE_METHOD) {
              hasMethods = true;
            } else {
              hasRegenerateMethod = true;
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
              visitor,
              context
            );
          }
        } // if ts.isClassDeclaration

        return ts.visitEachChild(node, visitor, context);
      }; // visitor

      return ts.visitNode(transformerNode, visitor);
    };
  };

  return transformer;
}

export default createTransformer;
