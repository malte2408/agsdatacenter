import {MongoClient, Db} from "mongodb";
import {Request, Response} from "express";

export function getAGSX(aRequest: Request, aResponse: Response) {
    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            delete aRequest.query.key;
            dbo.collection("profile").find(aRequest.query, {fields: { agsx: 1 , date: 1, sizeHighscore: 1, growthHighscore: 1, wkn: 1}}).toArray((err, result) => {
                aResponse.send(result);
            });
        });
    }
}