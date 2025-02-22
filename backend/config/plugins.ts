export default ({ env }) => ({
  seo: {
    enabled: true,
  },
  'import-export-entries': {
    enabled: true,
  },
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 100 * 1024 * 1024, // 100mb in bytes
      },
    },
  },
  graphql: {
    enabled: true,
    config: {
      defaultLimit: 25,
      maxLimit: 100,
    },
  },
  ckeditor: {
    enabled: true,
  },
});