$(document).ready(function() {


	// Ховер на домик показывает белую рамку и слово подробнее
	$('.catalogue_projects').on('mouseenter', '.catalogue_project_image_link', function() {
		var this_ = $(this);
		var elem = this_.closest('.catalogue_project');
		var hovered_elements = elem.find('.catalogue_project_hover_details')
			.add(elem.find('.catalogue_project_hover_bg'));
		hovered_elements.show().stop(true, false).animate(
			{
				'opacity': 1,
				'marginTop': 0
			},
			350
		)
	});

	$('.catalogue_projects').on('mouseleave', '.catalogue_project_image_link', function() {
		var this_ = $(this);
		var elem = this_.closest('.catalogue_project');
		var hovered_element_1 =  elem.find('.catalogue_project_hover_details');
		var hovered_element_2 =  elem.find('.catalogue_project_hover_bg');
		hovered_element_1.stop(true,false).animate(
			{
				'opacity': 0,
				'marginTop': '-10px'
			},
			350,
			function() {
				hovered_element_1.hide();
			}
		);
		hovered_element_2.stop(true, false).animate(
			{
				'opacity': 0,
				'marginTop': '10px'
			},
			350,
			function() {
				hovered_element_2.hide();
			}
		);
	});
})
