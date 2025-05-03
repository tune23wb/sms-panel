module.exports = {
  apps: [
    {
      name: 'sms-panel',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        SMPP_HOST: '43.249.30.190',
        SMPP_PORT: '20002',
        SMPP_SYSTEM_ID: '0159-C0082',
        SMPP_PASSWORD: '4DA88FD7',
        SMPP_SOURCE_ADDR: '45578'
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'sms-panel-smp',
      script: 'gunicorn',
      args: 'services.smpp.smpp_http_service:app -b 0.0.0.0:3001 --workers 2 --timeout 120',
      interpreter: '/var/www/sms-panel-app/sms-panel/sms-panel/venv/bin/python3',
      env: {
        PYTHONPATH: '/var/www/sms-panel-app/sms-panel/sms-panel',
        SMPP_HOST: '43.249.30.190',
        SMPP_PORT: '20002',
        SMPP_SYSTEM_ID: '0159-C0082',
        SMPP_PASSWORD: '4DA88FD7',
        SMPP_SOURCE_ADDR: '45578',
        PORT: '3001'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    }
  ]
} 