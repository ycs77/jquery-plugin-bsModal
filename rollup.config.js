import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import createBanner from 'create-banner'
import pkg from './package.json'

const name = pkg.name.replace('jquery-plugin-', 'jquery.')

const banner = createBanner({
  data: {
    name: `${name}.js`,
    year: '2018-' + new Date().getFullYear()
  }
})

export default {
  input: 'src/index.js',
  external: ['jquery'],
  output: [
    {
      banner,
      file: `dist/${name}.js`,
      format: 'umd',
      globals: {
        jquery: '$'
      }
    },
    {
      banner,
      file: `docs/js/${name}.js`,
      format: 'umd',
      globals: {
        jquery: '$'
      }
    }
  ],
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
}
