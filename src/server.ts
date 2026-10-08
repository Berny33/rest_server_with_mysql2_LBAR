import express, { Application } from 'express';
import apiRoutes from './routes'; 

class Server {
    private app: Application;
    private port: string;
    private apiPaths = {
        v1: '/api/v1'
    };

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '3000';
        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.app.use(express.json());
    }

    routes() {
        // Aquí le decimos a Express que todas nuestras rutas 
        // tendrán el prefijo /api/v1
        this.app.use(this.apiPaths.v1, apiRoutes);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Servidor corriendo en el puerto ${this.port}`);
        });
    }
}

export default Server;