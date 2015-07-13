/** drop target **/
var _target = document.getElementById('drop');

/** Spinner **/
var spinner;
var oTable;
var _workstart = function() { spinner = new Spinner().spin(_target); }
var _workend = function() { spinner.stop(); }

/** Alerts **/
var _badfile = function() {
  alertify.alert('This file does not appear to be a valid Excel file.', function(){});
};

var _pending = function() {
  alertify.alert('Please wait until the current file is processed.', function(){});
};

var _large = function(len, cb) {
  alertify.confirm("This file is " + len + " bytes and may take a few moments.  Your browser may lock up during this process.  Shall we play?", cb);
};

var _failed = function(e) {
  console.log(e, e.stack);
  alertify.alert('We unfortunately dropped the ball here.  We noticed some issues with the grid recently, so please test the file using the direct parsers for XLS and XLSX files.', function(){});
};

/** Handsontable magic **/
/*var boldRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.TextCell.renderer.apply(this, arguments);
  $(td).css({'font-weight': 'bold'});
};*/

var $container, $parent, $window, availableWidth, availableHeight;
var calculateSize = function () {
  //var offset = $container.offset();
  availableWidth = Math.max($window.width() - 250,600);
  availableHeight = Math.max($window.height() - 250, 400);
};

$(document).ready(function() {
  //$container = $("#hot"); $parent = $container.parent();
  $window = $(window);
  $window.on('resize', calculateSize);
  $('#divSave').hide();
  $('#hot').hide();
  $('#status').hide();
});

/* make the buttons for the sheets */
var selectedIdx;
var make_buttons = function(sheetnames, cb) {
  var $buttons = $('#buttons');
  var $tables = $('#tables');
  $(tables).html("");
  $buttons.html("");
  sheetnames.forEach(function(s,idx) {
    var button= $('<button class="btn-lg btn-warning"/>').attr({ type:'button', name:'btn' +idx, text:s });
    button.append(s);
    button.click(function() { selectedIdx = idx; cb(idx); });
    $buttons.append(button);
    $buttons.append('&nbsp;&nbsp;');
    var tbl = $('<table id="'+ s.replace(/ /g,'') +'" class="display" width="100%"></table>');
    $tables.append(tbl);
  });
};

//Custom renderer add class if the element have the data "change"
/*var myRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.TextCell.renderer.apply(this, arguments);
  if($(td).data("change")){
    $(td).addClass('changeInput');
  }
};*/

$(document).on('click','#btndownloadfile', function(e){
  debugger;
  e.preventDefault();
  var remoteUrl = 'http://spf2010.wizni.com/Shared%20Docs/2-Sites.xlsx';
  $.get(remoteUrl, function(data){
    console.log('Done...');
  })
});

var selectedSheet;
var jsonData;
var _onsheet = function(json, cols, sheetnames, select_sheet_cb) {
  //$('#footnote').hide();
  $('#divSave').show();
  $('#hot').show();
  make_buttons(sheetnames, select_sheet_cb);
  //calculateSize();

  /* add header row for table */
  if(!json) json = [];
  jsonData = [].concat(json);
  jsonData.unshift(function(head){var o = {}; for(i=0;i!=head.length;++i) o[head[i]] = head[i]; return o;}(cols));
  //calculateSize();
  /* showtime! */
selectedSheet = sheetnames[selectedIdx || 0];
  $('#sheet').text(selectedSheet);
debugger;
  console.log("Data:" + json);
  var colsData = [];

  cols.forEach(function(k) {
    colsData.push({
      title: k,
      data: k
      //optionally do some type detection here for render function
    });
  });

  oTable = $('#' + selectedSheet.replace(/ /g,'')).DataTable({
    columns: colsData,
    bPaginate: false
  });

  oTable.rows.add(json).draw();
}



$(document).on('click', '#save', function(e){
  var data = [].concat(jsonData);
  console.log(JSON.stringify({header: data.shift()}));
  console.log(JSON.stringify({data: data}));
  var url = baseUrl;
  var simplifiedSelectedSheet;
  if(selectedSheet.indexOf('Site Detail') > -1)
    simplifiedSelectedSheet = 'Site';
  if(selectedSheet.indexOf('Cyber System') > -1)
    simplifiedSelectedSheet = 'CyberSystem';
  if(selectedSheet.indexOf('Cyber Asset') > -1)
    simplifiedSelectedSheet = 'CyberAsset';
  console.log(simplifiedSelectedSheet);
  var postData = {sheetName: simplifiedSelectedSheet, metaData: JSON.stringify(jsonData)};
  toastr.info('Upload in progress...');
  $.post(url, postData, function(data, status){
    console.log("Data:" + data + "\nStatus:" + status);
    /*$('#status').hide();*/
    toastr.success('Upload Successful');
  })
  .fail(function(){
      /*$('#status').hide();*/
      toastr.error("Error occurred!");
  })
});

/** Drop it like it's hot **/
DropSheet({
  drop: _target,
  on: {
    workstart: _workstart,
    workend: _workend,
    sheet: _onsheet,
    foo: 'bar'
  },
  errors: {
    badfile: _badfile,
    pending: _pending,
    failed: _failed,
    large: _large,
    foo: 'bar'
  }
})
