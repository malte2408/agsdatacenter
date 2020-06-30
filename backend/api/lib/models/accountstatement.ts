export class Statement {
    wkn: string;
    stocks: Array<StockStatement>;
    dividends: Array<DividendStatement>;
    bonds: Array<BondStatement>;
    credits: Array<CreditStatement>;
    other: Array<OtherStatement>;
    certificates: Array<CertificateStatement>;
}

export class StockStatement {
    id: number;
    quantity: number;
    price: number;
    tradedShare: string;
    datetime: number;
    trader: string;
}

export class DividendStatement {
    id: number;
    value: number;
    datetime: number;
    wkn: string;
}

export class BondStatement {
    id: number;
    datetime: number;
    volume: number;
    wkn: string;
}

export class CreditStatement {
    id: number;
    datetime: number;
    volume: number;
    wkn: string;
}

export class OtherStatement {
    id: number;
    datetime: number;
    volume: number;
    text: string;
    wkn: string;
}

export class CertificateStatement {
    id: number;
    datetime: number;
    volume: number;
    call: boolean;
    leverage: number;
    wkn: string;
}