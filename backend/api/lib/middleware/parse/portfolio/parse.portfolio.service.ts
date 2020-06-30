import {URL} from '../../../enums/enums';
import * as request from 'request-promise';
import * as cheerio from 'cheerio';
import {Portfolio, StockPosition, Bond, Certificate, Credit} from '../../../models';
import {Observable} from 'rxjs'
import {HelperService} from "../helper/helper.service";

export class ParsePortfolioService {

    private helperService = new HelperService();

    constructor(private authData: JSON) {}

    public get(wkn: string, toDb: string): Observable<Portfolio> {

        return Observable.create(observer => {
            request.get({
                url: URL.PORTFOLIO + wkn, headers: {
                    'Cookie': this.authData
                },
                encoding: 'latin1'
            }, (aError: Error, aResponse: Response, aBody: any): void => {

                const portfolio = new Portfolio();
                let stocks: Array<StockPosition> = [];
                let bonds: Array<Bond> = [];
                let credits: Array<Credit> = [];
                let certificates: Array<Certificate> = [];

                const $ = cheerio.load(aBody);

                let rows = $('tr', '#depotExt');
                rows.slice(1, rows.length).toArray().forEach((row: CheerioElement) => {
                    let stock = new StockPosition();

                    stock.wkn = + $('a',$('td', row)[0]).text().slice(0, 6);
                    stock.quantity = + this.helperService.formatNumber($($('td', row)[1]).text());

                    stocks.push(stock);
                });

                rows = $('tr', '#depotAnleihen');
                rows.slice(1, rows.length).toArray().forEach((row: CheerioElement) => {
                    let bond = new Bond();
                    bond.wkn=wkn;

                    bond.volume = this.helperService.formatNumber($($('td', row)[0]).text());
                    bond.interestRate = this.helperService.formatInterest($($('td', row)[1]).text());
                    bond.duration = this.helperService.formatNumber($($('td', row)[4]).text());
                    bond.id = $(row).attr('anleihenid');

                    bond.paybackDate = this.helperService.formatDatetime($($('td', row)[6]).text());

                    bond.normInterestRate = bond.interestRate / Math.max(0.015,(Math.min((100000 / bond.volume),1) + bond.duration * 0.041 - (0.3*(Math.sqrt(bond.volume/10)/10000))));
                    bond.scraped = this.helperService.formatToday();

                    bonds.push(bond);
                });

                rows = $('tr', '#depotKredite');

                rows.slice(1, rows.length).toArray().forEach((row: CheerioElement) => {
                    let credit = new Credit();
                    credit.wkn = wkn;

                    credit.volume = this.helperService.formatNumber($($('td', row)[0]).text());
                    credit.interestRate = this.helperService.formatInterest($($('td', row)[1]).text());
                    credit.duration = this.helperService.formatNumber($($('td', row)[4]).text());
                    credit.paybackDate = this.helperService.formatDatetime($($('td', row)[6]).text());
                    credit.scraped = this.helperService.formatToday();

                    credits.push(credit);
                });

                rows = $('tr', '#depotZertis');

                rows.slice(1, rows.length).toArray().forEach((row: CheerioElement) => {
                    let certificate = new Certificate();
                    certificate.wkn = wkn;

                    certificate.volume = this.helperService.formatNumber($($('td', row)[0]).text());
                    certificate.leverage = this.helperService.formatInterest($($('td', row)[1]).text());
                    certificate.call = $($('td', row)[2]).text().includes('call');
                    certificate.paybackDate = this.helperService.formatDatetime($($('td', row)[4]).text());

                    certificates.push(certificate)
                });

                portfolio.stocks = stocks;
                portfolio.bonds = bonds;
                portfolio.certificates = certificates;
                portfolio.credits = credits;

                portfolio.wkn = wkn;

                observer.next(portfolio);

                if (toDb === 'true') {
                    request({
                        uri: 'http://localhost:' + process.env.PORT + process.env.API + '/portfolio?key=' + process.env.DB_KEY,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(portfolio)
                    });
                }
            });
        });
    };
}