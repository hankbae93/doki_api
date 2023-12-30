import Development from './development';
import Production from './production';
import * as process from 'process';

const config = process.env.NODE_ENV === 'production' ? Production : Development;

export default config;
