import babel from 'rollup-plugin-babel'
import copy from 'rollup-plugin-copy'
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
  output: {
    banner,
    file: `dist/${name}.js`,
    format: 'esm'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    copy({
      'dist/bsmodal.js': 'docs/js/bsmodal.js'
    })
  ]
}
