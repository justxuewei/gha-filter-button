// ==UserScript==
// @name         GitHub Actions Filter Button
// @namespace    http://www.nxw.name
// @version      1.0.3
// @description  Filter Kata Containers passed or non-required checks.
// @author       Xuewei Niu
// @match        *://github.com/kata-containers/kata-containers/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// @license      Apache-2.0
// @downloadURL https://update.greasyfork.org/scripts/486753/GitHub%20Actions%20Filter%20Button.user.js
// @updateURL https://update.greasyfork.org/scripts/486753/GitHub%20Actions%20Filter%20Button.meta.js
// ==/UserScript==

var hidden = false;
var filterButton;

function onFilterButtonClicked() {
    var checks = document.querySelectorAll('div.merge-status-list.hide-closed-list.js-updatable-content-preserve-scroll-position > div');
    if (checks.length == 0) {
        console.log('stop hiding checks: they aren\'t ready')
        return;
    }

    hidden = !hidden;
    checks.forEach(function(check) {
        console.debug('check item', check);
        if (hidden) {
            var statusElement = check.querySelector('div:nth-child(3)');
            if (!statusElement) {
                console.debug(statusElement, 'check status not found');
                return;
            }
            var detailsElement = check.querySelector('div:nth-child(4)');
            if (!detailsElement) {
                console.debug(detailsElement, 'check details not found');
                return;
            }

            var statusText = statusElement.textContent;
            var requiredText = detailsElement.textContent;
            // 'Successful in' for GHA, 'Build finished' for Jenkins
            var successful = statusText.includes('Successful in') || statusText.includes('Build finished');
            var required = requiredText.includes('Required');

            if (successful || !required) {
                console.debug('check item is hidden: successful: ' + successful + ', required: ' + required)
                check.classList.add('hidden-check');
            }
        } else {
            check.classList.remove('hidden-check');
        }
    });
}

function insertFilterButton() {
    var body = document.querySelector('body');
    var bodyFirstChild = document.querySelector('body div:nth-child(1)');

    filterButton = document.createElement('button');
    filterButton.type = 'button';
    filterButton.textContent = 'Filter Checks';
    filterButton.classList.add('gha-filter-button');
    filterButton.classList.add('hidden-check');
    filterButton.addEventListener('click', onFilterButtonClicked);

    body.insertBefore(filterButton, bodyFirstChild);
}

function insertHiddenCheckCssStyle() {
    var styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    var cssRule = document.createTextNode('.hidden-check { display: none !important }\n.gha-filter-button { position: fixed; bottom: 100px; right: 20px; display: block; z-index: 10000; background-color: #218bff; color: #fff; padding: 5px 16px; border: none; border-radius: 6px;}');
    styleElement.appendChild(cssRule);
    document.head.appendChild(styleElement);
}

function updateFilterButton(href) {
    const regex = /github\.com\/kata-containers\/kata-containers\/pull\/\d+$/;
    if (regex.test(href)) {
        console.log('show filter button', href);
        filterButton.classList.remove('hidden-check');
    } else {
        console.log('hide filter button', href);
        filterButton.classList.add('hidden-check');
    }
}

function listenUrlChanged() {
    var _wr = function (type) {
        var orig = history[type];
        return function () {
            var rv = orig.apply(this, arguments);
            var e = new Event(type);
            e.arguments = arguments;
            window.dispatchEvent(e);
            return rv;
        };
    };
    history.pushState = _wr('pushState');
    window.addEventListener('pushState', function (e) {
        console.debug('Url changed', window.location.href);
        updateFilterButton(window.location.href);
    });
}

(function() {
    'use strict';

    insertHiddenCheckCssStyle();
    insertFilterButton();
    updateFilterButton(window.location.href);
    listenUrlChanged();
})();
