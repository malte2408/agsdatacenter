import * as moment from 'moment';
import {Observable} from "rxjs";

export class HelperService {

    public wait: Observable<boolean> = new Observable(observer => observer.next(false));

    public formatNumber(input: string): number {
        let value = input.replace('.', '').replace('.', '')
            .replace('.', '').replace('.', '').replace(',', '.')
            .replace('€', '').replace(' ', '')
            .replace('/n', '').replace('SW/Aktie(?)','')
            .replace('BBW(?)', '').replace('FP/Aktie(?)', '')
            .replace('BW/Aktie(?)', '').replace('Aktivität(?)', '')
            .replace('%', '').replace('Stk', '')
            .replace('Platz', '').replace('Tage', '')
            .replace('Tag', '').replace('#', '')
            .replace('(B)', '').replace('(G)', '');

        if (value.includes('letzterH')) {
            value = value.split('letzter')[0];
        }

        if (value === '' || !value) {
            return undefined;
        } else {
            return + value;
        }
    }

    public formatDate(input: string): number {
        let m = moment(input, "DD.MM.YYYY");
        this.formatToday();
        return m.unix()
    }

    public formatInterest(input: string): number {
        return + input.replace('%', '');
    }

    public formatDatetime(input: string): number {
        let data = input.split(' ');
        let newString = data[0] + ' ' + data [2];
        return moment(newString, "DD.MM.YYYY HH:mm:ss").unix();
    }

    public hrefToWkn(input: string): number {
        return + input.split('aktie=')[1];
    }

    public hrefToWknString(input: string): string {
        return input.split('aktie=')[1];
    }

    public formatToday(): number {
        return moment().locale('de').set({hours: 0, minutes: 0, seconds: 0, milliseconds: 0}).unix();
    }

    public days(input: number) {
        return input * 60 * 60 * 24;
    }

    public waitASecound(): void {
        this.wait = new Observable(observer => {
           observer.next(true);
           setTimeout(() => {
              observer.next(false);
           }, 100);
        });
    }
}