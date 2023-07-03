import * as process from 'process';

export const jwtConstants = {
  secret: process.env.COOKIE_SECRET,
};

console.log(jwtConstants.secret);
