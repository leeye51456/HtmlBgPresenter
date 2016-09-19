/*jslint node:true regexp:true*/
/*global $, jQuery, alert, confirm */
'use strict';

var
  wnd,
  fileArray = [''],
  sessionId = Date.now(),
  sessionIdShort = sessionId % 86400000;


// functions

function wndInit(e) {
  if (wnd && !wnd.closed && confirm('송출 창을 닫으려면 확인을 누르세요.')) {
    wnd.close();
    return;
  }
  wnd = window.open('', 'wnd' + sessionId, 'scrollbar=no');
  try {
    wnd.document.write('<!doctype html>' +
      '<html>' +
      '<head>' +
      '<meta charset="utf-8">' +
      '<title>[송출] HtmlBgPresenter (' + sessionIdShort + ')</title>' +
      '<link rel="stylesheet" href="presenter.css" type="text/css">' +
      '</head>' +
      '<body>' +
      '<section id="bg-section">' +
      '<div id="bottom-div"></div>' +
      '<div id="top-div"></div>' +
      '</section>' +
      '<section id="ftb-section"></section>' +
      '</body>' +
      '</html>');
  } catch (err) {
    if (confirm('송출 창을 다시 띄워야 합니다.\n송출 창을 다시 띄우려면 확인을 누르세요.')) {
      wnd = window.open('', 'wnd' + sessionId, '');
      wnd.close();
      wndInit();
    }
    return;
  }
  
  $(wnd)
    .on('unload', function () {
      $('#pgm-div').css('outline-color', '');
      $(wnd).off();
    });
}

function bgCutBtnClick() {
  //
}

function bgAutoBtnClick() {
  //
}

function applySetting() {
  //
}
function discardSetting() {
  //
}

function appendFiles(e) {
  //
}

function moveSelection(e) {
  //
}

function invertSelection() {
  //
}
function uncheckSelection() {
  //
}
function deleteSelection() {
  //
}
function resetList() {
  //
}

function listClick() {
  //
}

function listDoubleClick() {
  //
}

function checkBg(e) {
  //
}


// 함수 목록 맨 아래에 오도록
function blurThis(e) {
  $(e.target).trigger('blur');
}


// event listeners
$(document).ready(function () {
  var
    sessionIdHtml = '<small>' + Math.floor(sessionId / 86400000) + '-</small><b>' + (sessionId % 86400000) + '</b>';
  
  document.title = 'HtmlBgPresenter (' + sessionIdShort + ')';
  $('#session-label').html('세션 ' + sessionIdHtml);
  
  $('#window-button')
    .on('click', wndInit)
    .on('focus', blurThis);
  
  $('#bg-cut-button')
    .on('click', bgCutBtnClick)
    .on('focus', blurThis);
  $('#bg-auto-button')
    .on('click', bgAutoBtnClick)
    .on('focus', blurThis);
  
  $('#apply-setting-button')
    .on('click', applySetting)
    .on('focus', blurThis);
  $('#discard-setting-button')
    .on('click', discardSetting)
    .on('focus', blurThis);
  
  $('#append-files')
    .on('change', appendFiles)
    .on('focus', blurThis);
  $('#send-sel-up-button, #send-sel-down-button')
    .on('click', moveSelection)
    .on('focus', blurThis);
  $('#inv-sel-button')
    .on('click', invertSelection)
    .on('focus', blurThis);
  $('#unsel-button')
    .on('click', uncheckSelection)
    .on('focus', blurThis);
  $('#del-sel-button')
    .on('click', deleteSelection)
    .on('focus', blurThis);
  $('#reset-list-button')
    .on('click', resetList)
    .on('focus', blurThis);
  
  $('#list-tbody')
    .on('click', 'tr', listClick)
    .on('dblclick', 'tr', listDoubleClick)
    .on('click', 'td:first-child', checkBg);
});
