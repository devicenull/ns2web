var _mapCycle   	= { };
var _maps       	= [ ];
var _mods       	= [ ];

function refreshMapList()
{
	return $.ajax({
		url: '/',
		data: {'request': 'getmaplist'},
		success: function(data) {
			_maps = data;
			
			$('#maplist_available').empty();
			for (var i=0;i<_maps.length;i++)
			{
				var entry = { name: _maps[i].name };
				$('#maplist_available').append(tmpl('map', entry));
			}
			
		},
	})
}

function refreshModList()
{
	return $.ajax({
		url: '/',
		data: {'request': 'getinstalledmodslist'},
		success: function(data) {
			$("#mapcycle_modlist").empty();
			_mods = data;
			for (var i=0;i<data.length;i++)
			{
				entry = data[i];
				$('#mapcycle_modlist').append(tmpl('mapcycle_mod', entry));
				$("#mapcycle_mod_" + entry.id).change(  function() { saveMapCycle(); } );
			}
		},
	})
}

function refreshMapCycle()
{
	$.ajax({
		url: '/',
		data: {'request': 'getmapcycle'},
		success: function(data) {
			_mapCycle = data;
			$('#map_cycle_time').val(_mapCycle.time);
			$('#map_cycle_order').val(_mapCycle.mode == "random" ? "Random" : "In order");
			$("#maplist_active").empty();
			
			if (_mapCycle.mods)
			{
				for (var i=0;i<_mods.length; ++i)
				{
					var includeMod = _mapCycle.mods.indexOf(_mods[i].id) != -1;
					$("#mapcycle_mod_" + _mods[i].id).attr('checked', includeMod);
				}
			}
			
			for (var i=0;i<_mapCycle.maps.length;i++)
			{
				var name = null;
				if (typeof(_mapCycle.maps[i])=='string')
				{
					name = _mapCycle.maps[i];
				}
				else
				{
					name = _mapCycle.maps[i].map;
				}

				// Remove from the available list.
				$("#" + name).remove(); 

				// Add to the active list.
				var entry = { 'name': name };
				$('#maplist_active').append(tmpl('map', entry));
			}
		},
	})
}

function getSelectedMods()
{
	var selectedMods = [ ];
	for (var i=0;i<_mods.length;i++)
	{
		if ($("#mapcycle_mod_" + _mods[i].id).attr('checked'))
		{
			selectedMods.push( _mods[i].id );
		}
	}
	return selectedMods;
}

function getModForMap(map)
{
	for (var i=0;i<_maps.length; ++i)
	{
		if (_maps[i].name == map)
		{	
			return _maps[i].modId;
		}
	}
	return "0";
}

function saveMapCycle()
{

	var maps = $('#maplist_active').sortable('toArray');

	_mapCycle.time = parseFloat($('#map_cycle_time').val());
	_mapCycle.mode = $('#map_cycle_order').val() == "Random" ? "random" : "order";
	_mapCycle.mods = getSelectedMods();
	_mapCycle.maps = [ ];
	
	for (var i = 0; i < maps.length; ++i)
	{
		// Add in any required mod for each map in the map cycle.
		var mods = [ ];
		var map  = maps[i];
		var modId = getModForMap(map);
		if (modId != "0" && $.inArray(modId, _mapCycle.mods) == -1)
		{	
			mods.push(modId);
		}
		if (mods.length == 0)
		{
			_mapCycle.maps.push( map );
		}
		else
		{
			_mapCycle.maps.push({ 'map': map, 'mods': mods });
		}
	}
	
	$.ajax({
		url: '/',
		type: "post",
		data: { 'request': 'setmapcycle', 'data': JSON.stringify(_mapCycle) },
	});
}

$(document).ready(function() {
	
		
	$( "#maplist_active, #maplist_available" ).sortable({
			connectWith: ".maplist",
			stop: function(event, ui) {
				saveMapCycle();
			}
		}).disableSelection();
		
	$("#map_cycle_time,#map_cycle_order").change( function() { saveMapCycle(); } );
		
	$.when( refreshMapList(), refreshModList() ).then ( function() { refreshMapCycle(); } );
	
});