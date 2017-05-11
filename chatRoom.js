/**
 * Created by Jack.L on 2017/5/11.
 */

var base64 = require('./base64');

function getGameRoomUID(game_id, room_id)
{
    var UID1 = game_id.toString() + room_id.toString();
    var UID2 =base64.encoder(UID1);

    return UID2;
}

function pakcageMSG(msg)
{
    var _msg1 = JSON.stringify(msg);
    var _msg2 = base64.encoder(_msg1);

    return _msg2;
}

module.exports =
    (
        function()
        {
            var instance =
            {
                ///////
                ROOMS:{},
                PLAYERS:{},
                enter_room:function(ws, data)
                {
                    if(
                        data.game_id &&
                        data.room_id &&
                        data.player_id
                    )
                    {
                        const UID = getGameRoomUID( data.game_id, data.room_id);

                        if( !this.ROOMS[UID] )
                        {
                            var room = {};
                            room.players = {};
                            room.broadcast =
                                function(msg)
                                {
                                    for( var ws in this.players )
                                    {
                                        var player = this.players[ws];

                                        if( player )
                                        {
                                            player.send(msg);
                                        }
                                    }
                                };

                            this.ROOMS[UID] = room;
                        }

                        const PLAYER_ID = ws;

                        if( !this.PLAYERS[PLAYER_ID] )
                        {
                            this.PLAYERS[PLAYER_ID] = {};
                        }

                        var player = this.PLAYERS[PLAYER_ID];

                        player.ROOM = this.ROOMS[UID];
                        this.ROOMS[UID].players[ws] = player;

                        player.player_id = data.player_id;
                        player.send =
                            function(msg)
                            {
                                ws.send(msg);
                            };

                        var msg    = {};
                        msg.type   = data.type;
                        msg.status = 0;

                        const _msg = pakcageMSG(msg);

                        this.ROOMS[UID].broadcast(_msg);
                    }
                    else
                    {
                        ws.close();
                    }
                },
                leave_room:function(ws)
                {
                    var player = this.PLAYERS[ws];

                    if( player )
                    {
                        var room = player.ROOM;
                        room.players[ws] = null;

                        delete  player;
                        player = null;
                    }
                },
                chat:function(ws, data)
                {
                    var player = this.PLAYERS[ws];

                    if( data.info && player && player.ROOM && player.ROOM[ws] == player )
                    {
                        /////////
                        var msg = {};
                        msg.type = data.type;
                        msg.player_id = player.player_id;
                        msg.info = info;

                        const _msg = pakcageMSG(msg);

                        player.ROOM.broadcast(_msg);
                    }
                    else
                    {
                        ws.close();
                    }
                }

            };

            return instance;
        }
    )();

