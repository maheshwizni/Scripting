/** drop target **/
var _target = document.getElementById('drop');

/** Spinner **/
var spinner;

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
var boldRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.TextCell.renderer.apply(this, arguments);
  $(td).css({'font-weight': 'bold'});
};

var $container, $parent, $window, availableWidth, availableHeight;
var calculateSize = function () {
  var offset = $container.offset();
  availableWidth = Math.max($window.width() - 250,600);
  availableHeight = Math.max($window.height() - 250, 400);
};

$(document).ready(function() {
  $container = $("#hot"); $parent = $container.parent();
  $window = $(window);
  $window.on('resize', calculateSize);
  $('#divSave').hide();
  $('#hot').hide();
  $('#status').hide();
});

/* make the buttons for the sheets */
var make_buttons = function(sheetnames, cb) {
  var $buttons = $('#buttons');
  $buttons.html("");
  sheetnames.forEach(function(s,idx) {
    var button= $('<button/>').attr({ type:'button', name:'btn' +idx, text:s });
    button.append('<h3>' + s + '</h3>');
    button.click(function() { cb(idx); });
    /*$buttons.append(button);
    $buttons.append('<br/>');*/
  });
};

//Custom renderer add class if the element have the data "change"
var myRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.TextCell.renderer.apply(this, arguments);
  if($(td).data("change")){
    $(td).addClass('changeInput');
  }
};
var selectedSheet;
var _onsheet = function(json, cols, sheetnames, select_sheet_cb) {
  //$('#footnote').hide();
  $('#divSave').show();
  $('#hot').show();
  make_buttons(sheetnames, select_sheet_cb);
  calculateSize();

  /* add header row for table */
  if(!json) json = [];
  json.unshift(function(head){var o = {}; for(i=0;i!=head.length;++i) o[head[i]] = head[i]; return o;}(cols));
  calculateSize();
  /* showtime! */
selectedSheet = sheetnames[0];
  $('#sheet').text(selectedSheet);
  $("#hot").handsontable({
    data: json,
    //startRows: 5,
    //startCols: 1,
    //fixedRowsTop: 1,
    //stretchH: 'all',
    //minSpareRows: 1,
    rowHeaders: false,
    contextMenu: true,
    //rowHeaders: false,
    columns: cols.map(function(x) {
      return {data:x};
    }),
    colHeaders: false,//cols.map(function(x,i) { return XLS.utils.encode_col(i); }),
    cells: function (r,c,p) {
      if(r === 0) {this.renderer = boldRenderer; this.readOnly = true;}
      else { this.renderer = myRenderer; }
      //this.renderer = boldRenderer;
    },
    width: function () { return availableWidth; },
    height: function () { return availableHeight; },
    stretchH: 'all'
  });

/*  $('#hot').handsontable('getInstance').addHook('afterChange', function(changes) {
    var ele=this;
    $.each(changes, function (index, element) {
      //add the changeInput class to the actual td
      $(ele.getCell(element[0],ele.propToCol(element[1]))).addClass('changeInput')
      //get the cell properties and create a new one "change"
      //to check in the renderer
      ele.getCellMeta(element[0],ele.propToCol(element[1])).change=true;
    });
  });*/

};



$(document).on('click', '#save', function(e){
  // TODO: Perform DB operation to save the values
  // Currently simply logging in console for review purpose
  var data = [].concat($container.data('handsontable').getData());
  console.log(JSON.stringify({header: data.shift()}));
  console.log(JSON.stringify({data: data}));
  var url = baseUrl;
  var postData = {sheetName: selectedSheet, metaData: JSON.stringify($container.data('handsontable').getData())};
  toastr.info('Upload in progress...');
  $.post(url, postData, function(data, status){
    console.log("Data:" + data + "\nStatus:" + status);
    /*$('#status').hide();*/
    toastr.success('Upload Successful');
  })
      .done(function(){

      })
          .fail(function(){
        /*$('#status').hide();*/
toastr.error("Error occurred!");
          })
      .always(function(){

      });
  /*$.ajax({
    url:url,
    type:'POST',
    contentType:'json',
    data: postData,
    success: function(data, success){
      console.log("Success!!");
      console.log(data);
      console.log(status);
    },
    error: function(xhr, desc, err){
      console.log(xhr);
      console.log("Desc: " + desc + "\nErr:" + err);
    }
  })*/
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
