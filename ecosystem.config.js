module.exports = {
  apps: [
    {
      name: 'sms-panel',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        SMPP_HOST: '114.199.74.35',
        SMPP_PORT: '2775',
        SMPP_SYSTEM_ID: 'XQB0213MKT',
        SMPP_PASSWORD: 'fS5cgh26',
        SMPP_SOURCE_ADDR: '45578'
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
} 