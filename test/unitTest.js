
var assert = require('assert'),
    fakeTS3server = require('./fakeTS3server.js'),
    ts3api = require('./../lib/main.js');


describe('ts3server Tests', function() {
    debugger;
    var ts3server = new fakeTS3server();
    describe('#connect()', function() {
        it('should not connect', function(done) {
            debugger;
            var api = new ts3api('localhost', 10012);
            api.on('error', function(data) {
                if (data.code == 'ECONNREFUSED') done();
            });
        });
        it('should connect', function(done) {
            var api = new ts3api('localhost', 10011);
            api.on('ready', function() {
                done();
            });
        });
    });
    describe('#login', function() {
        it('wrong password', function(done) {
            var api = new ts3api('localhost', 10011);
            api.on('ready', function() {
                api.login('serveradmin', 'weakPasswor', function(succ, msg) {
                    if (!(succ) && msg == 'bad login') done();
                });
            });
        });
        it('right password', function(done) {
            var api = new ts3api('localhost', 10011);
            api.on('ready', function() {
                api.login('serveradmin', 'weakPassword', function(succ, msg) {
                    if (succ) done();
                });
            });
        });
    });
});
