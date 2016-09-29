/*jslint node:true regexp:true*/
/*global $, jQuery, alert, confirm */
'use strict';

var
  wnd,
  fileList = [''],
  sessionId = Date.now(),
  sessionIdShort = sessionId % 86400000;

var bg = { pvw: 0, pgm: 0 };


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

function displayPvw() {
  var
    bgPvwObject = fileList[bg.pvw],
    oldPvw = $('#pvw-div').html().replace(/<(?:video|img) src=\"\.\/src\/(.+?)\".+/i, '$1'),
    newPvw = bgPvwObject.name;
  if (oldPvw !== newPvw) {
    if (bgPvwObject.type === 'v') {
      $('#pvw-div').html('<video src="./src/' + newPvw + '" class="pvw-video" autoplay loop muted></video>');
    } else if (bgPvwObject.type === 'i') {
      $('#pvw-div').html('<img src="./src/' + newPvw + '" class="pvw-img">');
    } else {
      $('#pvw-div').html('');
    }
  }
}
function changePvw(pageNum) {
  bg.pvw = pageNum;
  $('#list-tbody')
    .find('tr')
    .removeClass('pvw')
    .filter(function () {
      return $(this).data('index') === bg.pvw;
    })
    .addClass('pvw');
  displayPvw();
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

function getFileListRow(index, type, name) {
  if (index === 0) {
    return '<tr data-index="0"><td></td><td>0</td><td></td><td>(검은 화면)</td></tr>';
  }
  return '<tr data-index="' + index + '"><td><input type="checkbox" data-index="' + index + '"></td><td>' + index + '</td><td>' + type + '</td><td>' + name + '</td></tr>';
}
function displayFileList() {
  var
    i,
    len = fileList.length,
    html = '';
  for (i = 0; i < len; i += 1) {
    html += getFileListRow(i, fileList[i].type, fileList[i].name);
  }
  $('#list-tbody').html(html);
}
function appendFiles() {
  var
    i,
    fileForm = $('#append-files'),
    len = fileForm[0].files.length;
  if (len > 0) {
    for (i = 0; i < len; i += 1) {
      fileList.push({
        name: fileForm[0].files[i].name,
        type: fileForm[0].files[i].type[0]
      });
    }
    fileForm.val('');
    displayFileList();
  }
}

function getCheckedIndex(reverse) {
  var result = [];
  $('#list-tbody').find('input[type="checkbox"]:checked').each(function () {
    result.push(Number($(this).data('index')));
  });
  if (reverse) {
    return result.reverse();
  }
  return result;
}

function moveOneItem(index, direction) {
  if (direction < 0 && index > 1) {
    fileList.splice(index - 1, 2, fileList[index], fileList[index - 1]);
    return true;
  } else if (direction > 0 && index < fileList.length - 1) {
    fileList.splice(index, 2, fileList[index + 1], fileList[index]);
    return true;
  }
  return false;
}
function selectItems(arr) {
  $('#list-tbody')
    .find('input[type="checkbox"]')
    .filter(function () {
      return arr.indexOf(Number($(this).data('index'))) + 1;
    })
    .prop('checked', true);
}
function moveSelection(e) {
  var
    direction = e.data.direction,
    continuous = (fileList.length - direction) % fileList.length,
    checkedIndex = getCheckedIndex(direction + 1),
    checkedAfterMove = checkedIndex.slice();
  checkedIndex.forEach(function (item, index) {
    if (continuous === item) {
      continuous -= direction;
    } else {
      moveOneItem(item, direction);
      checkedAfterMove[index] += direction;
    }
  });
  displayFileList();
  selectItems(checkedAfterMove);
}

function invertSelection() {
  $('#list-tbody').find('input[type="checkbox"]').each(function () {
    $(this).prop('checked', !($(this).prop('checked')));
  });
}
function uncheckSelection() {
  $('#list-tbody').find('input[type="checkbox"]:checked').prop('checked', false);
}
function deleteSelection() {
  var checkedIndex = getCheckedIndex(true);
  checkedIndex.forEach(function (item) {
    fileList.splice(item, 1);
  });
  displayFileList();
}
function resetList() {
  if (confirm('리스트를 비우려면 확인을 누르세요.')) {
    fileList = [''];
    displayFileList();
  }
}

function listClick(e) {
  changePvw(Number($(e.target).closest('tr').data('index')));
}

function listDoubleClick() {
  //
}

function changeBgCheckbox(e) {
  $(e.target).find('input').trigger('click');
}
function checkboxInTableClick(e) {
  e.stopPropagation();
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
  
  $('input[type!="number"],button')
    .on('focus', blurThis);
  
  $('#window-button')
    .on('click', wndInit);
  
  $('#bg-cut-button')
    .on('click', bgCutBtnClick);
  $('#bg-auto-button')
    .on('click', bgAutoBtnClick);
  
  $('#apply-setting-button')
    .on('click', applySetting);
  $('#discard-setting-button')
    .on('click', discardSetting);
  
  $('#append-files')
    .on('change', appendFiles);
  $('#send-sel-up-button')
    .on('click', { direction: -1 }, moveSelection);
  $('#send-sel-down-button')
    .on('click', { direction: 1 }, moveSelection);
  $('#inv-sel-button')
    .on('click', invertSelection);
  $('#unsel-button')
    .on('click', uncheckSelection);
  $('#del-sel-button')
    .on('click', deleteSelection);
  $('#reset-list-button')
    .on('click', resetList);
  
  $('#list-tbody')
    .on('click', 'tr', listClick)
    .on('dblclick', 'tr', listDoubleClick)
    .on('click', 'td:first-child', changeBgCheckbox)
    .on('click', 'input[type="checkbox"]', checkboxInTableClick);
});
