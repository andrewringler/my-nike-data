/*
 * GET daily fuel.
 */
var sys = require('util'),
    _ = require('underscore'),
    moment = require('moment');
var Shred = require('shred');
var shred = new Shred();

exports.dailyfuel = function(req, res) {

    var data = [];
    var offset = 1;
    var nikeUrl = 'https://api.nike.com/me/sport/activities?access_token=' + process.env.NIKE_ACCESS_TOKEN + '&count=1000&offset=' + offset;
    sys.puts('GET ' + nikeUrl);

    var getActivities = shred.get({
        url: (nikeUrl),
        headers: {
            Accept: "application/json"
        },
        on: {
            200: function(response) {
                var dataForRequest = response.content.data.data;
                if (_.isArray(dataForRequest)) {
                    for (var i = 0; i < dataForRequest.length; i++) {
                        var dataForDay = dataForRequest[i];
                        var date = moment(dataForDay.startTime);
                        if (dataForDay.deviceType === 'FUELBAND' && _.isNumber(dataForDay.metricSummary.fuel) && date) {
                            var dateString = date.format('YYYY-MM-DD');
                            data.push({
                                date: dateString,
                                value: dataForDay.metricSummary.fuel
                            });
                        }
                    }
                }

                console.log(' Data ' + data.length);
                for (var i = 0; i < data.length; i++) {
                    var dateForDay = data[i];
                    console.log(dateForDay.date + ' ' + dateForDay.value);
                }

                var body = 'Date,Open,High,Low,Close,Volume,Adj Close\n' + '2010-10-01,10789.72,10907.41,10759.14,10829.68,4298910000,10829.68\n' + '2010-09-30,10835.96,10960.99,10732.27,10788.05,4284160000,10788.05\n' + '2010-09-29,10857.98,10901.96,10759.75,10835.28,3990280000,10835.28\n' + '2010-09-28,10809.85,10905.44,10714.03,10858.14,4025840000,10858.14\n' + '2010-09-27,10860.03,10902.52,10776.44,10812.04,3587860000,10812.04';
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Length', body.length);
                res.end(body);
            },
            response: function(response) {
                console.log("Oh no!");
            }
        }
    });
};