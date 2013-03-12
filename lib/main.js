/** @module ts3api_factory */
var ts3sq = require('ts3sq'),
    events = require('events'),
    Util = require('util');

/**
  * Factory for ts3api class
  * @param {string} ip The teamspeak server ip.
  * @param {number} port The ts3 serverquery port.
  * @param {function} callback The callback which is executed after object creation.
  * @return {ts3api} The api object.
  */
module.exports = function(ip, port, callback) {
    return new ts3api(ip, port, callback);
};

Util.inherits(ts3api, events.EventEmitter);

/**
  * The ts3 api constructor
  * @class
  * @param {string} ip The teamspeak server ip.
  * @param {number} port The ts3 serverquery port.
  * @param {function} callback The callback which is executed after object creation.
  * @throws {error} ECONNREFUSED if connection refused
  */
function ts3api(ip, port, callback) {
    events.EventEmitter.call(this);

    var self = this;
    var client = new ts3sq.ServerQuery(ip, port);

    /**
      * Execute command directly over serverquery and get answer as an object
      * @param {string} command The command to be executed.
      * @param {object} args An object that contains the args and values in key - value pairs. Parameters go into the parameter array.
      * @param {function} callback Callback function - Serveranswer as an object in first parameter.
      * @return {ts3api} this for command chains.
      * @throws {error} sq command unknown.
      */
    this.execute = function(command, args, callback) {
        var sqarguments = '';
        var sqparameters = '';
        if (typeof args == 'function') {
            callback = args;
            args = [];
        } else {
            if (typeof args == 'object') {
                for (var b in args) {
                    if (b != 'parameter') {
                        sqarguments += b + '=' + this.escapeString(args[b]) + ' ';
                    } else {
                        for (var c in args[b]) {
                            sqparameters += args[b][c] + ' ';
                        }
                    }
                }
            }
        }
        if (validCommands.indexOf(command) > -1) {
            client.execute(command + ' ' + sqarguments + sqparameters, function(element) {
                var err = false;
                if (element.err[0].id == 0) err = true;
                if (typeof callback == 'function') callback(element, err);
            });
        } else {
            throw new Error('sq command unknown');
        }
        return this;
    };
    /**
      * Login with Username and password
      * @param {string} username the serverquery username.
      * @param {string} password the serverquery password.
      * @param {function} callback the callback for command
      *     error values: bad login, unknown.
      */
    this.login = function(username, password, callback) {
        self.execute('login', {client_login_name: username, client_login_password: password}, function(element, err) {
            if (err == true) {
                callback(true);
            } else {
                if (element.err[0].id == 520) {
                    callback(false, 'bad login');
                } else {
                    callback(false, 'unknown (id: ' + element.err[0].id + ', msg: ' + element.err[0].msg);
                }
            }
        });
    };

    /**
      * Register tsserver events (which will fire notrify events)
      * @param {string} param which events to register. Left blank will register all.
      * (possible param: server, textchannel, textprivate, textserver, text).
      */
    this.registerEvents = function(param) {
        switch (param) {
            case 'server':
                self.execute('servernotifyregister', {event: 'server'});
                break;
            case 'textchannel':
                self.execute('servernotifyregister', {event: 'textchannel'});
                break;
            case 'textprivate':
                self.execute('servernotifyregister', {event: 'textprivate'});
                break;
            case 'textserver':
                self.execute('servernotifyregister', {event: 'textserver'});
                break;
            case 'text':
                self.registerEvents('textserver');
                self.registerEvents('textchannel');
                self.registerEvents('textprivate');
                break;
            default:
                self.registerEvents('server');
                self.registerEvents('text');
                break;
        }
        // Channel events are heavy buggy so i dont implement them
    };

    /**
      * Enhanced string escaping (originaly from ts3sq module)
      * @param {string} string unescaped string.
      * @return {string} The escaped string.
      */
    this.escapeString = function(string) {
        if (typeof string == 'string') {
            string = string.replace(/\u005C/g, '\u005C\u005C'); // escape \
            string = string.replace(/\u002F/g, '\u005C\u002F'); // escape /
            string = string.replace(/\u0020/g, '\u005C\u0073'); // escape " " (space)
            string = string.replace(/\u007C/g, '\u005C\u0070'); // escape |
            string = string.replace(/\u0007/g, '\u005C\u0061'); // escape Bell
            string = string.replace(/\u0008/g, '\u005C\u0062'); // escape Backspace
            string = string.replace(/\u000C/g, '\u005C\u0066'); // escape Formfeed
            string = string.replace(/\u000A/g, '\u005C\u006e'); // escape Newline
            string = string.replace(/\u000D/g, '\u005C\u0072'); // escape Carriage Return
            string = string.replace(/\u0009/g, '\u005C\u0074'); // escape Horizontal Tab
            string = string.replace(/\u000B/g, '\u005C\u0076'); // escape Vertical Tab
        }
        return string;
    };



    /*
     * EVENTS:
     */

    client.on('ready', function() { self.emit('ready'); });
    client.on('close', function(whyyy) { self.emit('close', whyyy); });
    client.on('error', function(error) { self.emit('error', error); });
    client.on('notify', function(object) {
        switch (object.type) {
            case 'notifytextmessage':
                self.emit('textmessage', object.body[0]);
                break;
        }
        self.emit('notrify', object);
    });


    if (typeof callback == 'function') {
        callback();
    }
/**
  * a list of valid ts3sq commands
  */
var validCommands = ['help', 'quit', 'login', 'logout', 'version', 'hostinfo', 'instanceinfo', 'instanceedit', 'bindinglist',
    'use', 'serverlist', 'serveridgetbyport', 'serverdelete', 'servercreate', 'serverstart', 'serverstop',
    'serverprocessstop', 'serverinfo', 'serverrequestconnectioninfo', 'serveredit', 'servergrouplist', 'servergroupadd',
    'servergroupdel', 'servergroupcopy', 'servergrouprename', 'servergrouppermlist', 'servergroupaddperm',
    'servergroupdelperm', 'servergroupaddclient', 'servergroupdelclient', 'servergroupclientlist', 'servergroupsbyclientid',
    'servergroupautoaddperm', 'servergroupautodelperm', 'serversnapshotcreate', 'serversnapshotdeploy', 'servernotifyregister',
    'servernotifyunregister', 'sendtextmessage', 'logview', 'logadd', 'gm', 'channellist', 'channelinfo', 'channelfind',
    'channelmove', 'channelcreate', 'channeldelete', 'channeledit', 'channelgrouplist', 'channelgroupadd', 'channelgroupdel',
    'channelgroupcopy', 'channelgrouprename', 'channelgroupaddperm', 'channelgrouppermlist', 'channelgroupdelperm',
    'channelgroupclientlist', 'setclientchannelgroup', 'channelpermlist', 'channeladdperm', 'channeldelperm', 'clientlist',
    'clientinfo', 'clientfind', 'clientedit', 'clientdblist', 'clientdbinfo', 'clientdbfind', 'clientdbedit',
    'clientdbdelete', 'clientgetids', 'clientgetdbidfromuid', 'clientgetnamefromuid', 'clientgetnamefromdbid',
    'clientsetserverquerylogin', 'clientupdate', 'clientmove', 'clientkick', 'clientpoke', 'clientpermlist', 'clientaddperm',
    'clientdelperm', 'channelclientpermlist', 'channelclientaddperm', 'channelclientdelperm', 'permissionlist',
    'permidgetbyname', 'permoverview', 'permget', 'permfind', 'permreset', 'privilegekeylist', 'privilegekeyadd',
    'privilegekeydelete', 'privilegekeyuse', 'messagelist', 'messageadd', 'messagedel', 'messageget', 'messageupdateflag',
    'complainlist', 'complainadd', 'complaindelall', 'complaindel', 'banclient', 'banlist', 'banadd', 'bandel', 'bandelall',
    'ftinitupload', 'ftinitdownload', 'ftlist', 'ftgetfilelist', 'ftgetfileinfo', 'ftstop', 'ftdeletefile', 'ftcreatedir',
    'ftrenamefile', 'customsearch', 'custominfo', 'whoami'];

}


