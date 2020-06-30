import {MongoClient, Db} from "mongodb";
import {AgsIndex} from "../../../models";
import {Request, Response} from "express";
import {HelperService} from "../../../middleware/parse/helper/helper.service";

export function postIndex(aRequest: Request, aResponse: Response) {

    let index: AgsIndex = aRequest.body;

    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            let res = dbo.collection('index').updateOne({
                id: index.id,
                date: index.date
            }, {$set: index}, {upsert: true});
            aResponse.send('Successfully added to database.');
        });
    }
}

export function getIndex(aRequest: Request, aResponse: Response) {
    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            dbo.collection("index").find({wkn: aRequest.query.id}).toArray((err, result) => {
                aResponse.send(result);
            });
        });
    }
}

export function getIndices(aRequest: Request, aResponse: Response) {
    const helperService = new HelperService();
    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        const date = helperService.formatDate(aRequest.query.date) || helperService.formatToday();
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            dbo.collection("index").find({date: date}).toArray((err, result) => {
                aResponse.send(result);
            });
        });
    }
}