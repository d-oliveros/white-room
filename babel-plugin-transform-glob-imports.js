import glob from 'glob';
import pathModule from 'path';

const regexSource = /\*.jsx?$/;
const regexIndex = /index\.jsx$/;

/**
 * Pre-process dynamic glob imports into fixed path imports.
 * This Babel plugin is designed to transform dynamic glob import statements
 * into fixed path imports. This transformation is crucial for build tools
 * like Webpack, which rely on static analysis to determine module availability.
 *
 * The plugin specifically targets files named "index.jsx" and replaces
 * import statements matching a glob pattern (e.g., import modules from './*.jsx')
 * with individual import statements for each matching file. It then aggregates
 * these imports into an object that is exported as a single module, and also
 * adds named exports for each individual module.
 *
 * Example:
 * Input:
 * import modules from './*.jsx';
 * import somethingElse from './somethingElse.jsx';
 *
 * Output:
 * import HomePage from "./HomePage.jsx";
 * import PageTwo from "./PageTwo.jsx";
 * import NotFoundPage from "./NotFoundPage.jsx";
 * import somethingElse from './somethingElse.jsx';
 *
 * export { HomePage }, PageTwo, NotFoundPage };
 * const modules = {
 *   HomePage,
 *   PageTwo,
 *   NotFoundPage,
 * };
 *
 * export default modules;
 *
 * Author: David Oliveros (d-oliveros github handle)
 */
export default function ({ types: t }) {
  return {
    visitor: {
      Program(path, state) {
        if (!regexIndex.test(state.file.opts.filename)) {
          return;
        }

        const body = path.node.body;
        const basePath = pathModule.dirname(state.file.opts.filename);
        let importDeclarations = [];
        let variableDeclarations = [];
        let namedExports = [];
        let lastImportIndex = -1;

        // Track original glob import declarations and replace them with new imports
        body.forEach((node, index) => {
          if (node.type === 'ImportDeclaration' && regexSource.test(node.source.value)) {
            const source = node.source.value;
            const files = glob.sync(source, { cwd: basePath })
              .filter((file) => /\.jsx?$/.test(file) && !/index\.jsx?$/.test(file));

            if (files.length > 0) {
              const objectProperties = [];
              const originalLocalName = node.specifiers[0].local.name;

              files.forEach(file => {
                const importRelativePath = `./${pathModule.relative(basePath, pathModule.join(basePath, file))}`;
                const variableName = pathModule.basename(file, pathModule.extname(file));
                importDeclarations.push(t.importDeclaration(
                  [t.importDefaultSpecifier(t.identifier(variableName))],
                  t.stringLiteral(importRelativePath)
                ));
                objectProperties.push(t.objectProperty(t.identifier(variableName), t.identifier(variableName)));
                namedExports.push(t.exportNamedDeclaration(null, [t.exportSpecifier(t.identifier(variableName), t.identifier(variableName))]));
              });

              const variableDeclaration = t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier(originalLocalName), t.objectExpression(objectProperties))
              ]);

              variableDeclarations.push(variableDeclaration);

              // Replace the original glob import with the new imports
              path.get(`body.${index}`).replaceWithMultiple(importDeclarations);

              // Keep track of where to insert the variable declaration
              lastImportIndex = index + importDeclarations.length - 1;
            } else {
              throw path.buildCodeFrameError(`No files found for glob pattern: ${source}`);
            }
          } else if (node.type === 'ImportDeclaration') {
            lastImportIndex = index;
          }
        });

        // Insert the variable declaration and named exports after the last import
        if (variableDeclarations.length > 0) {
          body.splice(lastImportIndex + 1, 0, ...variableDeclarations, ...namedExports);
        }
      }
    }
  };
}
