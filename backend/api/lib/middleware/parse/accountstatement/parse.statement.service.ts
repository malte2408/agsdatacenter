import {URL} from '../../../enums/enums';
import * as request from 'request-promise';
import * as cheerio from 'cheerio';
import {
    BondStatement,
    CertificateStatement,
    CreditStatement,
    DividendStatement,
    OtherStatement,
    Statement, StockStatement
} from '../../../models';
import {Observable} from 'rxjs'
import {HelperService} from "../helper/helper.service";

export class ParseStatementService {

    private helperService = new HelperService();
    private authData: JSON;

    constructor(authData: JSON) {
        this.authData = authData;
    }

    public get(wkn: string, toDb: string): Observable<Statement> {

        return Observable.create(observer => {
            request.get({
                url: URL.ACCOUNT_STATEMENT + wkn, headers: {
                    'Cookie': this.authData
                },
                encoding: 'latin1'
            }, (aError: Error, aResponse: Response, aBody: any): void => {

                let statement: Statement = new Statement();

                const bonds: Array<BondStatement> = [];
                const credits: Array<CreditStatement> = [];
                const dividends: Array<DividendStatement> = [];
                const other: Array<OtherStatement> = [];
                const certificates: Array<CertificateStatement> = [];
                const stocks: Array<StockStatement> = [];

                const $ = cheerio.load(aBody);

                const table = $('#kontoauszug');
                let rows = $('tr', table).toArray();
                rows = rows.slice(1, rows.length);

                rows.forEach((aRow: CheerioElement) => {
                    let cells = $('td', aRow).toArray();

                    switch ($(cells[2]).text()) {
                        case 'Kredite':
                            credits.push(this.parseCredit(cells, $, wkn));
                            break;
                        case 'Anleihen':
                            bonds.push(this.parseBond(cells, $, wkn));
                            break;
                        case 'Zertifikate':
                            certificates.push(this.parseCertificates(cells, $, wkn));
                            break;
                        case 'Aktien':
                            stocks.push(this.parseStocks(cells, $, wkn));
                            break;
                        case 'Sonstiges':
                            other.push(this.parseOther(cells, $, wkn));
                            break;
                        case 'Dividenden':
                            dividends.push(this.parseDividends(cells, $, wkn));
                            break;
                        default:
                            break;
                    }
                });

                statement.bonds = bonds;
                statement.credits = credits;
                statement.certificates = certificates;
                statement.other = other;
                statement.dividends = dividends;
                statement.stocks = stocks;
                statement.wkn = wkn;

                observer.next(statement);

                if (toDb === 'true') {
                    request({
                        uri: 'http://localhost:' + process.env.PORT + process.env.API + '/statement?key=' + process.env.DB_KEY,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(statement)
                    });
                }
            });
        });
    };

    private parseCredit(aRow: CheerioElement[], $: CheerioStatic, wkn: string): CreditStatement {
        const credit: CreditStatement = new CreditStatement();
        credit.id = this.helperService.formatNumber($(aRow[0]).text());
        credit.datetime = this.helperService.formatDatetime($(aRow[1]).text());
        credit.volume = this.helperService.formatNumber($(aRow[3]).text());
        credit.wkn = wkn;

        return credit;
    }

    private parseBond(aRow: CheerioElement[], $: CheerioStatic, wkn: string): BondStatement {
        const bond: BondStatement = new BondStatement();
        bond.id = this.helperService.formatNumber($(aRow[0]).text());
        bond.datetime = this.helperService.formatDatetime($(aRow[1]).text());
        bond.volume = this.helperService.formatNumber($(aRow[3]).text());
        bond.wkn = wkn;

        return bond;
    }

    private parseCertificates(aRow: CheerioElement[], $: CheerioStatic, wkn: string): CertificateStatement {
        const certificate = new CertificateStatement();
        certificate.id = this.helperService.formatNumber($(aRow[0]).text());
        certificate.datetime = this.helperService.formatDatetime($(aRow[1]).text());
        certificate.volume = this.helperService.formatNumber($(aRow[3]).text());
        certificate.call = $(aRow[4]).text().split('(')[1].split(')')[0] === 'CALL';
        certificate.leverage =  this.helperService.formatInterest($(aRow[4]).text().split('Hebel ')[1].split(' ')[0]);
        certificate.wkn = wkn;

        return certificate;
    }

    private parseStocks(aRow: CheerioElement[], $: CheerioStatic, wkn: string): StockStatement {
        const stock: StockStatement = new StockStatement();
        stock.id = this.helperService.formatNumber($(aRow[0]).text());
        stock.datetime = this.helperService.formatDatetime($(aRow[1]).text());
        let volume = this.helperService.formatNumber($(aRow[3]).text());
        if (volume >= 0) {
            stock.quantity = this.helperService.formatNumber($(aRow[4]).text().split(' ')[1]);
        } else {
            stock.quantity = -1 * this.helperService.formatNumber($(aRow[4]).text().split(' ')[1]);
        }

        stock.price = this.helperService.formatNumber($(aRow[4]).text().split(' ')[$(aRow[4]).text().split(' ').length - 1]);
        stock.tradedShare = this.helperService.hrefToWknString($(aRow[4]).text().split(' ')[3]);
        stock.trader = wkn;

        return stock;

    }

    private parseOther(aRow: CheerioElement[], $: CheerioStatic, wkn: string): OtherStatement {
        const other: OtherStatement = new OtherStatement();
        other.id = this.helperService.formatNumber($(aRow[0]).text());
        other.datetime = this.helperService.formatDatetime($(aRow[1]).text());
        other.volume = this.helperService.formatNumber($(aRow[3]).text());
        other.text = $(aRow[4]).text();
        other.wkn = wkn;

        return other;
    }

    private parseDividends(aRow: CheerioElement[], $: CheerioStatic, wkn: string): DividendStatement {
        const dividend: DividendStatement = new DividendStatement();
        dividend.id = this.helperService.formatNumber($(aRow[0]).text());
        dividend.datetime = this.helperService.formatDatetime($(aRow[1]).text());
        dividend.value = this.helperService.formatNumber($(aRow[3]).text());
        dividend.wkn = wkn;

        return dividend;
    }
}
