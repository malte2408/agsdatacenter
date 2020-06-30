import {MongoClient, Db} from "mongodb";
import {Portfolio} from "../../../models";
import {Request, Response} from "express";

export function postPortfolio(aRequest: Request, aResponse: Response) {

    let portfolio: Portfolio = aRequest.body;

    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            let res = dbo.collection('portfolio').updateOne({
                wkn: portfolio.wkn,
            }, {$set: {stock: portfolio.stocks}, $addToSet: {
                    bonds: {$each: portfolio.bonds},
                    certificates: {$each: portfolio.certificates},
                    credits: {$each: portfolio.credits}
            }}, {upsert: true});
            aResponse.send('Successfully added to database.');
        });
    }
}

export function getPortfolio(aRequest: Request, aResponse: Response) {
    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            dbo.collection("portfolio").find({wkn: aRequest.query.wkn}).toArray((err, result) => {
                aResponse.send(result);
            });
        });
    }
}

export function getPortfolios(aRequest: Request, aResponse: Response) {
    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            dbo.collection("portfolio").find({}).toArray((err, result) => {
                aResponse.send(result);
            });
        });
    }
}

