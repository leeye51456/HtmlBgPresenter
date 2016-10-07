/*jslint node:true regexp:true*/
/*global $, jQuery, alert, confirm */
'use strict';

var
  wnd,
  fileList = [{ name: '', type: '' }],
  sessionId = Date.now(),
  sessionIdShort = sessionId % 86400000;

var bg = { pvw: 0, pgm: 0, layer: 'b', delay: 250, duration: 2 };


// functions

function wndInit(e) {
  if (wnd && !wnd.closed && confirm('송출 창을 닫으려면 확인을 누르세요.')) {
    wnd.close();
    return;
  }
  bg.layer = 'b';
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
      '<div id="shield-div"></div>' +
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
      bg.pvw = 0;
      bg.pgm = 0;
      $('#pvw-div').html('');
      $('#list-tbody')
        .find('.pgm, .pvw')
          .removeClass('pgm pvw')
          .end()
        .find('tr:first')
          .addClass('pvw');
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
function updatePvw(pageNum) {
  if (pageNum || pageNum === 0) {
    bg.pvw = pageNum;
  }
  $('#list-tbody')
    .find('tr')
    .removeClass('pvw')
    .filter(function () {
      return $(this).data('index') === bg.pvw;
    })
    .addClass('pvw');
  displayPvw();
}

function updateWnd(transition) {
  var
    newHtml,
    $wnd = $(wnd.document);
  
  if (transition === 'dissolve') {
    $wnd.find('#bottom-div, #top-div').css('transition', 'opacity ' + bg.duration + 's');
  } else if (transition === 'cut') {
    $wnd.find('#bottom-div, #top-div').css('transition', '');
  }
  
  if (fileList[bg.pgm].type === '') {
    newHtml = '<div class="black-div"></div>';
  } else if (fileList[bg.pgm].type === 'v') {
    newHtml = '<video src="./src/' + fileList[bg.pgm].name + '" autoplay loop muted></video>';
  } else {
    newHtml = '<img src="./src/' + fileList[bg.pgm].name + '">';
  }
  
  if (bg.layer === 'b') {
    bg.layer = 't';
    $wnd.find('#top-div').html(newHtml);
    setTimeout(function () {
      $wnd.find('#top-div').css('opacity', '1');
    }, bg.delay);
  } else if (bg.layer === 't') {
    bg.layer = 'b';
    $wnd.find('#bottom-div').html(newHtml);
    setTimeout(function () {
      $wnd.find('#top-div').css('opacity', '0');
    }, bg.delay);
  }
}
function updatePgm(pageNum, transition) {
  if (!wnd || wnd.closed) {
    return;
  }
  if (pageNum || pageNum === 0) {
    bg.pgm = pageNum;
  }
  $('#list-tbody')
    .find('tr')
    .removeClass('pgm')
    .filter(function () {
      return $(this).data('index') === bg.pgm;
    })
    .addClass('pgm');
  updateWnd(transition);
  if (bg.pgm < fileList.length - 1) {
    updatePvw(bg.pgm + 1);
  }
}

function bgCutBtnClick() {
  updatePgm(bg.pvw, 'cut');
}

function bgAutoBtnClick() {
  updatePgm(bg.pvw, 'dissolve');
}

function applySetting() {
  bg.delay = Number($('#delay-number').val());
  bg.duration = Number($('#duration-number').val());
}
function discardSetting() {
  $('#delay-number').val(bg.delay);
  $('#duration-number').val(bg.duration);
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
  updatePvw();
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
    if (bg.pvw === index) {
      bg.pvw -= 1;
    }
    return true;
  } else if (direction > 0 && index < fileList.length - 1) {
    fileList.splice(index, 2, fileList[index + 1], fileList[index]);
    if (bg.pvw === index) {
      bg.pvw += 1;
    }
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
    if (bg.pvw === item) {
      bg.pvw = 0;
    }
  });
  displayFileList();
}
function resetList() {
  if (confirm('리스트를 비우려면 확인을 누르세요.')) {
    fileList = fileList.slice(0, 1);
    bg.pvw = 0;
    displayFileList();
  }
}

function listClick(e) {
  updatePvw(Number($(e.target).closest('tr').data('index')));
}

function listDoubleClick(e) {
  updatePgm(Number($(e.target).closest('tr').data('index')), 'dissolve');
}

function changeBgCheckbox(e) {
  $(e.target).find('input').trigger('click');
}
function checkboxInTableClick(e) {
  e.stopPropagation();
}

function documentKeyDown(e) {
  var focusedElementType = $(':focus').attr('type');
  if (focusedElementType !== 'number' && e.keyCode === 13) {
    updatePgm(bg.pvw, 'dissolve');
  }
}


function blurThis(e) {
  $(e.target).trigger('blur');
}


// event listeners
$(document).ready(function () {
  var
    sessionIdHtml = '<small>' + Math.floor(sessionId / 86400000) + '-</small><b>' + (sessionId % 86400000) + '</b>',
    listHeight = $(window).height() - $('#list-table').offset().top - 30;
  
  document.title = 'HtmlBgPresenter (' + sessionIdShort + ')';
  $('#session-label').html('세션 ' + sessionIdHtml);
  displayFileList();
  
  $(document)
    .on('focus', 'input[type!="number"],button', blurThis)
    .on('keydown', documentKeyDown);
  
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
  
  $('#list-section')
    .css('height', listHeight);
  
  $('#list-tbody')
    .on('click', 'tr', listClick)
    .on('dblclick', 'tr', listDoubleClick)
    .on('click', 'td:first-child', changeBgCheckbox)
    .on('click', 'input[type="checkbox"]', checkboxInTableClick);
  
  $(window).on('beforeunload', function () {
    return '';
  });
  $(window).on('resize', function () {
    var listHeight = $(window).height() - $('#list-section').offset().top - 30;
    if (Number($(window).height()) >= 480) {
      $('#list-section')
        .css('height', String(listHeight));
    }
  });
});
