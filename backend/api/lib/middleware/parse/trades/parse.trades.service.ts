import {URL} from '../../../enums/enums';
import * as request from 'request-promise';
import * as cheerio from 'cheerio';
import {Observable} from 'rxjs'
import {HelperService} from "../helper/helper.service";
import {Trade} from "../../../models/trade";

export class ParseTradesService {

    private helperService = new HelperService();
    private authData: JSON;

    constructor(authData: JSON) {
        this.authData = authData;
    }

    public get(wkn: string, toDb: string): Observable<Array<Trade>> {

        return Observable.create(observer => {
            request.get({
                url: URL.TRADES + wkn, headers: {
                    'Cookie': this.authData
                },
                encoding: 'latin1'
            }, (aError: Error, aResponse: Response, aBody: any): void => {

                const trades: Array<Trade> = [];

                const $ = cheerio.load(aBody);

                const table = $('#kaeufer');
                let rows = $('tr', table).toArray();
                rows = rows.slice(1, rows.length);

                rows.forEach((aRow: CheerioElement) => {
                    let trade = new Trade();

                    let cells = $('td', aRow).toArray();

                    trade.orderId = this.helperService.formatNumber($(cells[0]).text());
                    trade.datetime = this.helperService.formatDatetime($(cells[1]).text());
                    trade.buy = $('span', cells[2]).text() === 'BUY';
                    trade.quantity = this.helperService.formatNumber($(cells[3]).text());
                    trade.price = this.helperService.formatNumber($(cells[4]).text());
                    const trader = $('a', cells[6]).attr('href');
                    if (trader) {
                        trade.trader = this.helperService.hrefToWkn(trader);
                    } else {
                        trade.trader = 0;
                    }
                    trade.tradedShare = + wkn;

                    trades.push(trade);
                });
                observer.next(trades);

                if (toDb === 'true') {
                    request({
                        uri: 'http://localhost:' + process.env.PORT + process.env.API + '/trades?key=' + process.env.DB_KEY,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(trades)
                    });
                }
            });
        });
    };
}
