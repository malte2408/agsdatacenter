import {URL} from '../../../enums/enums';
import * as request from 'request-promise';
import * as cheerio from 'cheerio';
import {Profile} from '../../../models';
import {Observable} from 'rxjs'
import {HelperService} from "../helper/helper.service";

export class ParseProfileService {

    public profile: Observable<Profile>;

    private helperService = new HelperService();
    private authData: JSON;

    constructor(authData: JSON) {
        this.authData = authData;
    }

    public get(wkn: string, toDb: string): Observable<Profile> {

        return Observable.create(observer => {
            request.get({
                url: URL.PROFILE + wkn,
                headers: {
                    'Cookie': this.authData
                },
                encoding: 'latin1'
            }, (aError: Error, aResponse: Response, aBody: any): void => {
                const profile = new Profile();

                const $ = cheerio.load(aBody);

                profile.wkn = wkn;

                profile.bid = this.helperService.formatNumber($('#geldkurs', '#kurs').find('span').text());
                profile.ask = this.helperService.formatNumber($('#briefkurs', '#kurs').find('span').text());
                profile.price = this.helperService.formatNumber($('#handelskurs', '#kurs').find('span').text());
                profile.sw = this.helperService.formatNumber($('#sw', '#kurs').text());
                profile.bbw = this.helperService.formatNumber($('#bbw', '#kurs').text());
                profile.fp = this.helperService.formatNumber($('#fp', '#kurs').text());
                profile.bw = this.helperService.formatNumber($('#bwproaktie', '#kurs').text());
                profile.activity = this.helperService.formatNumber($('#handelsaktivität', '#kurs').text());

                let output: Array<number> = [];
                const performanceBox = $('td', '.normalborder').toArray().forEach((aData: CheerioElement) => {
                    output.push(this.helperService.formatNumber($('span', aData).text()));
                });

                profile.pBw14 = output[2];
                profile.pBw30 = output[4];
                profile.pBw60 = output[6];
                profile.pBw90 = output[8];
                profile.pFp14 = output[12];
                profile.pFp30 = output[14];
                profile.pFp60 = output[16];
                profile.pFp90 = output[18];

                const nameBox = $('h1');

                profile.name = nameBox.text().split(' (')[0];

                let prem_image = $('img', nameBox).attr('src');
                if (prem_image === 'images/premium_gold.png' || prem_image === 'images/premium.png') {
                    profile.premium = true
                }

                const person = $('span','#person').text()
                    .replace('Dieser Spieler ist Admin', '')
                    .replace('Dieser Spieler ist Tutor', '');
                profile.ceo = person.replace('Dieser Spieler ist Admin', '').replace('Dieser Spieler ist Tutor', '');

                const otherBox = $('td', '.padding5').toArray();

                profile.registration = this.helperService.formatDate($(otherBox[1]).text());
                profile.foundation = this.helperService.formatDate($(otherBox[3]).text());
                profile.sharesOutstanding = this.helperService.formatNumber($(otherBox[5]).text());
                profile.growthHighscore = this.helperService.formatNumber($(otherBox[11]).text());
                profile.sizeHighscore = this.helperService.formatNumber($(otherBox[13]).text());
                profile.acquirable = $(otherBox[17]).text() === 'ja' ? false : true;
                profile.agsx = this.helperService.formatNumber($(otherBox[23]).text());

                const member_of = $('a','.member_of').toArray();
                if ($(member_of[member_of.length - 1]).attr('href')) {
                    profile.index = $(member_of[member_of.length - 1]).attr('href').split('id=')[1];
                }

                const historyBox = $('tr', '#tagesBilanz').toArray();
                const cells = $('td', historyBox[1]);

                profile.portfolioValue = this.helperService.formatNumber($(cells[1]).text());
                profile.cashTotal = this.helperService.formatNumber($(cells[2]).text());

                profile.date = this.helperService.formatToday();
                observer.next(profile);

                if (toDb === 'true') {
                    request({
                        uri: 'http://localhost:' + process.env.PORT + process.env.API + '/profile?key=' + process.env.DB_KEY,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(profile)
                    });
                }
            });
        });
    };
}
