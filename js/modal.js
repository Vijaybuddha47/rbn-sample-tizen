function set_modal_color(name) {
	// $('.mod_bg_color').css('background', 'url("images/exit.png")');
	if (name == "EXIT") {
		$(".mod_text_color").css("color", MODAL_TEXT_COLOR).html(APP_EXIT_MSG);

	} else {
		$(".mod_text_color").css("color", MODAL_TEXT_COLOR);
	}
}

function hide_show_modal(action, name, message) {
	var modalName = $(".modal_container").attr("data-modal-name");
	if (action == true && !modalName) {
		$(".modal_container").addClass("active");
		set_modal_color(name);
		// Set previous depth before open modal box
		if ($(".video_container").hasClass("active")) {
			TAB_INDEX = 0;
		}

		// Remove active class from all container and add to modal box
		remove_add_active_class("modal_container");
		$(".modal_container").addClass("active");

		if (name == "EXIT") {
			$(".exit_modal").addClass("exit_modal_show");
			$('.mod_button_sel').text("NO");
			$('.mod_button_un_sel').text("YES");
			$(".mod_text_color").html(message);

		} else if (name == "RETRY_CANCEL") {
			$(".retry_modal").addClass("popup_new_box");
			$(".mod_text_color").html(message);
			$(".mod_name").html(APP_NAME);
			$('.mod_button_sel').text("RETRY");
			$('.mod_button_un_sel').text("CANCEL");

		} else if (name == "RETRY_EXIT") {
			$(".retry_modal").addClass("popup_new_box");
			$(".mod_text_color").html(message);
			$(".mod_name").html(APP_NAME);

			$('.mod_button_sel').text("RETRY");
			$('.mod_button_un_sel').text("EXIT");

		}

		$(".modal_container").attr("data-modal-name", name);
		manage_spatial_navigation(name);

		if (name == "EXIT") {
			//webkitTransitionEnd oTransitionEnd MSTransitionEnd
			SN.focus("exitModal");
			$(".exit_modal").one("transitionend", function () {
				// manage_spatial_navigation(name);
			});

		} else {
			manage_spatial_navigation(name);
		}

	} else if (action == false) {
		console.log('hide popup');
		$(".modal_container").removeClass("active");
		$(".modal_container").attr("data-modal-name", "");

		if (name == 'EXIT') {
			$(".video_container").addClass("active");
			$(".main-container").removeClass("pointer");
			$(".exit_modal").removeClass("exit_modal_show");
			SN.focus('menuList');
			console.log('hide exit popup');

		} else if (name == "RETRY_CANCEL") {
			$(".retry_modal").removeClass("popup_new_box");
		}
	}
}