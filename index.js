/**
 * Created by mosluce on 2015/11/6.
 */

var Promise = require('bluebird');
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var fs = require('fs');
var path = require('path');

var MODEL_DIR = process.env.MODEL_DIR || path.join(process.cwd(), 'mvc', 'models');
var MONGO_URL = process.env.MONGO_URL;

global.mongoConnector = global.mongoConnector || {};
global.mongoConnector.connections = global.mongoConnector.connections || {};

function connect(dbName, url) {
    url = url || MONGO_URL;
    dbName = dbName || 'main';

    var conn = global.mongoConnector.connections[dbName];

    if (conn) {
        return Promise.resolve(conn);
    }

    return new Promise(function (resolve, reject) {

        conn = mongoose.createConnection();

        conn.once('connected', function () {
            console.log('Mongoose connection open to ' + url);

            global.mongoConnector.connections[dbName] = conn;

            register(dbName, '*').then(function() {
                resolve(conn);
            }, reject);
        });

        conn.on('error', function (err) {
            console.log('Mongoose connection error: ' + err);
            reject(err);
        });

        conn.on('disconnected', function () {
            console.log('Mongoose connection disconnected');
        });

        conn.on('open', function () {
            console.log('Mongoose connection is open');
        });

        process.on('SIGINT', function () {
            conn.close(function () {
                console.log('Mongoose connection disconnected through app termination');
                process.exit(0);
            });
        });

        conn.open(url);
    });
}

function register(dbName, models, dir) {
    var conn = global.mongoConnector.connections[dbName];

    if (!conn) return Promise.reject({message: 'connection is not exists'});

    if (models instanceof Array || models === '*') {
        return new Promise(function (resolve, reject) {
            dir = dir || MODEL_DIR;

            fs.readdir(dir, function (err, files) {
                if (err) return reject(err);

                for (var i in files) {
                    var file = files[i];

                    if (file === 'index.js') continue;
                    if (!/\.js$/.test(file)) continue;

                    var cfg = require(path.join(dir, file))(Schema);
                    var schema = new Schema(cfg.schema);

                    schema.plugin(timestamps);

                    conn.model(cfg.table, schema);
                }

                resolve();
            });
        });
    } else {
        return Promise.reject({message: 'models must be an array'})
    }
}

function connection(dbName) {
    dbName = dbName || 'main';
    return global.mongoConnector.connections[dbName];
}

exports.connect = connect;
exports.register = register;
exports.connection = connection;