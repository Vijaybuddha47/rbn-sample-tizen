window.onload = function () {
	$('title').text(APP_NAME);
	$('meta[name=description]').attr('content', APP_NAME);

	// TODO:: Do your initialization job
	$("body").removeAttr("style");
	$(".splash-screen").show();

	// Load html files
	$("span#modal_container").load("modal.html");
	$(".splash-screen").css({ 'position': 'absolute', 'z-index': '100' });

    getAppData();

	setTimeout(function () { load_main_screen(); }, 5000);
};

function load_main_screen() {
	if (navigator.onLine) {

        if(DATA_OBJ.ad_unit.trim() != '') parse_vast_tag();
		else {
            VOD_URL = DATA_OBJ.stream_url;
            load_video();
        }

		// load_video();

	} else {
		hide_show_modal(true, "RETRY_EXIT", NET_CONNECTION_ERR);
	}
}


function show_hide_video_container() {
	$("#video_container").show().addClass('active');
}

function remove_add_active_class(className) {
	console.log("remove add active class");
	if ($("body").find(".active").length > 0) {
		$("body").find(".active").each(function () {
			if ($(this).className != className) $(this).removeClass("active");
		});
	}
	$("." + className).addClass("active");
}

// Open video screen
function show_hide_video_container() {
    $(".pause-icon").hide();
    $(".video-inner").show();
    $(".video-loader").show();
    $(".home_container").hide();
    $("#video_container").show();
    $("#av-player").css("display", "block");
}

//This function is used to register Media Key of Remote
function register_mediakey() {
    tizen.tvinputdevice.registerKey("MediaFastForward");
    tizen.tvinputdevice.registerKey("MediaRewind");
    tizen.tvinputdevice.registerKey("MediaPlay");
    tizen.tvinputdevice.registerKey("MediaPause");
    tizen.tvinputdevice.registerKey("MediaStop");
    return;
}

//This function is used to Unregister Media Key of Remote
function unregister_mediakey() {
    tizen.tvinputdevice.unregisterKey("MediaFastForward");
    tizen.tvinputdevice.unregisterKey("MediaRewind");
    tizen.tvinputdevice.unregisterKey("MediaPlay");
    tizen.tvinputdevice.unregisterKey("MediaPause");
    tizen.tvinputdevice.unregisterKey("MediaStop");
    return;
}


// It returns current vod object while playing video
function get_video_obj() {
    var obj = "";
    switch (PAGE_INDEX) {
        case 2: obj = APP_LIVE_CHANNEL[0];
            break;

        case 3: obj = SUB_CAT_VOD_ARRAY[SELECTED_VIDEO_INDEX];
            break;
    }

    return obj;
}

function getAppData(){
	console.log("getAppData");

    $.ajax({
        type: 'GET',
        url: APP_URL,
        headers: { 'Accept': 'application/json' },
        contentType: 'application/x-www-form-urlencoded; charset=utf-8',
        dataType: 'json',
        async: true,
        cache: false,
        success: function (response) {
            let str = response.ad_unit;
            DATA_OBJ = response;
            if(str.trim() != ''){
                DATA_OBJ.ad_unit = "https://pubads.g.doubleclick.net/gampad/ads?iu="+str+"/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=";
                // if(DATA_OBJ.ad_unit != '') DATA_OBJ.ad_unit = "https://pubads.g.doubleclick.net/gampad/ads?iu="+DATA_OBJ.ad_unit+"/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=";
            }
        },
        error: function (xhr, error) {
            console.log("error", error);
			if (navigator.onLine) msg = NET_CONNECTION_ERR;
            else msg = DATA_PARSE_ERR;
            hide_show_modal(true, "RETRY_EXIT", msg);
        }
    });

}


function parse_vast_tag() {
    dfpUrl =  DATA_OBJ["ad_unit"] + Math.floor(Math.random() * 1000000) + 1;

    try {
        var contextType = "",
            newDfpUrl = "",
            keywordString = "",
            customParamString = "",
            videoId = "";

        if (VAST_TAG_ARR.length < 1) {
            VAST_TAG_ARR['wrapper'] = [];
            VAST_TAG_ARR['tracking'] = [];
            VAST_TAG_ARR['inline'] = [];
        }

        $.ajax({
            type: "GET",
            url: dfpUrl,
            async: false,
            dataType: "xml",
            success: function (xml) {
                console.log(xml);

                $(xml).find('Ad').each(function () {
                    var inline = $(this).find('InLine').length;
                    var wrapper = $(this).find('Wrapper').length;

                    if (inline > 0) {
                        var maxWidth = 0;

                        $(this).find('MediaFile').each(function () {
                            var type = $(this).attr('type');
                            if (type == 'video/mp4' || type == 'video/x-mp4') {
                                var width = $(this).attr('width');
                                if (parseInt(width) > parseInt(maxWidth)) {
                                    maxWidth = width;
                                    console.log(VAST_TAG_ARR, $(this).text());
                                    VAST_TAG_ARR['inline'][INLINE_COUNTER] = $.trim($(this).text());
                                }

                            }


                            VAST_TAG_ARR['tracking'][INLINE_COUNTER] = new Array();
                            VAST_TAG_ARR['tracking'][INLINE_COUNTER]['skip_offset_val'] = new Array();
                            VAST_TAG_ARR['tracking'][INLINE_COUNTER]['error'] = new Array();
                            VAST_TAG_ARR['tracking'][INLINE_COUNTER]['impression'] = new Array();
                            VAST_TAG_ARR['tracking'][INLINE_COUNTER]['start'] = new Array();
                            VAST_TAG_ARR['tracking'][INLINE_COUNTER]['firstQuartile'] = new Array();
                            VAST_TAG_ARR['tracking'][INLINE_COUNTER]['midpoint'] = new Array();
                            VAST_TAG_ARR['tracking'][INLINE_COUNTER]['thirdQuartile'] = new Array();
                            VAST_TAG_ARR['tracking'][INLINE_COUNTER]['complete'] = new Array();
                            VAST_TAG_ARR['tracking'][INLINE_COUNTER]['skip'] = new Array();

                            var skipoffsetVal = $(xml).find('Linear').attr('skipoffset');
                            if (typeof skipoffsetVal != 'undefined') {
                                var a = skipoffsetVal.split(':'); // split it at the colons
                                var skipSeconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
                                VAST_TAG_ARR['tracking'][INLINE_COUNTER]['skip_offset_val'] = skipSeconds;
                            } else {
                                VAST_TAG_ARR['tracking'][INLINE_COUNTER]['skip_offset_val'] = "";
                            }

                            VAST_TAG_ARR['tracking'][INLINE_COUNTER]['error'] = $(xml).find('Error').text();
                            VAST_TAG_ARR['tracking'][INLINE_COUNTER]['impression'] = $(xml).find('Impression').text();

                            $(xml).find('Tracking').each(function () {
                                eventType = $(this).attr('event');
                                switch (eventType) {
                                    case "start":
                                        VAST_TAG_ARR['tracking'][INLINE_COUNTER]['start'] = $(this).text();
                                        break;

                                    case "firstQuartile":
                                        VAST_TAG_ARR['tracking'][INLINE_COUNTER]['firstQuartile'] = $(this).text();
                                        break;

                                    case "midpoint":
                                        VAST_TAG_ARR['tracking'][INLINE_COUNTER]['midpoint'] = $(this).text();
                                        break;

                                    case "thirdQuartile":
                                        VAST_TAG_ARR['tracking'][INLINE_COUNTER]['thirdQuartile'] = $(this).text();
                                        break;

                                    case "complete":
                                        VAST_TAG_ARR['tracking'][INLINE_COUNTER]['complete'] = $(this).text();
                                        break;

                                    case "skip":
                                        VAST_TAG_ARR['tracking'][INLINE_COUNTER]['skip'] = $(this).text();
                                        break;
                                }
                            });
                        });
                        INLINE_COUNTER++;
                    } else if (wrapper > 0) {
                        VAST_TAG_ARR['wrapper'][WRAPER_COUNTER] = $.trim($(this).find('VASTAdTagURI').text());
                        WRAPER_COUNTER++;
                    }

                });

                if (VAST_TAG_ARR['wrapper'].length > 0) {
                    parse_vast_tag(VAST_TAG_ARR['wrapper'][0]);
                } else if (VAST_TAG_ARR['inline'].length > 0 && VAST_TAG_ARR['inline'].length > VAST_ADS_COUNTER) {
                    AD_URL = VAST_TAG_ARR['inline'][VAST_ADS_COUNTER];
                    // if(DATA_OBJ[0]["adUrl"]) VOD_URL = DATA_OBJ[0]["adUrl"];
                    // else VOD_URL = DATA_OBJ[0]["videoUrl"];

                    load_video();
                } else {
                    AD_URL = "";
                    load_video();
                }

            },
            error: function (error) {
                console.log(error);
                if (VAST_TAG_ARR['wrapper'].length > 0) {
                    parse_vast_tag(VAST_TAG_ARR['wrapper'][0]);
                } else if (VAST_TAG_ARR['inline'].length > 0 && VAST_TAG_ARR['inline'].length > VAST_ADS_COUNTER) {
                    VAST_ADS_COUNTER++;
                    // closeVideo();
                    AD_URL = VAST_TAG_ARR['inline'][VAST_ADS_COUNTER];
                    load_video();
                } else {
                    console.log("error in get_add");
                    AD_URL = "";
                    load_video();
                }
            }
        });
    } catch (e) {
        console.log("Error in get URL: " + e);
        AD_URL = "";
    }

}

