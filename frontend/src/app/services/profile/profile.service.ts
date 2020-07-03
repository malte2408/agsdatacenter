import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Profile} from "../../models/profile.model";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    constructor(private http: HttpClient) {
    }

    public getProfile(wkn: string, days: string='365'): Observable<Profile[]> {

        return this.http.get<Profile[]>('https://agsdatacenter.de/dev/profile?wkn=' + wkn + '&days=' + days)
    }


}
