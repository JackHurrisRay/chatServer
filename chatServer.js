/**
 * Created by Jack.L on 2017/5/11.
 */

var net = require('net');
var base64 = require('./base64');

module.exports =
    (
        function() {

            const TCP_PORT = 1949;
            var tcpServer = net.createServer();

            var instance =
            {
                isInit:false,
                run:function()
                {
                    tcpServer.on('listening',
                        this.start
                    );

                    tcpServer.on('connection',
                        this.connect
                    );

                    tcpServer.on('close',
                        function()
                        {
                            console.log('TCP SERVER CLOSED');
                        }
                    );

                    tcpServer.on('error',
                        function(err)
                        {
                            console.log('SERVER ERROR:' + err.message);
                        }
                    );

                    tcpServer.listen(TCP_PORT);
                },
                start:function()
                {
                    console.log('TCP SERVER RUNNING');
                    this.isInit = true;
                },
                connect:function(socket)
                {
                    var SELF = this;

                    console.log('Client Join');
                    socket.on('data',
                        function(data)
                        {
                            //SELF.data(socket, data);
                            var _resultData = null;

                            try
                            {
                                var _resultString = data.toString('utf8');
                                var _parseString = base64.transAscToStringArray( base64.decoder(_resultString) );

                                _resultData = JSON.parse(_parseString);
                            }
                            catch(e)
                            {
                                //throw e;
                            }

                            if( _resultData && _resultData.type )
                            {

                            }
                            else
                            {
                                //socket.end();
                            }

                            return;
                        }
                    );

                    socket.on('timeout',
                        function()
                        {
                            //SELF.timeout(socket);
                        }
                    );

                    socket.on('close',
                        function()
                        {
                            //SELF.close(socket);
                            console.log('Client leave');
                        }
                    );

                }

            };

            return instance;
        }
    )();
