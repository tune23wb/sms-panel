import multiprocessing

# Server socket
bind = "127.0.0.1:3001"  # Only bind to localhost
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'
worker_connections = 1000
timeout = 30
keepalive = 2

# Logging
accesslog = 'gunicorn_access.log'
errorlog = 'gunicorn_error.log'
loglevel = 'info'

# Process naming
proc_name = 'sms-panel-smp'

# Server mechanics
daemon = False
pidfile = 'gunicorn.pid'
umask = 0o022
user = None
group = None
tmp_upload_dir = None

# SSL
keyfile = None
certfile = None 