var fs = require('fs');
var util = require('util');
var moment = require('moment');

/*
 * log
 */
var Log = require('log'), 
    logLogger = new Log('debug', fs.createWriteStream('./logs/log.log'));

/*
 * winston
 */
var winston = require('winston');
var CustomLogger = winston.transports.CustomerLogger = function (options) {
    options = options || {};
    // Name this logger
    this.name = 'customLogger';
    // Set the level from your options
    this.level = options.level || 'info';
};
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
util.inherits(CustomLogger, winston.Transport);
CustomLogger.prototype.log = function (level, msg, meta, callback) {
    // Store this message and metadata, maybe use some custom logic
    // then callback indicating success.
    console.log(msg);
    callback(null, true);
};

var logger = new (winston.Logger)({
    transports: [
          new (winston.transports.Console)(),
          new (winston.transports.File)({ filename: './logs/winston.log' }),
          new (winston.transports.CustomerLogger)(),
    ]
});

/*
 * log4js
 */
var log4js = require('log4js'); 
log4js.configure({
    appenders: [{
        type: 'console',
        layout: {
            type: 'pattern',
            pattern: "[%d{yyyy-MM-dd hh:mm:ss}]%m"
        }
    }, {
        type: 'file',
        filename: './logs/log4js.log',
        layout: {
            type: 'pattern',
            pattern: "[%d{yyyy-MM-dd hh:mm:ss}]%m"
        }
    }]
});
var log4jsLogger = log4js.getLogger();

/*
 * tracer
 */
var tracerLogger = require('tracer').console/*.dailyfile*/({
    level: 'info',
    format : "[{{timestamp}}]{{message}}",
    dateformat : "yyyy-mm-dd HH:MM:ss",
    transport : function(data) {
        console.log(data.output);
        var filename = "./logs/tracer_" + moment().format('YYYYMMDDHHmm') + ".txt";
        fs.open(filename, 'a', 0666, function(e, id) {
            fs.write(id, data.output+"\n", null, 'utf8', function() {
                fs.close(id, function() {
                });
            });
        });
    }
});


/*
 * bunyan
 */
var bunyan = require('bunyan');
var bunyanLogger = bunyan.createLogger({name: "myapp"});



/*
 * output json
 */
var json = {userId: 12345, noteId:123};


function log(event, json, logger) {
    logger = logger || console;
    var msg = "[" + moment().format('YYYY-MM-DD HH:mm:ss') + "][" + event + "]," + JSON.stringify(json);
    logger.info(msg);
}

setInterval(function() {
    console.log ("console:");
    log('NotePublish', json, console);
    console.log ("====================================================");

    console.log ("log:");
    log('NotePublish', json, logLogger);
    console.log ("====================================================");

    console.log ("winston:");
    log('NotePublish', json, logger);
    console.log ("====================================================");

    console.log ("log4js:");
    log('NotePublish', json, log4jsLogger);
    console.log ("====================================================");

    console.log ("tracer:");
    log('NotePublish', json, tracerLogger);
    console.log ("====================================================");

    console.log ("bunyan:");
    log('NotePublish', json, bunyanLogger);
    console.log ("====================================================");
}, 100);
