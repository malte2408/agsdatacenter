import {Component, OnInit} from '@angular/core';
import {ProfileService} from "../../services/profile/profile.service";
import {Profile} from "../../models/profile.model";
import {CurrencyPipe} from "@angular/common";
import {DatePipe} from "@angular/common";
import {ActivatedRoute} from "@angular/router";
import {Trade} from "../../models/trade.profile";
import {TradesService} from "../../services/trades/trades/trades.service";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

    profiles: Profile[] = [];
    trades: Trade[] = [];
    handelsvolumen: number;

    constructor(
        private profileService: ProfileService,
        private tradeService: TradesService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            let wkn: string = params.get("wkn");
            this.profileService.getProfile(wkn).subscribe((profiles: Profile[]) => {
                this.profiles = profiles.sort((val1, val2) => {
                    return val2.date - val1.date
                });
            });

            this.tradeService.getTrades(wkn, undefined, '30').subscribe((trades: Trade[]) => {
                this.trades = trades;
                this.handelsvolumen = this.trades.reduce<number>((acc, val) => {
                    acc += val.quantity * val.price;
                    return acc
                }, 0);
            });
        });
    }

}
