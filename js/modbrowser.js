var _modPageNumber 	= 1;
var _subscribedMods = { };

function updateModSubscribeStatus(id)
{
	var selector = $("#modbrowser_mod_" + id).find(".modbrowser_mod_subscribe");
	if (_subscribedMods[id]) {
		selector.addClass('subscribed');
	} else {
		selector.removeClass('subscribed');
	}
}

function getModSubscribeHandler(id)
{
	return function() {
		if (_subscribedMods[id]) {
			_subscribedMods[id] = null;
		} else {
			_subscribedMods[id] = true;
			$.ajax({
				url: '/',
				data: {'request': 'installmod', 'modid': id},
				});
		}
		updateModSubscribeStatus(id);
	};
}

function getMods()
{
	$("#modbrowser_loading").show();
	return $.ajax({
		url: '/',
		data: {'request': 'getmods', 'p': _modPageNumber},
		success: function(data) {
			$('#modbrowser_mods').empty();
			if (data != null && data.items != null)
			{
				var mods = data.items;
				for (var i = 0; i < mods.length; i++)
				{
					var id = mods[i].id;
					$('#modbrowser_mods').append(tmpl('modbrowser_mod', mods[i]));
					$("#modbrowser_mod_" + id).find(".modbrowser_mod_subscribe").click(  getModSubscribeHandler(id) );
					updateModSubscribeStatus(id);
				}
			}
		},
		complete: function() {
			$("#modbrowser_loading").hide();		
		},
	})	

}

$(document).ready(function() {
	
	$("#modbrowser_prev_button").button().click( function() { if (_modPageNumber > 1) { --_modPageNumber; getMods(); } } );
	$("#modbrowser_next_button").button().click( function() { ++_modPageNumber; getMods(); } );
	getMods();
});
