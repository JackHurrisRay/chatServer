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

function removeByValue(arr, val) {
    for(var i=0; i<arr.length; i++) {
        if(arr[i] == val) {
            arr.splice(i, 1);
            break;
        }
    }
}

module.exports =
    (
        function()
        {
            var instance =
            {
                ///////
                ROOMS:{},
                enter_room:function(ws, data, createPlayer)
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

                            room.GAME_CONTENT = data.game_id;
                            room.ROOM_ID = data.room_id;

                            room.players = [];
                            room.broadcast =
                                function(msg)
                                {
                                    for( var i in this.players )
                                    {
                                        var player = this.players[i];

                                        if( player )
                                        {
                                            player.send(msg);
                                        }
                                    }
                                };

                            this.ROOMS[UID] = room;
                        }

                        var player = createPlayer;
                        player.ROOM = this.ROOMS[UID];
                        this.ROOMS[UID].players.push( player );
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
                leave_room:function(ws, createPlayer)
                {
                    var player = createPlayer;

                    if( player )
                    {
                        var room = player.ROOM;

                        removeByValue(room.players, player);
                    }
                },
                chat:function(ws, data, createPlayer)
                {
                    var player = createPlayer;

                    if( data.info && player && player.ROOM )
                    {
                        /////////
                        var msg = {};
                        msg.type = data.type;
                        msg.player_id = player.player_id;
                        msg.info = data.info;

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

