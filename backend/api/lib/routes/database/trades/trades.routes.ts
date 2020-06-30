import {MongoClient, Db} from "mongodb";
import {Trade} from "../../../models";
import {Request, Response} from "express";

export function postTrades(aRequest: Request, aResponse: Response) {

    let trades: Trade[] = aRequest.body;

    if(aRequest.query.key !== process.env.DB_KEY){
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {

            var opts = [];
            for (var trade of trades){
                opts.push({
                    updateOne: {
                        filter: {"orderId": trade.orderId},
                        update: {"$set": trade},
                        upsert: true
                    }
                })
            };
            let dbo = db.db(process.env.DB);
            let res = dbo.collection('trades').bulkWrite(opts);
            aResponse.send('Successfully added to database.');
        });
    }
}

export function getTrade(aRequest: Request, aResponse: Response) {
    if(aRequest.query.key !== process.env.DB_KEY){
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            delete aRequest.query.key;
            if (aRequest.query.trader) {
                aRequest.query.trader = Number(aRequest.query.trader)
            }
            if (aRequest.query.tradedShare) {
                aRequest.query.tradedShare = Number(aRequest.query.tradedShare)
            }
            dbo.collection("trades").find(aRequest.query).toArray((err, result) => {
                aResponse.send(result);
            });
        });
    }
}

export function getTrades(aRequest: Request, aResponse: Response) {
    if(aRequest.query.key !== process.env.DB_KEY){
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            delete aRequest.query.key;
            if (aRequest.query.trader) {
                aRequest.query.trader = Number(aRequest.query.trader)
            }
            if (aRequest.query.tradedShare) {
                aRequest.query.tradedShare = Number(aRequest.query.tradedShare)
            }
            dbo.collection("trades").find(aRequest.query).toArray((err, result) => {
                aResponse.send(result);
            });
        });
    }
}