$(function() {

	$('#neighborhood').attr("data-neighbors", pad(baseConvert(HashString['n'], 63, 2), 25));
	var vals = $('#neighborhood').data('neighbors');
	$('#neighborhood td').each( function(index, element){
		if (vals[index] == 1)
			$(this).addClass("selected");
	});

	$('#neighborhood td').click(function() {
		if(!$(this).hasClass("selected")) {
			if($('#neighborhood td.selected').length == 9) {
				alert('Max of 8 classes, this is for your own good trust me :)')
				return;
			}
			$(this).addClass("selected");
		}
		else
			$(this).removeClass("selected");

		var new_neighbor_string = '';
		$('#neighborhood td').each( function(index, element){
			if($(this).hasClass("selected"))
				new_neighbor_string += '1'
			else
				new_neighbor_string += '0'
		});

		// Set the new hash and set the new neighboorhood in the sketch
		$('#neighborhood').attr("data-neighbors", pad(baseConvert(new_neighbor_string, 63, 2), 25));
		set_new_neighborhood_and_rules(new_neighbor_string);
	});
});