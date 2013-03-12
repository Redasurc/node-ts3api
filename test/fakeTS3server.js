var net = require('net');

module.exports = function() {
    var server = net.Server(function(socket) {
        //console.log('new connection');
        socket.write('TS3\n');
        socket.write('Welcome to the TeamSpeak 3 ServerQuery interface, type "help" for a list of commands and "help <command>" for information on a specific command.\n');
        socket.on('data', function(data) {
            //console.log(data.toString());
            data = data.toString().replace('\r\n', '').replace('\n', '');
            var command = data.split(' ')[0];
            if (validCommands.indexOf(command) > -1) {
                validCommandExecute(data, socket);
            } else {
                writeResponse(socket, 256);
            }
        });
    });
    server.listen('10011');
};



var validCommandExecute = function(data, socket) {
    var command = data.split(' ')[0];
    var param = parseTs3(data.replace(command + ' ', ''));
    //console.log(param);
    switch (command) {
        //login client_login_name=serveradmin client_login_password=weakPassword
        case 'login':
            if (checkForParam(param[0], ['client_login_name', 'client_login_password'])) {
                if (param[0].client_login_name == 'serveradmin') {
                    if (param[0].client_login_password == 'weakPassword') {
                        writeResponse(socket);
                    } else {
                        writeResponse(socket, 520);
                    }
                } else {
                    writeResponse(socket, 520);
                }
            } else {
                writeResponse(socket, 1538);
            }
            break;
        default:
            //console.log('uncoded valid command: ' + command);
    }
};

var writeResponse = function(socket, id) {
    switch (id) {
        case 256:
            socket.write('error id=256 msg=command\\snot\\sfound\n');
            break;
        case 1538:
            socket.write('error id=1538 msg=invalid\\sparameter\n');
            break;
        case 520:
            socket.write('error id=520 msg=invalid\\sloginname\\sor\\spassword\n');
            break;
        default:
            socket.write('error id=0 msg=ok\n');
    }
};

var checkForParam = function(param, required) {
    for (a in param) {
        if (required.indexOf(a) > -1) {
            required.splice(required.indexOf(a), 1);
        } else {
            return false;
        }
    }
    if (required.length != 0) {
        return false;
    }
    return true;
};

/**
  * ts3Parse from ts3sq
  * @param {string} body The return string.
  * @return {object} Parsed Ts3 Data.
  */
function parseTs3(body) {
    //NEVER TOUCH
    var nBody = [];
    var items = body.split('|');
    for (var i in items) {
        var elements = items[i].split(' ');
        nBody[i] = {};
        for (var i2 in elements) {
            var element = elements[i2].split('=');
            if (typeof element[1] != 'undefined') {
                //unescape whitespaces, pipes and slashes
                element[1] = element[1].replace(/\\s/g, ' ').replace(/\\p/g, '|').replace(/\\\\/g, '\\').replace(/\\\//g, '/');
            }
            nBody[i][element[0]] = element[1];
        }
    }
    return nBody;
}

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
