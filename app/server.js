// Server file
import express from 'express';
import { initDb } from './database/db.js';
import router from './router/router.js';

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

await initDb();

app.use('/', router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});