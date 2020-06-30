import * as express from "express";
import * as bodyParser from "body-parser";
import {AgsRoutes} from "./routes/index";
import {DbRoutes} from "./routes/database/db.routes";

require('dotenv').config();

class App {

    public app: express.Application;
    public agsRoutes: AgsRoutes = new AgsRoutes();
    public dbRoutes: DbRoutes = new DbRoutes();

    constructor() {
        this.app = express();
        this.config();
        this.agsRoutes.routes(this.app);
        this.dbRoutes.routes(this.app);
    }

    private config(): void {
        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({extended: false}));
    }

}

export default new App().app;

