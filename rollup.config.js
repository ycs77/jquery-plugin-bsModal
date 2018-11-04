import babel from 'rollup-plugin-babel'
import createBanner from 'create-banner'
import pkg from './package.json'

pkg.name = pkg.name.replace('js', '')

const name = 'bsModal';
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
    })
  ]
}
