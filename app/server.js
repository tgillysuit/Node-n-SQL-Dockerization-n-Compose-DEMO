// Server file
import express from 'express';
import { initDb } from './database/db.js';
import router from './router/router.js';

const app = express();
app.use(express.json);

await initDb();

app.use('/', router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});