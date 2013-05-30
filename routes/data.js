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

                var csv = 'Date,Value\n';
                for (var i = 0; i < data.length; i++) {
                    var dateForDay = data[i];
                    csv += dateForDay.date + ',' + dateForDay.value + '\n';
                }

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Length', csv.length);
                res.end(csv);
            },
            response: function(response) {
                console.log("Oh no!");
            }
        }
    });
};