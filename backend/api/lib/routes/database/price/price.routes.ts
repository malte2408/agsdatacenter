import {Request, Response} from "express";
import {MongoClient, Db} from "mongodb";

export function getPrices(aRequest: Request, aResponse: Response) {
    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            dbo.collection("trades").find({tradedShare: Number(aRequest.query.wkn), buy: true}, {fields: {price: 1, datetime: 1}}).toArray((err, result) => {
                aResponse.send(result);
            });
        });
    }
}