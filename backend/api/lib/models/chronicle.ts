export class Chronicle {
    wkn: string;
    capitalChanges: Array<CapitalChange>;
}

export class CapitalChange {
    date: number;
    quantity: number;
    price: number;
}