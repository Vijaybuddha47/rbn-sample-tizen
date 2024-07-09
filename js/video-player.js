var listener = {
	onbufferingstart: function () {
		var onlineStatus = navigator.onLine;
		if (onlineStatus) {
			$(".video-inner").show();
			$(".circle_loader").addClass('circle-loader-middle');
			$(".progress-container").hide();

		} else {
			retry_error_popup();
		}
	},

	onbufferingprogress: function (percent) {
		var onlineStatus = navigator.onLine;
		if (onlineStatus) {
			try {
				$(".loader_btnoff").hide();
				// code when video buffers.
				$(".video-inner").show();
				$(".circle_loader").addClass('circle-loader-middle');

				if (webapis.avplay.getState() == "PAUSED") {
					$(".pause-icon").show();
					$(".loader_btnoff").show();
				} else if (webapis.avplay.getState() == "PLAYING") {
					$(".pause-icon").hide();
					$(".loader_btnoff").hide();
				}

				$(".pause-icon").hide();
			} catch (e) {
				retry_error_popup();

			}
		} else {
			retry_error_popup();
		}
	},

	onbufferingcomplete: function () {
		var onlineStatus = navigator.onLine;
		if (onlineStatus) {
			try {
				$(".video-inner").hide();
				$(".circle_loader").removeClass('circle-loader-middle');

				if (webapis.avplay.getState() == "PAUSED") {
					$(".pause-icon").hide();
					webapis.avplay.play();
				}
			} catch (e) {
				retry_error_popup();

			}
		} else {
			retry_error_popup();

		}
	},

	oncurrentplaytime: function (currentTime) {
		if (document.hidden) {
			console.log("App in background");
			webapis.avplay.suspend(); //Mandatory. If you use avplay, you should call this method.
		} else {
			try {
				$(".video-title").text('');

				if (webapis.avplay.getState() == "PAUSED") {
					webapis.avplay.play();
				} else {
					$(".video-inner").hide();
				}

				if ($('.retry_modal').css('visibility') == 'visible' || $(".pause-icon").is(":visible")) {
					webapis.avplay.pause();
				}

				sessionStorage.video_forward_time = currentTime;

				var duration = webapis.avplay.getDuration();
				totalTime = parseInt(min_two_digits(Math.floor((duration / 60000))) * 60) + parseInt(min_two_digits(Math.floor((duration / 1000) % 60)));

				var currentTime = webapis.avplay.getCurrentTime();
				currentTime = parseInt(min_two_digits(Math.floor((currentTime / 60000))) * 60) + parseInt(min_two_digits(Math.floor((currentTime / 1000) % 60)));

				var percentageCompleted = (currentTime / totalTime);
				var percentge = Math.round(percentageCompleted * (100));

				progress_bar(percentge);

				//Current playtime
				updateCurrentTime();

			} catch (e) {
				retry_error_popup();
				console.log("Error in current playtime: " + e);
			}
		}
	},

	onerror: function (eventType) {
		webapis.avplay.close();
		retry_error_popup(eventType);
		console.log("Error in stream: " + eventType);
	},

	onstreamcompleted: function () {
		try {
			console.log("stream completed");
			if(AD_PLAY) {
				AD_PLAY = false;
				AD_URL = '';
				VOD_URL = DATA_OBJ.stream_url;
				load_video();
			}else closeVideo();

		} catch (e) {
			console.log("Error in stream completed " + e);
		}
	}
};

var updateDuration = function () {
	try {
		var duration = webapis.avplay.getDuration();

		if (Math.floor(duration / 3600000) >= 1)
			document.getElementById("totalTime").innerHTML = min_two_digits(Math.floor(duration / 3600000)) + ":" + min_two_digits(Math.floor((duration / 60000) % 60)) + ":" + min_two_digits(Math.floor((duration / 1000) % 60));
		else
			document.getElementById("totalTime").innerHTML = min_two_digits(Math.floor((duration / 60000) % 60)) + ":" + min_two_digits(Math.floor((duration / 1000) % 60));
	} catch (e) {
		console.log("Error in update duration");
	}
};

var updateCurrentTime = function (currentTime) {
	try {
		if (currentTime == null)
			currentTime = webapis.avplay.getCurrentTime();

		if (Math.floor(currentTime / 3600000) >= 1)
			document.getElementById("currentTime").innerHTML = min_two_digits(Math.floor(currentTime / 3600000)) + ":" + min_two_digits(Math.floor((currentTime / 60000) % 60)) + ":" + min_two_digits(Math.floor((currentTime / 1000) % 60));
		else
			document.getElementById("currentTime").innerHTML = min_two_digits(Math.floor((currentTime / 60000) % 60)) + ":" + min_two_digits(Math.floor((currentTime / 1000) % 60));

		var time = webapis.avplay.getCurrentTime();
		var duration = webapis.avplay.getDuration();
		var time = ((Math.floor(currentTime / 3600000) * 3600) + Math.floor((currentTime / 60000) % 60) * 60 + (Math.floor((currentTime / 1000) % 60)));
		var totalTime = ((Math.floor(duration / 3600000) * 3600) + Math.floor((duration / 60000) % 60) * 60 + Math.floor((duration / 1000) % 60));
		var percentageCompleted = (time / totalTime);
		var percentge = Math.round(percentageCompleted * (100));
		progress_bar(percentge);
	} catch (e) {
		console.log("Error in update current time");
	}
};

var openVideo = function () {
	try {
		console.log("open video", VOD_URL);
		$(".video-inner").show();
		webapis.tvinfo.registerInAppCaptionControl(true);
		webapis.tvinfo.showCaption(false);
		if(AD_URL) webapis.avplay.open(AD_URL);
		else webapis.avplay.open(VOD_URL)
		webapis.avplay.setListener(listener);
		prepareVideo();

	} catch (e) {
		retry_error_popup();
		console.log("error in open function: " + e);
	}
};

var successCallback = function () {
	console.log('The media has finished preparing');
	if (webapis.avplay.getState() == "READY") {
		try {
			console.log("READY video");
			var avPlayerObj = document.getElementById("av-player");
			webapis.avplay.setDisplayRect(avPlayerObj.offsetLeft, avPlayerObj.offsetTop, avPlayerObj.offsetWidth, avPlayerObj.offsetHeight);
			webapis.avplay.setDisplayMethod("PLAYER_DISPLAY_MODE_FULL_SCREEN");
			webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF);
			updateDuration();
			register_mediakey();
			playVideo();
		} catch (e) {
			retry_error_popup();
			console.log("error in prepare 'In READY state' function: " + e);
		}
	}
}

var errorCallback = function () {
	console.log('The media has failed to prepare');
	retry_error_popup();
}

var prepareVideo = function () {
	try {
		console.log("prepare video");
		//webapis.avplay.prepare(successCallback, errorCallback);
		webapis.avplay.prepareAsync(successCallback, errorCallback);
	} catch (e) {
		retry_error_popup();
		console.log("error in prepare function: " + e);
	}
};

var playVideo = function () {
	if (document.hidden) {
		console.log("App in background");
	} else {
		console.log("play video");
		if ($('#video_container').css('display', 'block')) {
			$(".pause-icon").hide();
			$("#loader").hide();
			webapis.avplay.play();
			// show_hide_progress_bar_after_specific_time();
		} else {
			closeVideo();
		}
	}
};

var pauseVideo = function () {
	if ($('#video_container').is(':visible')) {
		console.log("pause video");
		$(".pause-icon").show();
		// $("#videoNextPreviousPlayPauseIcon").attr('src', 'images/play.png');
		webapis.avplay.pause();
		// show_hide_progress_bar_after_specific_time();
	}
};

var closeVideo = function () {
	console.log("close video");
	webapis.avplay.close();
	$(".main-container").show();
	hide_show_screens("home_container");
	SN.focus("#" + FOCUSED_ITEM);
	$(".circle_loader").removeClass('circle-loader-middle');
	unregister_mediakey();
	webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_ON);
	// show_hide_video_next_previous(false);
	sessionStorage.FWD_RWD_key_press = 0;
	$("#av-player").css('display', 'none');
	$("#video_container").hide();
	$(".video-inner").hide();
	$(".loader").hide();
	$(".progress-container").hide();
	$(".video_container").removeClass("active").hide();
	$(".pause-icon").hide();
	$(".video_next_previous_container").hide();
	$(".video_player_error_message").hide();
	// progress_bar(0);
	// document.getElementById("currentTime").innerHTML = "00:00";
};

var stopVideo = function () {
	webapis.avplay.stop();
	updateCurrentTime();
	show_hide_video_container();
	closeVideo();
};

var successForwardCallback = function (time) {
	console.log("success in jump forward");
};

var errorForwardCallback = function (time) {
	console.log("error in jump forward");
};

var jumpBackwardVideo = function (time) {
	// show_hide_progress_bar_after_specific_time();
	webapis.avplay.jumpBackward(time);
	updateCurrentTime();

	if (webapis.avplay.getState() == "PAUSED") {
		webapis.avplay.play();
	}
};

var jumpForwardVideo = function (time) {
	webapis.avplay.pause();
	// show_hide_progress_bar_after_specific_time();
	webapis.avplay.play();
	webapis.avplay.jumpForward(time, successForwardCallback, errorForwardCallback);
	updateCurrentTime();

	if (webapis.avplay.getState() == "PAUSED") {
		webapis.avplay.play();
	}
};

//This function increase/decrease position of progress bar
function progress_bar(percentage) {
	$('.progress-bar').css('width', percentage + "%");
}

function min_two_digits(number) {
    return (number < 10 ? '0' : '') + number;
  }

//This function is used to hide progress bar after 10 second
function show_hide_progress_bar_after_specific_time() {
	clearInterval(hide_progress_bar);
	if ((webapis.avplay.getState() == "PAUSED" || webapis.avplay.getState() == "PLAYING")) {
		console.log("hide");
		show_hide_video_next_previous(false);
		$(".progress-container").hide();

		$("#videoNextPrevious").hide();

		hide_progress_bar = setTimeout(function () {
			running = false;
			$(".video_next_previous_container").hide();
			$(".progress-container").hide();
			SN.focus('videoPlayer');
		}, 10000);
	}
}

function show_hide_video_next_previous(flag) {
	if (flag) $("#videoNextPrevious").css('display', 'table');
	else $("#videoNextPrevious").hide();
}

function forward_video() {
	console.log("farword");
	if ($("#av-player").css('display') == 'block') {
		console.log("farword 1", duration, sessionStorage.video_forward_time);
		var duration = webapis.avplay.getDuration();
		if (sessionStorage.video_forward_time < duration) {
			currentTime = sessionStorage.video_forward_time;
			sessionStorage.FWD_RWD_key_press = 1;
			var diffTime = duration - currentTime;
			if (diffTime <= MEDIA_FORWARD_INTERVAL)
				forwardInterval = diffTime;
			else
				forwardInterval = MEDIA_FORWARD_INTERVAL;

			var ctime = parseInt(currentTime) + parseInt(forwardInterval);
			if (Math.floor(ctime / 3600000) >= 1) {
				document.getElementById("currentTime").innerHTML = min_two_digits(Math.floor(ctime / 3600000)) + ":" + min_two_digits(Math.floor((ctime / 60000) % 60)) + ":" + min_two_digits(Math.floor((ctime / 1000) % 60));
			} else {
				document.getElementById("currentTime").innerHTML = min_two_digits(Math.floor((ctime / 60000) % 60)) + ":" + min_two_digits(Math.floor((ctime / 1000) % 60));
			}

			show_hide_progress_bar_after_specific_time();

			webapis.avplay.pause();
			if (webapis.avplay.getState() == "PAUSED") {
				$(".pause-icon").show();
				$("#videoNextPreviousPlayPauseIcon").attr('src', 'images/play.png');
			}

			sessionStorage.video_forward_time = ctime;

			var time = ((Math.floor(ctime / 3600000) * 3600) + Math.floor((ctime / 60000) % 60) * 60 + (Math.floor((ctime / 1000) % 60)));
			var totalTime = ((Math.floor(duration / 3600000) * 3600) + Math.floor((duration / 60000) % 60) * 60 + Math.floor((duration / 1000) % 60));
			var percentage_Completed = (time / totalTime);

			progress_bar(Math.round(percentage_Completed * (100)));
		}
	}
}

function rewind_video() {
	console.log("rewind");
	if ($("#av-player").css('display') == 'block') {
		console.log("rewind 1", sessionStorage.video_forward_time);
		if (sessionStorage.video_forward_time > 0 && webapis.avplay.getDuration() > 0) {
			currentTime = sessionStorage.video_forward_time;
			sessionStorage.FWD_RWD_key_press = 1;
			var diffTime = currentTime - MEDIA_REWIND_INTERVAL;

			if (diffTime <= 0)
				backwardInterval = currentTime;
			else
				backwardInterval = MEDIA_REWIND_INTERVAL;

			var ctime = parseInt(currentTime) - parseInt(backwardInterval);
			if (Math.floor(ctime / 3600000) >= 1) {
				document.getElementById("currentTime").innerHTML = min_two_digits(Math.floor(ctime / 3600000)) + ":" + min_two_digits(Math.floor((ctime / 60000) % 60)) + ":" + min_two_digits(Math.floor((ctime / 1000) % 60));
			} else {
				document.getElementById("currentTime").innerHTML = min_two_digits(Math.floor((ctime / 60000) % 60)) + ":" + min_two_digits(Math.floor((ctime / 1000) % 60));
			}

			show_hide_progress_bar_after_specific_time();

			webapis.avplay.pause();
			if (webapis.avplay.getState() == "PAUSED") {
				$(".pause-icon").show();
				$("#videoNextPreviousPlayPauseIcon").attr('src', 'images/play.png');
			}

			sessionStorage.video_forward_time = ctime;

			var duration = webapis.avplay.getDuration();
			var time = ((Math.floor(ctime / 3600000) * 3600) + Math.floor((ctime / 60000) % 60) * 60 + (Math.floor((ctime / 1000) % 60)));
			var totalTime = ((Math.floor(duration / 3600000) * 3600) + Math.floor((duration / 60000) % 60) * 60 + Math.floor((duration / 1000) % 60));
			var percentage_Completed = (time / totalTime);

			progress_bar(Math.round(percentage_Completed * (100)));
		}
	}
}

/***************************************
	This is for next / previous video
****************************************/
function previous_next_video(type) {

	$(".progress-container").hide();
	$(".video-title").text('');

	console.log("totalVideo", totalVideo);

	// hide next video button
	$("#playNextVideo").css('visibility', 'hidden');
	$("#playPreviousVideo").css('visibility', 'hidden');
	$("#playPauseVideo").attr('data-sn-right', 'null');

	switch (type) {
		case "previous":
			//play previous video
			break;

		case "next":
			//play next video
			break;
	}
}

//This function is used to hide progress bar after 10 second
function show_hide_programme_details_after_specific_time() {
	clearInterval(hide_programme_details);

	hide_programme_details = setTimeout(function () {
		running = false;
		if ($(".video_container").hasClass("active")) SN.focus('videoPlayer');
	}, 10000);
}

function load_video() {
	try {
		console.log("start playing video");
		$(".pause-icon").hide();
		show_hide_video_container();
		unregister_mediakey();
		webapis.avplay.close();
		$(".video_container").addClass("active");
		TAB_INDEX = 0;
		sessionStorage.FWD_RWD_key_press = 0;
		$(".progress-container").hide();
		$(".video_next_previous_container").hide();
		progress_bar(0);
		document.getElementById("currentTime").innerHTML = "00:00";
		$(".video-inner").css("display", "block").show();
		$(".buffered_dimension").css("display", "block").show();
		// show next video button
		$("#playPreviousVideo").css('visibility', 'hidden');
		$("#playNextVideo").css('visibility', 'hidden');
		$("#playPauseVideo").attr('data-sn-right', 'null');
		show_hide_video_next_previous(false);
		video_play_statewise();

	} catch (e) {
		console.log("Error in load video: " + e);
	}
}

function video_play_statewise() {
	console.log("video_play_statewise");
	if ($(".video_container").hasClass('active') && $('#video_container').is(':visible')) {
		if (webapis.avplay.getState() == "PAUSED") playVideo();
		else if (webapis.avplay.getState() == "PLAYING") pauseVideo();
		else {
			if (webapis.avplay.getState() == "NONE") {
				try {
					openVideo();
				} catch (e) {
					retry_error_popup();
				}
			} else if (webapis.avplay.getState() == "IDLE") {
				try {
					prepareVideo();
				} catch (e) {
					retry_error_popup();
				}
			} else if (webapis.avplay.getState() == "READY") {
				try {
					playVideo();
				} catch (e) {
					retry_error_popup();
				}
			}
		}
		SN.focus('videoPlayer');
	}
}

function retry_error_popup(playerErrorType) {
	console.log("retry_error_popup() " + webapis.avplay.getState(), playerErrorType);
	var onlineStatus = navigator.onLine;
	unregister_mediakey();

	progress_bar(0);
	show_hide_video_next_previous(false);

	var errorMsg = '';
	switch (playerErrorType) {
		case "PLAYER_ERROR_NONE": errorMsg = "Operation has successfully completed."; break;
		case "PLAYER_ERROR_INVALID_PARAMETER": errorMsg = "Unable to find the parameter"; break;
		case "PLAYER_ERROR_NO_SUCH_FILE": errorMsg = "Unable to find the specified media content"; break;
		case "PLAYER_ERROR_INVALID_OPERATION": errorMsg = "Invalid API Call at the moment"; break;
		case "PLAYER_ERROR_SEEK_FAILED": errorMsg = "Failed to perform seek operation, or seek operation called during an invalid state"; break;
		case "PLAYER_ERROR_INVALID_STATE": errorMsg = "AVPlay API method was called during an invalid state"; break;
		case "PLAYER_ERROR_NOT_SUPPORTED_FILE": errorMsg = "Multimedia file format not supported"; break;
		case "PLAYER_ERROR_INVALID_URI": errorMsg = "Input URI is in an invalid format"; break;
		case "PLAYER_ERROR_CONNECTION_FAILED": errorMsg = "Failed multiple attempts to connect to the specified content server"; break;
		case "PLAYER_ERROR_GENEREIC": errorMsg = "Failed to create the display window"; break;
	}

	if (onlineStatus) msg = "The content is currently unavailable. Please check back later.";
	else msg = NET_CONNECTION_ERR;

	if ($('#video_container').is(':visible') && $('#video_container').hasClass('active')) {
		if (errorMsg != "" && onlineStatus) msg = errorMsg;
		hide_show_modal(true, 'RETRY_CANCEL', msg);
	}
}
