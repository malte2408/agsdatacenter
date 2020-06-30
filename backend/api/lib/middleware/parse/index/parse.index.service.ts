import {URL} from '../../../enums/enums';
import * as request from 'request-promise';
import * as cheerio from 'cheerio';
import {Observable} from 'rxjs'
import {HelperService} from "../helper/helper.service";
import {AgsIndex} from "../../../models";

export class ParseIndexService {

    public profile: Observable<AgsIndex>;

    private helperService = new HelperService();
    private authData: JSON;

    constructor(authData: JSON) {
        this.authData = authData;
    }

    public get(id: string, toDb: string): Observable<AgsIndex> {

        return Observable.create(observer => {
            request.get({
                url: URL.INDEX + id,
                headers: {
                    'Cookie': this.authData
                },
                encoding: 'latin1'
            }, (aError: Error, aResponse: Response, aBody: any): void => {
                const index = new AgsIndex();

                const $ = cheerio.load(aBody);

                index.id = id;
                index.date = this.helperService.formatToday();
                index.name = $('h1' ,'#contentside').text();
                index.highscore = this.helperService.formatNumber($('span' ,'#highscore').text());

                observer.next(index);

                if (toDb === 'true') {
                    request({
                        uri: 'http://localhost:' + process.env.PORT + process.env.API + '/index?key=' + process.env.DB_KEY,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(index)
                    });
                }
            });
        });
    };
}
