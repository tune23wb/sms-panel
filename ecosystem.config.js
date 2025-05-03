module.exports = {
  apps: [
    {
      name: 'sms-panel',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'sms-panel-smp',
      script: 'gunicorn',
      args: '--config services/smpp/gunicorn_config.py services.smpp.smpp_http_service:app',
      cwd: '/var/www/sms-panel-app/sms-panel/sms-panel',
      env: {
        PYTHONPATH: '/var/www/sms-panel-app/sms-panel/sms-panel',
        SMPP_HOST: '43.249.30.190',
        SMPP_PORT: '20002',
        SMPP_SYSTEM_ID: '0159-C0082',
        SMPP_PASSWORD: '4DA88FD7',
        PORT: 3001
      },
      interpreter: '/var/www/sms-panel-app/sms-panel/sms-panel/venv/bin/python3'
    }
  ]
} 