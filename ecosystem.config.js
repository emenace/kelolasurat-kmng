module.exports = {
  apps: [
    {
      name: 'kemenag-surat',
      script: 'server.js',

      // Execution mode: use 'fork' with 1 instance for SQLite file locking safety
      exec_mode: 'fork',
      instances: 1,

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },

      // Reliability & memory safeguards
      max_memory_restart: '350M',
      autorestart: true,
      watch: false,

      // Restart delay/backoff to prevent rapid crash loops
      exp_backoff_restart_delay: 100,
      max_restarts: 10,

      // Logging configuration
      merge_logs: true,
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      time: true
    }
  ]
};
