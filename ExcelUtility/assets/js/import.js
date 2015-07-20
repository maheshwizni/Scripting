/** drop target **/
var _target = document.getElementById('drop');
var _target2 = document.getElementById('files');

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
  $('#configureGroups').hide();

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
    button.click(function() {
      selectedIdx = idx; cb(idx);
    });
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
  //debugger;
  e.preventDefault();
  var remoteUrl = 'http://spf2010.wizni.com/Shared%20Docs/2-Sites.xlsx';
  $.get(remoteUrl, function(data){
    console.log('Done...');
  })
});

var selectedSheet;
var jsonData;
var jsonColsData;
var isInitiaized;
var _onsheet = function(json, cols, sheetnames, select_sheet_cb) {
  //$('#footnote').hide();
  var target = document.getElementById('foo');
  var spinner = new Spinner().spin();
  target.appendChild(spinner.el);
  $('#divSave').show();
  $('#hot').show();
  $('#configureGroups').show();
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
//debugger;
  console.log("Data:" + json);
  var colsData = [];

  cols.forEach(function(k) {
    if(k && k !== 'undefined') {
      colsData.push({
        title: k,
        data: k
        //optionally do some type detection here for render function
      });
    }
  });

  oTable = $('#' + selectedSheet.replace(/ /g,'')).DataTable({
    columns: colsData,
    bPaginate: false
  });

  oTable.rows.add(json).draw();
  loadGroupMetaData(selectedSheet, jsonData, colsData);

  spinner.stop();
}

function getSimilifiedSheetName(sheetName){
  var simplifiedSelectedSheet = sheetName;
  if(selectedSheet.indexOf('Site Detail') > -1)
    simplifiedSelectedSheet = 'Site';
  if(selectedSheet.indexOf('Cyber System') > -1)
    simplifiedSelectedSheet = 'CyberSystem';
  if(selectedSheet.indexOf('Cyber Asset') > -1)
    simplifiedSelectedSheet = 'CyberAsset';

  return simplifiedSelectedSheet;
}

function loadGroupMetaData(sheetName, jsonData, colsData){
  var simplifiedSelectedSheet = getSimilifiedSheetName(sheetName);

  $.get(baseUrl + '/sheetNameAndVersion', function(data, status) {
    var maxIndex = 1;
    $.each(data, function(index){
      if(data[index].sheetName === simplifiedSelectedSheet)
        maxIndex = data[index].version;
    });
    $.get(baseUrl + '/' + simplifiedSelectedSheet + '/' + maxIndex , function(data2, status) {
      var groupData;
      if (data2.groupData)
        groupData = JSON.parse(data2.groupData);
      if(isInitiaized) {
        $("#colGroupPrimary").multiselect("destroy");
        $("#colGroupPrimarySAP").multiselect("destroy");
        //$('#colGroupPrimary').multiselect('refresh');
      }
      $('#modalTitle').text(selectedSheet);
      var datalocal = [].concat(jsonData);
      var keys = Object.keys(datalocal.shift());

      $('#colGroupPrimary option').remove();
      $('#colGroupPrimarySAP option').remove();
      //debugger;
      $.each(colsData, function(index, value){
        $('<option/>', {
          text: value.title,
          value: value.title
          /*selected: 'selected'*/
        }).appendTo($('#colGroupPrimary'));
        //$('#colGroupPrimary').append(new Option(value.title, index));
        $('<option/>', {
          text: value.title,
          value: value.title
          /*selected: 'selected'*/
        }).appendTo($('#colGroupPrimarySAP'));
      });
      //$('#modalBody').html(html);
      isInitiaized = true;
      $('#modalBody div.additionalDiv').remove();
      var showDiv = false;
      if(!groupData) {
        showDiv=true;
      }else{
        //$('#colGroupPrimary').val(groupData.Primary);
        if(groupData.Groups) {
          $.each(groupData.Groups, function (idx, grp) {
            if (grp.Name === 'Primary') {
              $('#colGroupPrimary').val(grp.Cols);
            } else {
              var html = '<div class="row additionalDiv" data-val="Group' + groupIndex + '"><div class="col-md-2"><input class="form-control" id="Group' + groupIndex + '" type="text" class="input-xlarge" placeholder="Enter Group Name" value="' + grp.Name + '"></div><div class="col-md-4"><select id="colGroup' + groupIndex + '" class="form-control" multiple="multiple"></select></div></div>';
              $('#modalBody').append(html);
              $('#colGroup' + groupIndex + ' option').remove();
              //debugger;
              $.each(colsData, function (index, value) {
                $('<option/>', {
                  text: value.title,
                  value: value.title
                  /*selected: 'selected'*/
                }).appendTo($('#colGroup' + groupIndex));
                //$('#colGroupPrimary').append(new Option(value.title, index));
              });
              $('#colGroup' + groupIndex).val(grp.Cols);

              $('#colGroup' + groupIndex).multiselect({
                includeSelectAllOption: false
              });

              groupIndex++;
            }
          });
        }
        //$('#colGroupPrimary').multiselect('refresh');
      }

      $('#colGroupPrimary').multiselect({
        includeSelectAllOption: false
      });
      $('#colGroupPrimarySAP').multiselect({
        includeSelectAllOption: false
      });
      if(showDiv){
        $('#DescModal').modal("show");
      }
    });
  });
};

$(document).on('click', '#save', function(e){
  var data = [].concat(jsonData);
  console.log(JSON.stringify({header: data.shift()}));
  console.log(JSON.stringify({data: data}));
  var url = baseUrl;
  var simplifiedSelectedSheet = getSimilifiedSheetName(selectedSheet);
  console.log(simplifiedSelectedSheet);
  var postData = {sheetName: simplifiedSelectedSheet, metaData: JSON.stringify(jsonData), groupData: JSON.stringify(jsonColsData)};
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

$(document).on('click', '#configureGroups', function(e){
  e.preventDefault();
  console.log(selectedSheet);
  $('#DescModal').modal("show");
});
var groupIndex = 0;
$(document).on('click', '#addNewGroup', function(e){
  e.preventDefault();
  var html = '<div class="row additionalDiv" data-val="Group' + groupIndex + '"><div class="col-md-2"><input class="form-control" id="Group'+ groupIndex + '" type="text" class="input-xlarge" placeholder="Enter Group Name" value=""></div><div class="col-md-4"><select id="colGroup' + groupIndex + '" class="form-control" multiple="multiple"></select></div></div>';
  $('#modalBody').append(html);

  var data = [].concat(jsonData);
   var keys = Object.keys(data.shift());
   var cols = [];
   keys.forEach(function(k) {
     if(k && k !== 'undefined') {
       cols.push({
         title: k,
         data: k
         //optionally do some type detection here for render function
       });
     }
   });

  $('#colGroup' + groupIndex + ' option').remove();
  //debugger;
  $.each(cols, function(index, value){
    $('<option/>', {
      text: value.title,
      value: value.title
      /*selected: 'selected'*/
    }).appendTo($('#colGroup' + groupIndex));
    //$('#colGroupPrimary').append(new Option(value.title, index));
  });
  //$('#modalBody').html(html);
  isInitiaized = true;
  $('#colGroup' + groupIndex).multiselect({
    includeSelectAllOption: false
  });
  groupIndex++;
});

$(document).on('click', '#btnConfigureGroups', function(e){
//debugger;
var sel = $('#colGroupPrimary').val();
  if(!sel){
    $('#DescModal').modal("show");
    return;
  }
  var selectedCols = sel;
  var isSuccess=true;
  var selection = {Groups: []};
  $.each($('#modalBody>div.row'), function(idx,val){
    $this = $(this);
    var $group = $('#' + $this.data('val'));
    var $cols = $('#col' + $this.data('val'));
    if($group.val() === ''){
      isSuccess=false;
      return;
    }
    if(!$cols.val()){
      isSuccess=false;
      return;
    }
    selection.Groups.push({Name: $group.val(), Cols: $cols.val()});
  });
  if(isSuccess) {
    //jsonColsData = {Primary:selectedCols};
    jsonColsData = selection;
    console.log(jsonColsData);
    $('#DescModal').modal("hide");
  }
});

/** Drop it like it's hot **/
DropSheet({
  drop: _target,
  fileSelect: _target2,
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
