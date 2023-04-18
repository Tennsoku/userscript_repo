// ==UserScript==
// @name         BiliSearchPrint
// @namespace    http://tampermonkey.net/
// @version      0.2.0.7
// @description  Print all videos in the current search page in a json file.
// @author       You
// @match        https://search.bilibili.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @require      https://code.jquery.com/jquery-3.6.4.min.js
// @downloadURL  https://raw.githubusercontent.com/Tennsoku/userscript_repo/main/BiliSearchPrint.user.js
// @updateURL    https://raw.githubusercontent.com/Tennsoku/userscript_repo/main/BiliSearchPrint.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Read a page's GET URL variables and return them as an associative array.
    function getUrlVars()
    {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }


    var Node = document.createElement ('div');
    Node.innerHTML = '<button id="myButton" class="vui_button vui_button--blue vui_button--lg" type="button">'
        + '爬！</button>';
    Node.setAttribute ('id', 'myContainer');

    $('.search-input-wrap').prepend(Node);

    //--- Activate the newly added button.
    $("#myButton").on(
        "click", ButtonClickAction
    );

    function ButtonClickAction (Event) {
        let totalPage = $("button.vui_pagenation--btn-num").last().text();
        let keyword = decodeURIComponent(getUrlVars()["keyword"]);
        let currentPage = getUrlVars()["page"] ? getUrlVars()["page"] : 1;

        let listWrapper = $(".video.search-all-list").length ? $(".video.search-all-list") : $(".search-page-video");
        let currentVideoList = $(listWrapper).find(".bili-video-card__wrap");
        let map = {"keyword": keyword, "currentResultPage": currentPage, "totalResultPage": totalPage, "content": {}};
        let links = $(currentVideoList).each(function(self){
            let link = $(this).children("a").attr("href");
            let BV = link.match(/\bBV\w*\b/g);
            let subdomain = link.match(/(?<=\/\/)(\S+?)(?=\.)/g);

            let owner = $(this).find(".bili-video-card__info--owner").get(0);
            let video = $(this).find(".bili-video-card__info--tit").get(0);
            let title = $(video).attr("title");

            link = $(owner).attr("href");
            let BID = link.match(/([0-9]+)/g);

            if (subdomain[0] == "cm") {
                console.log("呱，是阿姨的广告!", title, subdomain);
                return;
            }

            map["content"][title] = {"BV": BV[0], "BID": BID[0]};
        });

        $("<a id='downloadAnchorElem' style='display:none'></a>").appendTo("body").hide();
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(map,null,4));
        let dlAnchorElem = document.getElementById('downloadAnchorElem');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `${keyword} ${currentPage}-${totalPage}.json`);
        dlAnchorElem.click();
    }
})();