module.exports = {
  command: 'npx playwright test',

  targets: {
    default: {
      environment: 'postman/environments/Acme Shop - Local.environment.yaml',
      collections: ['postman/collections/Acme Shop API'],
    },
  },

  filters: {
    urlPatterns: [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      '/css/',
      '/js/',
      '/api/config',
      '/api/demo/reset',
    ],
    methods: ['OPTIONS'],
    headers: {},
  },
};
