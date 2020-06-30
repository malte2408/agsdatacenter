import {URL} from '../../../enums/enums';
import * as request from 'request-promise';
import * as cheerio from 'cheerio';
import {Observable} from 'rxjs'
import {HelperService} from "../helper/helper.service";
import {Order} from "../../../models";

export class ParseOrderbookService {

    private helperService = new HelperService();
    private authData: JSON;

    constructor(authData: JSON) {
        this.authData = authData;
    }

    public get(wkn: string): Observable<Array<Order>> {

        return Observable.create(observer => {
            request.get({
                url: URL.ORDERBOOK + wkn, headers: {
                    'Cookie': this.authData
                },
                encoding: 'latin1'
            }, (aError: Error, aResponse: Response, aBody: any): void => {

                const orders: Array<Order> = [];

                const $ = cheerio.load(aBody);

                const table = $('#orderbuch');
                let rows = $('tr', table).toArray();
                rows = rows.slice(1, rows.length);

                rows.forEach((aRow: CheerioElement) => {
                    let order = new Order();

                    let cells = $('td', aRow).toArray();

                    order.quantity = this.helperService.formatNumber($(cells[0]).text());
                    order.buy = $('span', cells[1]).text() === 'BUY';
                    order.price = this.helperService.formatNumber($(cells[2]).text());
                    order.datetime = this.helperService.formatDatetime($(cells[2]).text());
                    order.wkn = + wkn;

                    orders.push(order);
                });
                observer.next(orders);
            });
        });
    };
}
