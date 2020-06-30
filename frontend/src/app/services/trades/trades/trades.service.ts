import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {Trade} from "../../../models/trade.profile";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TradesService {

  constructor(private http: HttpClient) { }

  getTrades(trader: string = undefined, tradedShare: string = undefined, days: string=undefined): Observable<Trade[]>{
    let url = 'https://agsdatacenter.de/dev/trades?';

    if (trader) {
      url = url + '&trader=' + trader;
    }

    if (tradedShare) {
        url = url + '&tradedShare=' + tradedShare;
    }

    if (days) {
        url = url + '&days=' + days;
    }

    return this.http.get<Trade[]>(url)
  }

}
