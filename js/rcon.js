refreshCount = 0;

String.prototype.toHHMMSS = function () {
    sec_numb    = parseInt(this);
    var hours   = Math.floor(sec_numb / 3600);
    var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
    var seconds = sec_numb - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

function refreshInfo()
{
	$.ajax({
		url: '/',
		data: {'request': 'json'},
		success: function (data){
			if (data != null)
			{	// NS2 has a bug where it sometimes returns no data.  Don't error if that happens
				$('#servermap').html(data.map);

				$('#serveruptime').html(secondsToTime(data.uptime));
				$('#marineres').html(data.marine_res);
				$('#alienres').html(data.alien_res);
				$('#servername').html(data.server_name);
				$('#serverrate').html((Math.round(data.frame_rate*100)/100).toFixed(2));


				var prevRefreshCount = $("#playerstable tr td").find(".lastupdated").val();
				if( typeof( prevRefreshCount ) === 'undefined' )
					prevRefreshCount = 0;

				var currentTime = (new Date()).getTime() / 1000;
				var connectionTime = currentTime;
				var playerElem;
				for (i=0;i<data.player_list.length;i++)
				{
					player = data.player_list[i];
					player.humanTeam = player.team
					if (player.team == 0)
					{
						player.humanTeam = 'Ready Room';
					}
					else if (player.team == 1)
					{
						player.humanTeam = 'Marines';
					}
					else if (player.team == 2)
					{
						player.humanTeam = 'Aliens';
					}
					else if (player.team == 3)
					{
						player.humanTeam = 'Spectator';
					}

					if (player.iscomm)
					{
						player.humanTeam = player.humanTeam + ' (*)';
					}

					playerElem = $("#playerstable ." + player.steamid);

					if( playerElem.length == 0 )
					{
						player.lastupdated = refreshCount;
						player.connTimeFormatted = "" + ("" + (connectionTime - currentTime)).toHHMMSS();
						player.connTime = currentTime;
						player.resources = player.resources.toFixed(2);

						$('#playerstable tbody').append(tmpl('player_row',player));
					}
					else
					{
						playerElem.find(".name").text( player.name );
						playerElem.find(".team").text( player.humanTeam );
						playerElem.find(".score").text( player.score );
						playerElem.find(".kd").text( player.kills + '/' + player.deaths );
						playerElem.find(".res").text( Math.floor(player.resources) );
						playerElem.find(".ping").text( player.ping );

						connTime = currentTime - parseInt(playerElem.find(".connectiontime").val());
						playerElem.find(".connTime").text( ("" + connTime).toHHMMSS() );
						playerElem.find(".lastupdated").val( refreshCount );

						playerElem.attr("id", refreshCount );
					}
				}

				//if( prevRefreshCount != 0 )
				//	$("#" + prevRefreshCount ).remove();

				if (data.player_list.length == 0 ) {
					if( $("#playerstable #noplayers").length == 0 ) {
						$('#playerstable tbody').append('<tr id="noplayers"><td colspan="10" style="text-align: center;">No Connected Players</td></tr>');
					}
				} else {
					$("#noplayers").remove();

					if( refreshCount == 0 ) {
						$("#playerstable").tablesorter({sortList:[[9,0]]});
					} else {
						$("#playerstable").trigger("update");
					}
				}

				playerRows = $("#playerstable tr");
				playerRows.each( function(i) {
					if( i == 0 )
						return;

					if( $(this).attr("id") != refreshCount )
						$(this).remove();
					else
						$(this).find("td.num").text( parseInt(i ) + "." );
				});

				if (data.player_list.length == 1)
				{
					$('#serverplayers').html(parseInt(data.player_list.length)+' player');
				}
				else
				{
					$('#serverplayers').html(parseInt(data.player_list.length)+' players');
				}
				//$('#serverplayers').html(parseInt(playerRows.length-1)+' players');

				refreshCount = refreshCount + 1;
			}
		},
	});
}

function secondsToTime(seconds)
{
	var tm=new Date(seconds*1000)
	var hours=tm.getUTCHours();
	var minutes=tm.getUTCMinutes();
	var seconds=tm.getUTCSeconds();

	time = ""
	if (hours > 0)
	{
		time += hours + " hours ";
	}
	if (minutes > 0)
	{
		time += minutes + " min ";
	}
	if (seconds > 0 && time == "")
	{
		time += seconds + " sec ";
	}
	return time;
}

function refreshBanList()
{
	$.ajax({
		url: '/',
		data: {'request': 'getbanlist'},
		success: function (data) {
			$('#banstable tbody').empty();
			for (i=0;i<data.length;i++)
			{
				ban = data[i]
				$('#banstable tbody').append(tmpl('ban_row',ban));
			}
		},
	});
}

var maxChatPos = 0;
function refreshChat(once)
{
	$.ajax({
		url: '/',
		data: {'request': 'getchatlist'},
		success: function(data) {
			for (i=0;i<data.length;i++)
			{
				entry = data[i];
				entry.player = decodeURIComponent(entry.player.replace(/(25){5,}/g, "").replace(/(\+|\%2B)/g, "%20"));
				entry.message = decodeURIComponent(entry.message.replace(/(25){5,}/g, "").replace(/(\+|\%2B)/g, "%20"));

				if (entry.id > maxChatPos)
				{
					$('#chatlog').append(tmpl('chat_row',entry));
					maxChatPos = entry.id;
				}
			}

			$('#chatlog').prop({'scrollTop':$('#chatlog').prop('scrollHeight')});
		},
	})
}

var lastPerfTime = 0;
var performance_data = [[],[]];
function refreshPerformance()
{
	$.ajax({
		url: '/',
		data: {'request': 'getperfdata'},
		success: function(data) {
			if (data.length > 0)
			{
				for (i=0;i<data.length;i++)
				{
					entry = data[i];
					entry.time *= 1000;
					if (entry.time < lastPerfTime) continue;

					performance_data[0].push([entry.time,entry.players]);
					performance_data[1].push([entry.time,entry.tickrate]);
					lastPerfTIme = entry.time;
				}
			}
			showPerfChart();

			if (performance_data.length == 0) setTimeout("refreshPerformance()",3000);
		},
		error:  function (data) {
			if (performance_data.length == 0) setTimeout("refreshPerformance()",3000);
		},
	})
}

function performancecontent_onShow()
{
	showPerfChart();
}

function showPerfChart()
{
	$('#perfchart').empty();
	$.jqplot('perfchart',performance_data,{
		title: 'Server Performance',
			axes:{xaxis:{renderer:$.jqplot.DateAxisRenderer,tickOptions:{formatString:'%H:%M'},tickInterval: '30 minutes'},yaxis:{min:0,tickInterval: 5}},
			legend: {
			show: true,
			location: 'se',
			labels: ['Players','Tickrate'],
		},
		seriesDefaults: { markerOptions: { show: false, }, },
	});
}

function rcon(command)
{
	$.get('/?request=json&command=Send&rcon='+command);

	lowerCommand = command.toLowerCase();
	if (lowerCommand.indexOf('sv_ban') != -1 || lowerCommand.indexOf('sv_unban') != -1)
	{
		setTimeout("refreshBanList()",500);
	}
	if (lowerCommand.indexOf('sv_say') != -1 || lowerCommand.indexOf('sv_tsay') != -1 || lowerCommand.indexOf('sv_psay') != -1)
	{
		//setTimeout("refreshChat()",500);
	}
}

function sendManualRcon()
{
	rcon($('input[name=manual_rcon]').val());
	$('input[name=manual_rcon]').val('');
}

function sendConfirmedRcon(message, command)
{
	if (confirm(message)) {
		rcon(command);
	}
}

function confirmMapChange(map)	
{
	if(confirm('Change map to '+map+'?')) {
		rcon('sv_changemap '+map);
	}
}

function sendChatMessage()
{
	chatType = $('select[name=chatmessagetype]').val();
	chatMessage = $('input[name=chat_message]').val();
	$('input[name=chat_message]').val('');
	if (chatType == 'all')
	{
		rcon('sv_say '+chatMessage);
	}
	else if (chatType == 'marines')
	{
		rcon('sv_tsay 1 '+chatMessage);
	}
	else if (chatType == 'aliens')
	{
		rcon('sv_tsay 2 '+chatMessage);
	}
}

function sendManualBan()
{
	steamid = parseInt($('input[name=addban_steamid]').val());
	duration = parseInt($('input[name=addban_duration]').val());
	reason = $('input[name=addban_reason]').val();
	if (duration < 0) duration = 0;

	rcon('sv_ban '+steamid+' '+duration+' '+reason);
	$('input[name=addban_steamid]').val('');
	$('input[name=addban_duration]').val('');
	$('input[name=addban_reason]').val('');
}

function changeTab()
{
	$('#tabs > li').each(function()
	{
		$(this).removeClass('active');
		$('#'+$(this).attr("rel")).hide();
	});
	$(this).addClass('active');
	$('#'+($(this).attr("rel"))).show();

	showFunc = window[$(this).attr("rel")+'_onShow'];
	if (typeof showFunc == 'function')
	{
		showFunc();
	}
}




$(document).ready(function() {
	$(document).on("click", ".rconbutton", function() {
		rcon($(this).attr('command'));
	});



	setInterval(refreshInfo,2000); refreshInfo();
	// Chat support is currently not implemented in the engine.
	setInterval(refreshChat,2000); refreshChat();
	setInterval(refreshBanList,300000); refreshBanList();
	setInterval(refreshPerformance,60000); refreshPerformance();
	$('input[name=manual_rcon]').bind('keypress', function (e) {
		if (e.keyCode == 13) /* Enter */
		{
			sendManualRcon();
			e.preventDefault();
		}
	});
	$('input[name=chat_message]').bind('keypress', function (e) {
		if (e.keyCode == 13) /* Enter */
		{
			sendChatMessage();
			e.preventDefault();
		}
	});
	$('input[name=manual_rcon]').typeahead({
		'source':[
			'sv_ban',
			'sv_unban',
			'sv_kick',
			'sv_changemap',
			'sv_switchteam',
			'sv_rrall',
			'sv_randomall',
			'sv_eject',
			'sv_slay',
			'sv_tsay',
			'sv_psay',
			'sv_say',
			'sv_vote',
			'sv_tournament',
			'sv_cheats',
			'sv_reset',
			'sv_listbans',
			'cyclemap',
			'sv_autobalance',
			'kick',
			'status',
			'say',
			'reset'
		]
	});
	$('#tabs > li').click(changeTab);
});


// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};

  this.tmpl = function tmpl(str, data){
	// Figure out if we're getting a template, or if we need to
	// load the template - and be sure to cache the result.
	var fn = !/\W/.test(str) ?
	  cache[str] = cache[str] ||
		tmpl(document.getElementById(str).innerHTML) :

	  // Generate a reusable function that will serve as a template
	  // generator (and which will be cached).
	  new Function("obj",
		"var p=[],print=function(){p.push.apply(p,arguments);};" +

		// Introduce the data as local variables using with(){}
		"with(obj){p.push('" +

		// Convert the template into pure JavaScript
		str
		  .replace(/[\r\t\n]/g, " ")
		  .split("<%").join("\t")
		  .replace(/((^|%>)[^\t]*)'/g, "$1\r")
		  .replace(/\t=(.*?)%>/g, "',$1,'")
		  .split("\t").join("');")
		  .split("%>").join("p.push('")
		  .split("\r").join("\\'")
	  + "');}return p.join('');");

	// Provide some basic currying to the user
	return data ? fn( data ) : fn;
  };
})();
