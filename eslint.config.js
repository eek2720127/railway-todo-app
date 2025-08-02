// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  {
    // ...
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      import: pluginImport,
      prettier: pluginPrettier,
    },
    // ...
  },
];
