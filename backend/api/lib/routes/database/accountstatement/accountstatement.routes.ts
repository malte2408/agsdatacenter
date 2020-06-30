import {MongoClient, Db} from "mongodb";
import {Statement} from "../../../models";
import {Request, Response} from "express";
import {HelperService} from "../../../middleware/parse/helper/helper.service";

export function postAccountStatement(aRequest: Request, aResponse: Response) {

    let statement: Statement = aRequest.body;

    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);

            var opts = [];
            for (var bond of statement.bonds){
                opts.push({
                    updateOne: {
                        filter: {"orderId": bond.id},
                        update: {"$set": bond},
                        upsert: true
                    }
                })
            }
            if (opts.length > 0) {
                dbo.collection('bondstatement').bulkWrite(opts);
            }
            opts = [];
            for (var certificate of statement.certificates){
                opts.push({
                    updateOne: {
                        filter: {"orderId": certificate.id},
                        update: {"$set": certificate},
                        upsert: true
                    }
                })
            }
            if (opts.length > 0) {
                dbo.collection('certificatestatement').bulkWrite(opts);
            }
            opts = [];
            for (var stock of statement.stocks){
                opts.push({
                    updateOne: {
                        filter: {"orderId": stock.id},
                        update: {"$set": stock},
                        upsert: true
                    }
                })
            }
            if (opts.length > 0) {
                dbo.collection('stockstatement').bulkWrite(opts);
            }

            opts = [];
            for (var credit of statement.credits){
                opts.push({
                    updateOne: {
                        filter: {"orderId": credit.id},
                        update: {"$set": credit},
                        upsert: true
                    }
                })
            }
            if (opts.length > 0) {
                dbo.collection('creditstatement').bulkWrite(opts);
            }

            opts = [];
            for (var dividend of statement.dividends){
                opts.push({
                    updateOne: {
                        filter: {"orderId": dividend.id},
                        update: {"$set": dividend},
                        upsert: true
                    }
                })
            }
            if (opts.length > 0) {
                dbo.collection('dividendstatement').bulkWrite(opts);
            }

            opts = [];
            for (var other of statement.other){
                opts.push({
                    updateOne: {
                        filter: {"orderId": other.id},
                        update: {"$set": other},
                        upsert: true
                    }
                })
            }
            if (opts.length > 0) {
                dbo.collection('otherstatement').bulkWrite(opts);
            }

            aResponse.send('Successfully added to database.');
        });
    }
}

export function getAccountStatement(aRequest: Request, aResponse: Response) {
    const helperService = new HelperService();
    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        const date = aRequest.query.days ? helperService.formatToday() - helperService.days(aRequest.query.days) : helperService.formatToday() - helperService.days(10);
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            dbo.collection('otherstatement').find({wkn: aRequest.query.wkn, "datetime": {'$gt': date}}).toArray((err, other) => {
                dbo.collection('bondstatement').find({wkn: aRequest.query.wkn, "datetime": {'$gt': date}}).toArray((err, bond) => {
                    dbo.collection('creditstatement').find({wkn: aRequest.query.wkn, "datetime": {'$gt': date}}).toArray((err, credit) => {
                        dbo.collection('certificatestatement').find({wkn: aRequest.query.wkn, "datetime": {'$gt': date}}).toArray((err, certificate) => {
                            dbo.collection('stockstatement').find({trader: aRequest.query.wkn, "datetime": {'$gt': date}}).toArray((err, stock) => {
                                dbo.collection('dividendstatement').find({wkn: aRequest.query.wkn, "datetime": {'$gt': date}}).toArray((err, dividend) => {
                                    const statement: Statement = new Statement();
                                    statement.other = other;
                                    statement.credits = credit;
                                    statement.certificates = certificate;
                                    statement.bonds = bond;
                                    statement.stocks = stock;
                                    statement.dividends = dividend;
                                    statement.wkn = aRequest.query.wkn;

                                    aResponse.send(statement);
                                });
                            });
                        });
                    });
                });
            });
        });
    }
}

export function getAccountStatements(aRequest: Request, aResponse: Response) {
    const helperService = new HelperService();
    if (aRequest.query.key !== process.env.DB_KEY) {
        aResponse.status(401).send('Permission denied!');
    } else {
        const date = aRequest.query.days ? helperService.formatToday() - helperService.days(aRequest.query.days) : helperService.formatToday() - helperService.days(10);
        MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db(process.env.DB);
            dbo.collection('otherstatement').find({datetime: {'$gte': date}}).toArray((err, other) => {
                dbo.collection('bondstatement').find({datetime: {'$gte': date}}).toArray((err, bond) => {
                    dbo.collection('creditstatement').find({datetime: {'$gte': date}}).toArray((err, credit) => {
                        dbo.collection('certificatestatement').find({datetime: {'$gte': date}}).toArray((err, certificate) => {
                            dbo.collection('stockstatement').find({datetime: {'$gte': date}}).toArray((err, stock) => {
                                dbo.collection('dividendstatement').find({datetime: {'$gte': date}}).toArray((err, dividend) => {
                                    const statement: Statement = new Statement();
                                    statement.other = other;
                                    statement.credits = credit;
                                    statement.certificates = certificate;
                                    statement.bonds = bond;
                                    statement.stocks = stock;
                                    statement.dividends = dividend;

                                    aResponse.send(statement);
                                });
                            });
                        });
                    });
                });
            });
        });
    }
}