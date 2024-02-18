// ==UserScript==
// @name         GitHub Actions Filter Button
// @namespace    http://www.nxw.name
// @version      1.0.0
// @description  Filter Kata Containers passed or non-required checks.
// @author       Xuewei Niu
// @match        https://github.com/kata-containers/kata-containers/pull/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// @license      Apache-2.0
// ==/UserScript==
 
var hidden = false;
var loaded = false;
 
function filterButtonOnClick() {
    hidden = !hidden;
    var checks = document.querySelectorAll('#partial-pull-merging div.merge-status-list.hide-closed-list.js-updatable-content-preserve-scroll-position > div');
    checks.forEach(function(check) {
        if (hidden) {
            var statusElement = check.querySelector('div:nth-child(3)');
            if (!statusElement) {
                // console.log(check, 'check status not found');
                return;
            }
            var detailsElement = check.querySelector('div:nth-child(4)');
            if (!detailsElement) {
                return;
            }
 
            var successful = statusElement.textContent.includes('Successful in') || statusElement.textContent.includes('Build finished');
            var required = detailsElement.textContent.includes('Required');
 
            if (successful || !required) {
                check.classList.add('hidden-check');
            }
        } else {
            check.classList.remove('hidden-check');
        }
    });
}
 
function insertFilter() {
    var hideAllChecks = document.querySelector('#partial-pull-merging div.branch-action-item.js-details-container.Details.open button');
    if (!hideAllChecks) {
        console.log('Failed to find filter button container');
        return;
    }
 
    loaded = true;
 
    var filterButton = document.createElement('button');
    filterButton.type = 'button';
    filterButton.textContent = 'Filter Passed or Non-required Checks';
    filterButton.addEventListener('click', filterButtonOnClick);
 
    hideAllChecks.parentNode.insertBefore(filterButton, filterButton.nextSibling);
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
        console.log("Iteration: " + count);
        count++;
        insertFilter();
        setTimeout(iterate, 1000);
    }
 
    iterate();
}
 
(function() {
    'use strict';
 
    var stateElem = document.querySelector('#partial-discussion-header .State');
    if (stateElem) {
        var title = stateElem.getAttribute('title');
        if (title !== 'Status: Open' && title !== 'Status: Draft') {
            console.log('GitHub Actions Filter Button: Exit as the status of PR is neither "open" nor "draft".');
            return;
        }
    } else {
        console.log('GitHub Actions Filter Button: Can\'t determine PR\'s status.');
        return;
    }
 
    insertHiddenCheckCssStyle();
 
    loopWithDelay();
})();
