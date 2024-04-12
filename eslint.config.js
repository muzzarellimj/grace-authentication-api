// @ts-check

import jslint from '@eslint/js';
import prettierlintConfig from 'eslint-config-prettier';
import tslint from 'typescript-eslint';

export default tslint.config(
  jslint.configs.recommended,
  ...tslint.configs.recommended,
  prettierlintConfig,
  {
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
    }
  }
);