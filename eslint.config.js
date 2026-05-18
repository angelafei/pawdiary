import js from '@eslint/js'
import ts from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ['**/*.vue'],
    plugins: { vue },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: ts.parser
      }
    },
    rules: {
      ...vue.configs['flat/recommended'].rules
    }
  }
]