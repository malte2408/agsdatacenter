import {MongoClient, Db} from "mongodb";
import {Chronicle} from "../../../models";
import {Request, Response} from "express";

export function postChronicle(aRequest: Request, aResponse: Response) {

    let chronicle: Chronicle = aRequest.body;

    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            let res = dbo.collection('chronicle').updateOne({
                wkn: chronicle.wkn,
            }, {$set: chronicle}, {upsert: true});
            aResponse.send('Successfully added to database.');
        });
    }
}

export function getChronicle(aRequest: Request, aResponse: Response) {
    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            delete aRequest.query.key;
            dbo.collection("chronicle").find(aRequest.query).toArray((err, result) => {
                aResponse.send(result);
            });
        });
    }
}