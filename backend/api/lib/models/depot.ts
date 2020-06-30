export class Portfolio {
    cash: number;
    stocks: Array<StockPosition>;
    certificates: Array<Certificate>;
    bonds: Array<Bond>;
    credits: Array<Credit>;
    wkn: string;
}

export class StockPosition {
    wkn: number;
    quantity: number;
}

export class Certificate {
    paybackDate: number;
    volume: number;
    leverage: number;
    call: boolean;
    wkn: string;
}

export class Bond {
    volume: number;
    interestRate: number;
    duration: number;
    paybackDate: number;
    id: string;
    normInterestRate: number;
    scraped: number;
    wkn: string;
}

export class Credit {
    volume: number;
    interestRate: number;
    duration: number;
    paybackDate: number;
    scraped: number;
    wkn: string;
}