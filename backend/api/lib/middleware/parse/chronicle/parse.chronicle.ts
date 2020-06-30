import {URL} from '../../../enums/enums';
import * as request from 'request-promise';
import * as cheerio from 'cheerio';
import {Observable} from 'rxjs'
import {HelperService} from "../helper/helper.service";
import {CapitalChange, Chronicle} from "../../../models";

export class ParseChronicle {

    private helperService = new HelperService();
    private authData: JSON;

    constructor(authData: JSON) {
        this.authData = authData;
    }

    public get(wkn: string, toDb: string): Observable<Chronicle> {

        return Observable.create(observer => {
            request.get({
                url: URL.CHRONICLE + wkn, headers: {
                    'Cookie': this.authData
                },
                encoding: 'latin1'
            }, (aError: Error, aResponse: Response, aBody: any): void => {

                const chronicle: Chronicle = new Chronicle();

                const $ = cheerio.load(aBody);

                let table = $('#kes');
                let rows = $('tr', table).toArray();
                rows = rows.slice(1, rows.length - 1);

                let capitalChanges: Array<CapitalChange> = [];

                rows.forEach((aRow: CheerioElement) => {
                    let capitalChange = new CapitalChange();

                    let cells = $('td', aRow).toArray();

                    capitalChange.date = this.helperService.formatDate($(cells[0]).text());
                    capitalChange.quantity = this.helperService.formatNumber($(cells[1]).text());
                    capitalChange.price = this.helperService.formatNumber($(cells[2]).text());

                    capitalChanges.push(capitalChange)
                });

                table = $('#khs');
                rows = $('tr', table).toArray();
                rows = rows.slice(1, rows.length - 1);

                rows.forEach((aRow: CheerioElement) => {
                    let capitalChange = new CapitalChange();

                    let cells = $('td', aRow).toArray();

                    capitalChange.date = this.helperService.formatDate($(cells[0]).text());
                    capitalChange.quantity = this.helperService.formatNumber($(cells[1]).text()) * -1;
                    capitalChange.price = this.helperService.formatNumber($(cells[2]).text());

                    capitalChanges.push(capitalChange)
                });

                chronicle.wkn = wkn;
                chronicle.capitalChanges = capitalChanges;

                observer.next(chronicle);

                if (toDb === 'true') {
                    request({
                        uri: 'http://localhost:' + process.env.PORT + process.env.API + '/chronicle?key=' + process.env.DB_KEY,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(chronicle)
                    });
                }
            });
        });
    };
}
