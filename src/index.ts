import app from './app';
import config from './env';
import { logger } from './helpers/logger.helper';

const port = config.PORT;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT. Closing server gracefully...');
  server.close(() => {
    logger.info('Server closed gracefully.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM. Closing server gracefully...');
  server.close(() => {
    logger.info('Server closed gracefully.');
    process.exit(0);
  });
});
