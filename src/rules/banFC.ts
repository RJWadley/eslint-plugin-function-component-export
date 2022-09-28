import { Rule } from "eslint";

export function banFC(context: Rule.RuleContext): Rule.RuleListener {
  return {
    // for each type annotation
    TSTypeAnnotation(node) {
      // get the text
      const text = context.getSourceCode().getText(node);
      const searchForGenerics = text.match(/<[\s\S]*>$/g);

      let generic =
        searchForGenerics &&
        searchForGenerics[0].replace(/<([\s\S]*)>$/g, "$1");

      // if it includes FC
      if (text.match(/^: (React\.)?FC(<[\S\s]*>)?$/g)) {
        // report the error
        context.report({
          node,
          message: "Don't use FC",
          fix(fixer) {
            // if the annotation has no generics remove the annotation entirely
            if (!generic) {
              return fixer.remove(node);
            }

            // otherwise, we have to move the generics to the function parameters
            // first, get the function parameters
            const func = node.parent.parent;
            const params = func.init.params;

            // if there are no parameters, just remove the annotation
            if (!params || params.length === 0) {
              return fixer.remove(node);
            }

            // otherwise, get the first parameter
            // and get the type annotation
            const firstParam = params[0];
            const typeAnnotation = firstParam.typeAnnotation;

            if (!typeAnnotation) {
              // if there is no type annotation
              // add one with the generics
              return fixer.insertTextAfter(firstParam, `: ${generic}`);
            } else {
              // if there is a type annotation, just remove the FC
              return fixer.remove(node);
            }
          },
        });
      }
    },
  };
}
