import {Request, Response} from "express";
import {ParseProfileService} from "../../middleware/parse/profile/parse.profile.service";
import {ParsePortfolioService} from "../../middleware/parse/portfolio/parse.portfolio.service";
import {ParseAuthorizationService} from "../../middleware/parse/authorization/parse.authorization.service";
import {Portfolio, Profile, Trade, Order, AgsIndex, Chronicle, Statement} from "../../models";
import {ParseTradesService} from "../../middleware/parse/trades/parse.trades.service";
import {ParseOrderbookService} from "../../middleware/parse/orderbook/parse.orderbook.service";
import {ParseWknListService} from "../../middleware/parse/wknlist/parse.wknlist.service";
import {HelperService} from "../../middleware/parse/helper/helper.service";
import {ParseIndexService} from "../../middleware/parse/index/parse.index.service";
import {ParseChronicle} from "../../middleware/parse/chronicle/parse.chronicle";
import {ParseStatementService} from "../../middleware/parse/accountstatement/parse.statement.service";

export class AgsRoutes {

    private authorizationService: ParseAuthorizationService = new ParseAuthorizationService();
    private parseProfileService: ParseProfileService;
    private parsePortfolioService: ParsePortfolioService;
    private parseTradesService: ParseTradesService;
    private parseOrderService: ParseOrderbookService;
    private parseWknListService: ParseWknListService;
    private helperService: HelperService;
    private parseIndexService: ParseIndexService;
    private parseChronicleService: ParseChronicle;
    private parseStatementService: ParseStatementService;

    public authData: JSON;

    constructor() {
        this.authorizationService.authorize(process.env.USERNAME, process.env.PASSWORD)
            .subscribe((data: JSON) => {
                this.authData = data;
                this.parseProfileService = new ParseProfileService(this.authData);
                this.parsePortfolioService = new ParsePortfolioService(this.authData);
                this.parseTradesService = new ParseTradesService(this.authData);
                this.parseOrderService = new ParseOrderbookService(this.authData);
                this.parseWknListService = new ParseWknListService(this.authData);
                this.parseIndexService = new ParseIndexService(this.authData);
                this.parseChronicleService = new ParseChronicle(this.authData);
                this.parseStatementService = new ParseStatementService(this.authData);
                this.helperService = new HelperService();
            });
    }


    public routes(app): void {
        app.route('/')
            .get((req: Request, res: Response) => {
                res.status(200).send({
                    message: 'GET request successfulll!'
                })
            });

        app.route(process.env.API + '/ags/profile')
            .get((aRequest: Request, aResponse: Response) => {
                if (aRequest.query.key !== process.env.AGS_KEY) {
                    aResponse.status(401).send('Permission denied!');
                } else {
                    this.parseProfileService.get(aRequest.query.wkn, aRequest.query.db)
                        .subscribe((profile: Profile) => {
                            aResponse.send(profile);
                        });
                }
            });

        app.route(process.env.API + '/ags/portfolio')
            .get((aRequest: Request, aResponse: Response) => {
                if (aRequest.query.key !== process.env.AGS_KEY) {
                    aResponse.status(401).send('Permission denied!');
                } else {
                    this.parsePortfolioService.get(aRequest.query.wkn, aRequest.query.db)
                        .subscribe((portfolio: Portfolio) => {
                            aResponse.send(portfolio);
                        });
                }
            });

        app.route(process.env.API + '/ags/trades')
            .get((aRequest: Request, aResponse: Response) => {
                if (aRequest.query.key !== process.env.AGS_KEY) {
                    aResponse.status(401).send('Permission denied!');
                } else {
                    this.parseTradesService.get(aRequest.query.wkn, aRequest.query.db)
                        .subscribe((trades: Array<Trade>) => {
                            aResponse.send(trades);
                        });
                }
            });

        app.route(process.env.API + '/ags/orderbook')
            .get((aRequest: Request, aResponse: Response) => {
                if (aRequest.query.key !== process.env.AGS_KEY) {
                    aResponse.status(401).send('Permission denied!');
                } else {
                    this.parseOrderService.get(aRequest.query.wkn)
                        .subscribe((orders: Array<Order>) => {
                            aResponse.send(orders);
                        });
                }
            });

        app.route(process.env.API + '/ags/wknlist')
            .get((aRequest: Request, aResponse: Response) => {
                if (aRequest.query.key !== process.env.AGS_KEY) {
                    aResponse.status(401).send('Permission denied!');
                } else {
                    this.parseWknListService.get()
                        .subscribe((wkns: Array<number>) => {
                            aResponse.send(wkns);
                        });
                }
            });

        app.route(process.env.API + '/ags/index')
            .get((aRequest: Request, aResponse: Response) => {
                if (aRequest.query.key !== process.env.AGS_KEY) {
                    aResponse.status(401).send('Permission denied!');
                } else {
                    this.parseIndexService.get(aRequest.query.id, aRequest.query.db)
                        .subscribe((index: AgsIndex) => {
                            aResponse.send(index);
                        });
                }
            });

        app.route(process.env.API + '/ags/chronicle')
            .get((aRequest: Request, aResponse: Response) => {
                if (aRequest.query.key !== process.env.AGS_KEY) {
                    aResponse.status(401).send('Permission denied!');
                } else {
                    this.parseChronicleService.get(aRequest.query.wkn, aRequest.query.db)
                        .subscribe((chronicle: Chronicle) => {
                            aResponse.send(chronicle);
                        });
                }
            });

        app.route(process.env.API + '/ags/statement')
            .get((aRequest: Request, aResponse: Response) => {
                if (aRequest.query.key !== process.env.AGS_KEY) {
                    aResponse.status(401).send('Permission denied!');
                } else {
                    this.parseStatementService.get(aRequest.query.wkn, aRequest.query.db)
                        .subscribe((statement: Statement) => {
                            aResponse.send(statement);
                        });
                }
            });
    }
}