/* eslint-env node */
import resolve from '@rollup/plugin-node-resolve'
import path from 'path'
import babel from 'rollup-plugin-babel'
import externals from 'rollup-plugin-node-externals'




const config = {
  input: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    exports: 'named',
    dir: path.resolve(__dirname, 'dist'),
    chunkFileNames: '[name].js',
    format: 'cjs',
  },
  plugins: [externals(), resolve(), babel()],
}





export default config
