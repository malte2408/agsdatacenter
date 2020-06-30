import {MongoClient, Db} from "mongodb";
import {Profile} from "../../../models";
import {Request, Response} from "express";
import {HelperService} from "../../../middleware/parse/helper/helper.service";

export function postProfile(aRequest: Request, aResponse: Response) {

    let profile: Profile = aRequest.body;

    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            let res = dbo.collection('profile').updateOne({
                wkn: profile.wkn,
                date: profile.date
            }, {$set: profile}, {upsert: true});
            aResponse.send('Successfully added to database.');
        });
    }
}

export function getProfile(aRequest: Request, aResponse: Response) {
    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            dbo.collection("profile").find({wkn: aRequest.query.wkn}).toArray((err, result) => {
                aResponse.send(result);
            });
        });
    }
}

export function getProfiles(aRequest: Request, aResponse: Response) {
    const helperService = new HelperService();
    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        const date = helperService.formatDate(aRequest.query.date) || helperService.formatToday() - helperService.days(aRequest.query.days) || helperService.formatToday();
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            dbo.collection("profile").find({date: date}).toArray((err, result) => {
                aResponse.send(result);
            });
        });
    }
}