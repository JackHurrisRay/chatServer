/**
 * Created by Jack.L on 2017/5/11.
 */
var base64 = require('./base64');
var WebSocket = require('ws').Server;
var chatRoom = require('./chatRoom');

module.exports =
    (
        function() {

            const WS_PORT = 1949;
            var websocket = new WebSocket({port:WS_PORT});

            var instance =
            {
                run:function()
                {
                    console.log('Web Socket is running');
                    websocket.on('connection',
                        function(ws)
                        {
                            console.log('chat client join');

                            ws.on('message',
                                function(message)
                                {
                                    var _resultData = null;

                                    try
                                    {
                                        var _resultString = message.toString('utf8');
                                        var _parseString = base64.transAscToStringArray( base64.decoder(_resultString) );

                                        _resultData = JSON.parse(_parseString);
                                    }
                                    catch(e)
                                    {
                                        //throw e;
                                    }

                                    var _processFunc =
                                    {
                                        "CONN":function(_ws, _data)
                                        {
                                            chatRoom.enter_room(_ws, _data);
                                        },
                                        "CHAT":function(_ws, _data)
                                        {
                                            chatRoom.chat(_ws, _data);
                                        }
                                    };


                                    if( _resultData && _resultData['type'] && _processFunc[_resultData['type']] )
                                    {
                                        var _func = _processFunc[_resultData['type']];

                                        _func( ws, _resultData );
                                    }
                                    else
                                    {
                                        ws.close();
                                    }

                                    return;
                                }
                            );

                            ws.on('close',
                                function(message)
                                {
                                    chatRoom.leave_room(ws);
                                    console.log('chat client leave');
                                    return;
                                }
                            );

                        }
                    );
                }

            };

            return instance;
        }
    )();
