}module.exports = {
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
        SMPP_SOURCE_ADDR: '45578',
        DATABASE_URL:"file:./dev.db"
        NEXTAUTH_SECRET="caed5fa4b7ea8f2cca6d5c07fbac89f5df3d8b01d5298ed0cdb3ce1d623b82ef"
        NEXTAUTH_URL="https://https://quantumhub.mx"
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'sms-panel-smp',
      script: 'services/smpp/smpp_http_service.py',
      interpreter: '/var/www/sms-panel-app/sms-panel/sms-panel/venv/bin/python3',
      interpreter_args: '-u',
      env: {
        PYTHONPATH: '/var/www/sms-panel-app/sms-panel/sms-panel',
        SMPP_HOST: '114.199.74.35',
        SMPP_PORT: '2775',
        SMPP_SYSTEM_ID: 'XQB0213MKT',
        SMPP_PASSWORD: 'fS5cgh26',
        SMPP_SOURCE_ADDR: '45578',
        PORT: '3001'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    } 
