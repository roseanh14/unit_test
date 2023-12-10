
import express from 'express';
import listRouter from './routes/list';

const app = express();
const PORT = 5000;

app.use(express.json());

app.use('/lists', listRouter);



const server = app.listen(PORT, () => console.log(`Server is running on port: http://localhost:${PORT}`));

export default server;