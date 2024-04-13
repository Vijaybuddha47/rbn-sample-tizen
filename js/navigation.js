window.addEventListener('load', function () {
	window.SN = SpatialNavigation;
	SN.init();

	SN.add({
		id: 'videoSection',
		selector: '#videoSection .focusable',
		restrict: 'self-only',
		defaultElement: '#video_container',
	});

	// Add exit popup
	SN.add({
		id: 'exit_modal',
		selector: '#exit_modal .item',
		defaultElement: '#exitbtn0',
		enterTo: 'default-element',
		restrict: 'self-only',
	});

	// Add retry popup
	SN.add({
		id: 'retryCancelModal',
		selector: '#retryCancelModal .item',
		defaultElement: '#retryButton',
		restrict: 'self-only',
	});


	$('#videoSection').on('sn:focused', function () {
		console.log("video_container focused");
		$(".pause-icon").hide();
		$("#video_container").show().addClass('active');

	});

	SN.makeFocusable();

	$(window).keydown(function (evt) {
		var modalName = $(".modal_container").attr("data-modal-name");
		switch (evt.keyCode) {
			case 13: // Ok
				break;

			case 10009: // Pause 102
				if ($(".video_container").hasClass("active")) {
					hide_show_modal(true, "EXIT");

				} else if ($(".modal_container").hasClass("active")) {
					// When exit modal selected
					hide_show_modal(false, modalName);
					SN.focus("videoSection");

				}
				break;

			default:
				console.log("Key code : " + evt.keyCode);
				break;
		}
	});
});

function set_focus(containerId, itemId) {
	console.log("set focus");
	var restrictVal = "self-first";
	if (containerId == "EXIT" || containerId == "RETRY_CANCEL") restrictVal = "self-only";

	SN.remove(containerId);
	SN.add({
		id: containerId,
		selector: '#' + containerId + ' .focusable',
		restrict: restrictVal,
		defaultElement: '#' + itemId,
		enterTo: 'last-focused'
	});
	SN.makeFocusable();
}

function manage_spatial_navigation(containerClass, favoriteStatus, vodId) {
	switch (containerClass) {
		case "EXIT":
			set_focus('exitModal', 'noButton');

			$('#exitModal').on('sn:focused', function (e) {
				console.log("exitModal focus");
			});

			$('#noButton').on('sn:enter-down', function (e) {
				console.log('hide popup');
				hide_show_modal(false, 'EXIT');
				SN.focus("videoSection");
			});

			$('#yesButton').on('sn:enter-down', function (e) {
				console.log('exit app');
				window.close();
			});
			break;

		case "RETRY_CANCEL": set_focus('retryModal', 'retryButton');
			SN.focus("retryModal");

			$('#retryModal').off('sn:enter-down');
			$('#retryModal').on('sn:enter-down', function (e) {
				console.log("retryModal sn:enter-down");
				hide_show_modal(false, "RETRY_CANCEL");
				if ($('#retryButton').is(":focus")) load_video();
				else if ($("#cancelButton").is(":focus")) window.close();
			});
			break;

		case "RETRY_EXIT": set_focus('retryModal', 'retryButton');
			SN.focus("retryModal");

			$('#retryModal').off('sn:enter-down');
			$('#retryModal').on('sn:enter-down', function (e) {
				console.log("retryModal sn:enter-down");
				if ($('#noButton').is(":focus")) {
					console.log('hide popup');
					hide_show_modal(false, 'EXIT');
					SN.focus("videoSection");

				} else if ($("#yesButton").is(":focus")) {
					console.log('exit app');
					window.close();
				}

			});
			break;
	}
}