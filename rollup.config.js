import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import banner from 'rollup-plugin-banner'
import nodePolyfills from 'rollup-plugin-node-polyfills'

export default [
  /**
   * Entry: e8ies Web
   */
  {
    input: 'src/index.js',
    output: [
      // 1: Full build
      {
        file: 'lib/e8ies.js',
        format: 'iife',
        name: 'e8ies',
        globals: {
          bsv: 'bsvjs'
        }
      },
      // 2: Minimised
      {
        file: 'lib/e8ies.min.js',
        format: 'iife',
        name: 'e8ies',
        globals: {
          bsv: 'bsvjs'
        },
        plugins: [
          terser()
        ]
      }
    ],
    external: ['bsv'],
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled'
      }),
      nodePolyfills(),
      banner('e8ies.js - v<%= pkg.version %>\n<%= pkg.description %>\n<%= pkg.repository %>\nCopyright © <%= new Date().getFullYear() %> Dean Little.')
    ]
  },

  /**
   * Entry: SPV CJS
   */
  {
    input: 'src/index.js',
    output: {
      file: 'lib/e8ies.cjs.js',
      format: 'cjs'
    },
    external: ['bsv', 'buffer'],
    plugins: [
      resolve(),
      commonjs()
    ]
  }
]