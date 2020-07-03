import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ProfileService} from "../../services/profile/profile.service";
import {Profile} from "../../models/profile.model";
import {CurrencyPipe, DecimalPipe} from "@angular/common";
import {DatePipe} from "@angular/common";
import {ActivatedRoute} from "@angular/router";
import {Trade} from "../../models/trade.profile";
import {TradesService} from "../../services/trades/trades/trades.service";
import {NgZone } from "@angular/core";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {

    profiles: Profile[] = [];
    trades: Trade[] = [];
    handelsvolumen: number;
    activity: number;
    liquidity: number;
    private chart: am4charts.XYChart;

    constructor(
        private profileService: ProfileService,
        private tradeService: TradesService,
        private route: ActivatedRoute,
        private zone: NgZone
    ) {
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            let wkn: string = params.get("wkn");
            this.profileService.getProfile(wkn).subscribe((profiles: Profile[]) => {
                this.profiles = profiles.sort((val1, val2) => {
                    return val2.date - val1.date
                });

                this.tradeService.getTrades(wkn, undefined, '300').subscribe((trades: Trade[]) => {
                    this.trades = trades;
                    this.handelsvolumen = this.trades.reduce<number>((acc, val) => {
                        acc += val.quantity * val.price;
                        return acc
                    }, 0);
                    if (this.profiles[0]) {
                        this.activity = Math.round((this.handelsvolumen / (this.profiles[0].cashTotal + this.profiles[0].portfolioValue)) * 100)
                    }

                    this.createChart();
                });

                this.tradeService.getTrades(undefined, wkn, '300').subscribe((trades: Trade[]) => {
                    let gehandelteAktien = trades.reduce<number>((acc, val) => {
                        acc += val.quantity;
                        return acc
                    }, 0);
                    if (this.profiles[0]) {
                        this.liquidity = Math.round((gehandelteAktien / (this.profiles[0].sharesOutstanding) / 2) * 100)
                    }
                });

            });
        });
    }

    createChart() {
        this.zone.runOutsideAngular(() => {
            let chart = am4core.create("chartdiv", am4charts.XYChart);

            chart.paddingRight = 20;

            let data = [];
            let visits = 10;
            for (let i = 1; i < this.profiles.length; i++) {
                data.push({
                    date: new Date(this.profiles[i-1].date * 1000),
                    name: "name" + i,
                    value: (this.profiles[i - 1].portfolioValue + this.profiles[i - 1].cashTotal) / this.profiles[i-1].sharesOutstanding / this.profiles[i-1].price
                });
            }

            chart.data = data;

            let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.grid.template.location = 0;

            let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            valueAxis.renderer.minWidth = 35;

            let series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.dateX = "date";
            series.dataFields.valueY = "value";

            series.tooltipText = "{valueY.value}";
            chart.cursor = new am4charts.XYCursor();

            series.strokeWidth = 2;

            this.chart = chart;
        });

        this.zone.runOutsideAngular(() => {
            let chart = am4core.create("agsx_punkte", am4charts.XYChart);

            chart.paddingRight = 20;

            let data = [];
            let visits = 10;
            for (let i = 1; i < this.profiles.length; i++) {

                let rolling = 0;
                if (i) {
                    for (let profile of this.profiles.slice(i-31, i-1)) {
                        rolling = rolling + profile.agsx / 30;
                    }
                }
                data.push({
                    date: new Date(this.profiles[i-1].date * 1000),
                    name: "name" + i,
                    value: [rolling]
                });
            }

            chart.data = data;

            let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.grid.template.location = 0;

            let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            valueAxis.renderer.minWidth = 35;

            let series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.dateX = "date";
            series.dataFields.valueY = "value";

            series.tooltipText = "{valueY.value}";
            chart.cursor = new am4charts.XYCursor();

            series.strokeWidth = 2;

            this.chart = chart;
        });

    }

    ngOnDestroy() {
        this.zone.runOutsideAngular(() => {
            if (this.chart) {
                this.chart.dispose();
            }
        });
    }

}
