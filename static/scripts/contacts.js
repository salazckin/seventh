function mapInitialize() {
	var officeCoords = new google.maps.LatLng(55.655194, 37.650152);
	var showroomCoords = new google.maps.LatLng(55.573960,37.599534);
	var mapOptions = {
		zoom: 17,
		scrollwheel: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		styles: [
			{
				"stylers": [
					{ "hue": 0 },
					{ "saturation": -100 },
					// { "gamma": 1.43 },
					// { "weight": 1.2 },
					{ "lightness": 0.04 }
				]
			}
		]
	};
	var map_1 = new google.maps.Map(document.getElementById("office_map-container"),
		$.extend({}, mapOptions, {'center': officeCoords}));

	var map_2 = new google.maps.Map(document.getElementById("showroom_map-container"),
		$.extend({}, mapOptions, {'center': showroomCoords}));

	var marker_1 = new google.maps.Marker({
		position: officeCoords,
		map: map_1,
		icon: "http://domcom.redis.tv/static/images/map_marker.png",
	});

	var marker_2 = new google.maps.Marker({
		position: showroomCoords,
		map: map_2,
		icon: "http://domcom.redis.tv/static/images/map_marker.png",
	});
}


function prepareMapContainers(listHeight) {
	var containers = $('.contacts_map-wrapper');
	containers.each(function(i, e){
		e = $(e);
		var h = e.parent().height();
		e.css('height', h);
		if (i == 1) {
			var map_c = e.children();
			map_c.css('height', map_c.height() + listHeight*2).css({
				'margin-top': -listHeight
				// 'margin-top': -(listHeight + )
			});
		}
	});
}


$(document).ready(function() {

	var h = $('.contacts_transport_container').outerHeight() +1;
	var transportWrapper = $('.contacts_transport_wrapper');
	var transportButton = $('.js_show_transport');
	var showText = transportButton.find('.contacst_show_transport_text.show');
	var hideText = showText.next();


	prepareMapContainers(listHeight=h);
	mapInitialize();


	transportButton.click(function() {
		if ( transportWrapper.data('showed') != 'true' ) {
			transportWrapper.data('showed', 'true').stop(true, false)
			.animate(
				{'height': h},
				1000,
				function() {
					showText.animate(
						{'opacity': 0},
						300,
						function() {
							showText.hide();
						}
					);
					hideText.show().animate(
						{'opacity': 1},
						300
					);
				}
			);
			$($('.contacts_map-wrapper')[1]).stop(true, false).animate(
				{'height': '+='+h},
				1000
			);
		} else {
			transportWrapper.data('showed', 'false').stop(true, false)
			.animate(
				{'height': 0},
				1000,
				function() {
					hideText.animate(
						{'opacity': 0},
						300,
						function() {
							hideText.hide();
						}
					);
					showText.show().animate(
						{'opacity': 1},
						300
					);
				}
			);
			$($('.contacts_map-wrapper')[1]).stop(true, false).animate(
				{'height': '-='+h},
				1000
			);
		}
	});
});
