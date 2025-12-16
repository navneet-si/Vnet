import express from 'express';
import LoginRoutes from './routes/login.js';
import SiginupRoutes from './routes/signup.js';
const app=express();
app.use(express.json());


app.use('/api/login',LoginRoutes);
app.use('/api/signup',SiginupRoutes);

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});