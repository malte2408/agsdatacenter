import {URL} from '../../../enums/enums';
import * as request from 'request-promise';
import * as cheerio from 'cheerio';
import {Observable} from 'rxjs'
import {HelperService} from "../helper/helper.service";

export class ParseWknListService {

    private helperService = new HelperService();
    private authData: JSON;

    constructor(authData: JSON) {
        this.authData = authData;
    }

    public get(): Observable<Array<number>> {

        return Observable.create(observer => {
            request.get({
                url: URL.WKN_LIST, headers: {
                    'Cookie': this.authData
                }
            }, (aError: Error, aResponse: Response, aBody: any): void => {

                const wkns: Array<number> = [];

                const $ = cheerio.load(aBody);

                const rows = $('.aglistentry').toArray();

                rows.forEach((aRow: CheerioElement) => {
                    let wkn = this.helperService.hrefToWkn($('a', aRow).attr('href'));

                    wkns.push(wkn);
                });
                observer.next(wkns);
            });
        });
    };
}
