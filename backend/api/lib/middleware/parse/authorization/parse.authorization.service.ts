import {Observable} from "rxjs";
import * as request from 'request-promise';

export class ParseAuthorizationService {
    public cookie: string;

    public authorize(username, password): Observable<JSON> {
        let base_url = 'https://www.ag-spiel.de/';
        let login_url = base_url + 'index.php?section=login';
        let login_data = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36',
            'username': username,
            'userpass': password,
            'permanent': '1',
            'login': 'Einloggen',
        };

        return Observable.create(observer => {
            request.post(login_url, {
                form: login_data,
                resolveWithFullResponse: true
            })
            .then((aResponse) => {
                this.cookie = aResponse.headers['set-cookie'][0];
                console.log('LOGIN');
                observer.next(this.cookie + ';' + 'ag-spiel=' + process.env.COOKIE);
            });
        });
    }
}