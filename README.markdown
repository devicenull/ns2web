NS2Web
------

This project is designed as a replacement to the built in web interface in Natural Selection 2.  All of this code is designed to work without requiring any specific server-side processing, it uses JSON to communicate with the actual game server.

Currently, there's a single PHP file here.  This is to overcome the restrictions on cross site javascript.  All it does is proxy requests from the web UI to the game server.  Once NS2 has the ability to serve static content, this page can be safely removed.


Libraries
---------
This project makes use of the following:
* Bootstrap
* jQuery
* jqPlot

