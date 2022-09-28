import { Rule } from "eslint";

export function combineDefault(context: Rule.RuleContext): Rule.RuleListener {
  return {
    ExportDefaultDeclaration(exportNode) {
      const { declaration } = exportNode;
      if (declaration.type !== "FunctionDeclaration") {
        let declarationName =
          "name" in exportNode.declaration ? exportNode.declaration.name : "";

        // if the document includes the text "function {declarationId}", then
        // the default export must be inlined
        const sourceCode = context.getSourceCode();
        const functionNode = sourceCode.ast.body.find(
          (node) =>
            node.type === "FunctionDeclaration" &&
            node.id &&
            node.id.name === declarationName
        );

        // if we found a function declaration with the same name as the default
        // report the error
        if (functionNode) {
          console.log("found function declaration");
          context.report({
            node: exportNode,
            message: `Combine default export with function declaration`,
            fix(fixer) {
              if (!functionNode.range) return;
              const functionText = sourceCode.getText(functionNode);
              const textBetweenNodes = sourceCode
                .getText()
                .slice(functionNode.range[1], exportNode.range[0] - 1);

              return fixer.replaceTextRange(
                [functionNode.range[0], exportNode.range[1]],
                `export default ${functionText}${textBetweenNodes}`
              );
            },
          });
        }
      }
    },
  };
}
