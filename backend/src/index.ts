import 'dotenv/config';
import app from './app';
import { startWorker } from './worker/emailWorker';

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startWorker(); // Start BullMQ worker in the same process
});
