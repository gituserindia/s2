module.exports = {
  apps: [
    {
      name: 's2-api',
      script: 'server/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
