import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        ignores: ['node_modules/**', 'dist/**', '*.config.js', '*.config.ts']
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.vue', '**/*.ts', '**/*.tsx', '**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                // Браузерные глобальные переменные
                console: 'readonly',
                window: 'readonly',
                document: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                HTMLElement: 'readonly',
                HTMLInputElement: 'readonly',
                Event: 'readonly',
                // Node.js
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
            },
            parserOptions: {
                parser: '@typescript-eslint/parser',
            }
        },
        rules: {
            // Смягчаем некоторые правила
            'vue/multi-word-component-names': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-console': 'off', // Отключаем предупреждения о console
            'no-debugger': 'warn',
            '@typescript-eslint/no-unused-vars': ['error', {
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^_'
            }],
            'vue/require-default-prop': 'off',
            'vue/prop-name-casing': 'warn'
        }
    }
)
