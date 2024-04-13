/*
 * Copyright (c) 2020 LG Electronics Inc.
 * SPDX-License-Identifier: CC0-1.0
 */
var itemArray = document.getElementsByClassName("focusable");

function addEventListeners() {
	for (var i = 0; i < itemArray.length; i++) {
		itemArray[i].addEventListener("mouseover", _onMouseOverEvent);
		itemArray[i].addEventListener("click", _onClickEvent);
	}
}

function _onClickEvent(e) {
	elementId = e.target.id;
	console.log(elementId + " is clicked!");
	if (elementId.search("retryButton") > -1 || elementId.search("cancelButton") > -1) {
		hide_show_modal(false, "RETRY_CANCEL");
		if ($('#retryButton').is(":focus")) load_video();
		else if ($("#cancelButton").is(":focus")) window.close();

	} else if (elementId.search("noButton") > -1 || elementId.search("yesButton") > -1) {
		if ($('#noButton').is(":focus")) {
			console.log('hide popup');
			hide_show_modal(false, 'EXIT');
			SN.focus("videoSection");

		} else if ($("#yesButton").is(":focus")) {
			console.log('exit app');
			window.close();
		}
	}

}

function _onMouseOverEvent(e) {
	for (var i = 0; i < itemArray.length; i++) {
		itemArray[i].blur();
	}
	var elementId = e.target.id;
	console.log("focus container id", e.target.id);
	if (elementId != "") {
		if (elementId.search("content") > -1) $("#" + elementId).closest('li').focus();
		else document.getElementById(elementId).focus();
	}
}