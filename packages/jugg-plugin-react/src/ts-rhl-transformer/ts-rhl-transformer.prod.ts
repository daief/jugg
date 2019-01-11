// do nothing

import * as ts from 'typescript';

export function createTransformer() {
  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    return transformerNode => {
      const visitor: ts.Visitor = node => {
        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(transformerNode, visitor);
    };
  };

  return transformer;
}

export default createTransformer;
