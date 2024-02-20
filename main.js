// ==UserScript==
// @name         GitHub Actions Filter Button
// @namespace    http://www.nxw.name
// @version      1.0.1
// @description  Filter Kata Containers passed or non-required checks.
// @author       Xuewei Niu
// @match        https://github.com/kata-containers/kata-containers/pull/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// @license      Apache-2.0
// @downloadURL  https://update.greasyfork.org/scripts/486753/GitHub%20Actions%20Filter%20Button.user.js
// @updateURL    https://update.greasyfork.org/scripts/486753/GitHub%20Actions%20Filter%20Button.meta.js
// ==/UserScript==

var hidden = false;
var loaded = false;

function onFilterButtonClicked() {
    hidden = !hidden;
    var checks = document.querySelectorAll('div.merge-status-list.hide-closed-list.js-updatable-content-preserve-scroll-position > div');
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
    var checkSummary = document.querySelector('div.branch-action-item.js-details-container.Details.open div:nth-child(2)');
    if (!checkSummary) {
        console.log('Failed to find check summary div');
        return;
    }

    loaded = true;

    var filterButton = document.createElement('button');
    filterButton.type = 'button';
    filterButton.textContent = 'Filter Passed or Non-required Checks';
    filterButton.addEventListener('click', onFilterButtonClicked);

    checkSummary.insertBefore(filterButton, filterButton.nextSibling);
}

function insertHiddenCheckCssStyle() {
    var styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    var cssRule = document.createTextNode('.hidden-check { display: none !important }');
    styleElement.appendChild(cssRule);
    document.head.appendChild(styleElement);
}

function loopWithDelay() {
    var count = 0;

    function iterate() {
        if (loaded) {
            return;
        }
        // retry 60 times (1 min)
        if (count == 60) {
            return;
        }
        console.log("GHA Actions Filter Button Iteration: " + count);
        count++;
        insertFilterButton();
        setTimeout(iterate, 1000);
    }

    iterate();
}

(function() {
    'use strict';

    insertHiddenCheckCssStyle();

    loopWithDelay();
})();
