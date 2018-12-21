import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import createBanner from 'create-banner'
import pkg from './package.json'

const name = pkg.name.replace('jquery-plugin-', '')

const banner = createBanner({
  data: {
    name: `${name}.js`,
    year: '2018',
  },
})

export default {
  input: 'src/index.js',
  output: [
    {
      banner,
      file: `dist/${name}.js`,
      format: 'umd',
      globals: {
        jquery: 'jQuery'
      }
    },
    {
      banner,
      file: `docs/js/${name}.js`,
      format: 'umd',
      globals: {
        jquery: 'jQuery'
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
