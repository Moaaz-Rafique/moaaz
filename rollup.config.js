import { getBabelOutputPlugin } from '@rollup/plugin-babel';

export default {
  input: 'app.js',
  plugins: [
    getBabelOutputPlugin({
      presets: ['@babel/preset-env']
    })
  ],
  output: [
    { file: 'bundle.cjs.js', format: 'cjs' },
    { file: 'bundle.es.js', format: 'es' }
  ]
};