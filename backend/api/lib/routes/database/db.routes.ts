import {postProfile, getProfile, getProfiles} from "./profile/profile.routes";
import {getTrades, postTrades} from "./trades/trades.routes";
import {getPortfolio, getPortfolios, postPortfolio} from "./portfolio/portfolio.routes";
import {getIndex, getIndices, postIndex} from "./index/agsindex.routes";
import {
    getAccountStatement,
    getAccountStatements,
    postAccountStatement
} from "./accountstatement/accountstatement.routes";
import {getChronicle, postChronicle} from "./chronicle/chronicle.routes";
import {getAGSX} from "./agsx/agsx.routes";
import {getPrices} from "./price/price.routes";

export class DbRoutes {

    public routes(app): void {
        app.route(process.env.API + '/profile')
            .get(getProfile)
            .post(postProfile);

        app.route(process.env.API + '/profiles')
            .get(getProfiles);

        app.route(process.env.API + '/trades')
            .post(postTrades)
            .get(getTrades);

        app.route(process.env.API + '/portfolio')
            .get(getPortfolio)
            .post(postPortfolio);

        app.route(process.env.API + '/portfolios')
            .get(getPortfolios);

        app.route(process.env.API + '/indices')
            .get(getIndices);

        app.route(process.env.API + '/index')
            .post(postIndex)
            .get(getIndex);

        app.route(process.env.API + '/statement')
            .post(postAccountStatement)
            .get(getAccountStatement);

        app.route(process.env.API + '/statements')
            .get(getAccountStatements);

        app.route(process.env.API + '/chronicle')
            .post(postChronicle)
            .get(getChronicle);

        app.route(process.env.API + '/price')
            .get(getPrices)

        app.route(process.env.API + '/agsx')
            .get(getAGSX)
    }
}