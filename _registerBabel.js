const useBuild = process.env.USE_BUILD === 'true';

// Registers babel.
if (!useBuild) {
  const babelRegister = (await import('@babel/register')).default;
  babelRegister({
    extensions: ['.js', '.jsx', '.tsx'],
    ignore: [/node_modules/],
    configFile: './babel.client.config.js',
  });
  console.log('Registered Babel.');
}
