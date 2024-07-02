import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import babel from '@babel/core';

const nodeModulesRegex = /node_modules/;


function isNodeModules(filePath) {
  return nodeModulesRegex.test(filePath);
}

/**
 * Replaces the extension of a given URL.
 * @param {URL} url - The URL whose extension will be replaced.
 * @param {string} fromExtension - The extension to replace.
 * @param {string} toExtension - The new extension.
 * @returns {string} - The URL with the new extension.
 */
function replaceExtension(url, fromExtension, toExtension) {
  url.pathname = url.pathname.slice(0, -fromExtension.length) + toExtension;
  return url.href;
}

/**
 * Resolve module specifier to a URL.
 * @param {string} specifier - The module specifier.
 * @param {object} context - The context object.
 * @param {function} nextResolve - The next resolve function in the chain.
 * @returns {Promise<object>} - The resolved module.
 */
export async function resolve(specifier, context, nextResolve) {
  try {
    if (path.isAbsolute(specifier)) {
      specifier = pathToFileURL(specifier).toString();
    }

    return await nextResolve(specifier, context);
  }
  catch (error) {
    if (!specifier.startsWith('.') && !specifier.startsWith('file:')) {
      throw error;
    }

    const resolvedPath = fileURLToPath(new URL(specifier, context.parentURL));
    if (isNodeModules(resolvedPath)) {
      throw error;
    }

    const extension = path.extname(resolvedPath);

    if (error.code === 'ERR_MODULE_NOT_FOUND' && extension === '.js') {
      const specifierUrl = new URL(specifier, context.parentURL);
      const sameFileButTs = replaceExtension(specifierUrl, '.js', '.ts');

      const resolvedTs = await tryResolve(sameFileButTs);
      if (resolvedTs) {
        return resolvedTs;
      }

      const sameFileButTsx = replaceExtension(specifierUrl, '.js', '.tsx');
      const resolvedTsx = await tryResolve(sameFileButTsx);

      if (resolvedTsx) {
        return resolvedTsx;
      }

      throw error;
    }
    else {
      throw error;
    }
  }

  /**
   * Attempt to resolve a module specifier.
   * @param {string} specifier - The module specifier.
   * @returns {Promise<object|undefined>} - The resolved module or undefined.
   */
  async function tryResolve(specifier) {
    try {
      return await nextResolve(specifier, context);
    }
    catch (error) {
      return undefined;
    }
  }
}

/**
 * Get the format of the module (e.g., 'module', 'commonjs').
 * @param {string} url - The module URL.
 * @param {object} context - The context object.
 * @param {function} defaultGetFormat - The default getFormat function.
 * @returns {Promise<object>} - The format of the module.
 */
export async function getFormat(url, context, defaultGetFormat) {
  return defaultGetFormat(url, context, defaultGetFormat);
}

/**
 * Transform source code with Babel.
 * @param {string|Buffer} source - The source code to transform.
 * @param {object} context - The context object.
 * @returns {Promise<object>} - The transformed source and source map.
 */
export async function transformSource(source, context) {
  const { url, format } = context;
  const resolvedPath = fileURLToPath(url);

  if (isNodeModules(resolvedPath) || (format !== 'module' && format !== 'commonjs')) {
    return { source };
  }

  const stringSource = Buffer.isBuffer(source) ? source.toString('utf-8') : source;

  try {
    const { code, map } = await babel.transformAsync(stringSource, {
      sourceType: 'module',
      filename: resolvedPath,
      sourceMaps: true,  // Ensure this is explicitly set
      retainLines: true  // Add this option to preserve whitespace
    });

    return {
      source: code,
      sourceMap: map ? JSON.stringify(map) : null
    };
  }
  catch (error) {
    console.error('Babel transformation error:', error);
    throw new Error('Error transforming source with Babel.');
  }
}

/**
 * Load the module and return the transformed source and source map.
 * @param {string} url - The module URL.
 * @param {object} context - The context object.
 * @param {function} nextLoad - The next load function in the chain.
 * @returns {Promise<object>} - The loaded module.
 */
export async function load(url, context, nextLoad) {
  if (!url.endsWith('.jsx')) {
    return nextLoad(url, context);
  }

  const { format, source } = await nextLoad(url, context).catch(async (error) => {
    if (error.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
      return await nextLoad(url, { ...context, format: 'module' });
    }
    else {
      throw error;
    }
  });

  if (source) {
    const transformed = await transformSource(source, { format, url });

    if (transformed) {
      return {
        source: transformed.source,
        format,
        sourceMap: transformed.sourceMap,
      };
    }
  }

  return {
    format,
    source,
  };
}
