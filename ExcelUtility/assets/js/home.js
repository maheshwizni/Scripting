/**
 * Created by WizniDev on 7/8/2015.
 */

var oldTr;
var sites = [];
var sitesPrimaryCols = [];
var assets = [];
var assetsPrimaryCols = [];
var systems = [];
var systemsPrimaryCols = [];
var assetCols = [];
var systemCols = [];
var defaultLength = 9;

$(document).ready( function () {
    loadData('Site', loadSitesData);
    loadData('CyberSystem', loadSystemsData);
    loadData('CyberAsset', loadAssetsData);
});

function loadSitesData(cols, json, columnsAdded){
    buildTable('siteTbl', cols, json, columnsAdded);
};

function loadSystemsData(cols, json, columnsAdded){
    buildTable('sysTbl', cols, json, columnsAdded);
};

function loadAssetsData(cols, json, columnsAdded){
    buildTable('assetTbl', cols, json, columnsAdded);
};

function buildTable(tableName, cols, json, columnsAdded){
    //var columnsAdded = cols.length > defaultLength? cols.slice(0,defaultLength): cols;
    var columnsAdded2 = [].concat(columnsAdded);
    columnsAdded2.push({data: '', title: ''});
    var table = $('#'+tableName).dataTable({
        columns: columnsAdded2,
        bPaginate: false,
        "createdRow": function ( row, data, index ) {
            if(tableName === 'siteTbl'){
                //If Sites, make the first column as template for lookup
                $('td', row).eq(0).html('<div class="details-control">' + data["Site Name"] + '</div>');
                if(data["Site Name"]){
                    $('td', row).eq(columnsAdded2.length-1).html('<div class="more-details" style="width:250px;"><a class="moreDetail btn btn-success" data-key="Site Name" data-title="'+ data["Site Name"] +'" data-val="' + data["Site Name"] + '" data-selector="sites" href="javascript:void(0);">More Details</a>&nbsp;&nbsp;<a href="javacript:void(0)" class="moreDetailSAP btn btn-success">SAP Details</a></div>');
                }
            }
            if(tableName === 'sysTbl'){
                //If Sites, make the first column as template for lookup
                //$('td', row).eq(0).html('<div class="details-control">' + data["Cyber System"] + '</div>');
                if(data["Cyber System"]){
                    $('td', row).eq(columnsAdded2.length-1).html('<div class="more-details" style="width:250px;"><a class="moreDetail btn btn-success" data-key="Cyber System" data-title="'+ data["Cyber System"] +'" data-val="' + data["Cyber System"] + '" data-selector="systems" href="javascript:void(0);">More Details</a>&nbsp;&nbsp;<a href="javacript:void(0)" class="moreDetailSAP btn btn-success">SAP Details</a></div>');
                }
            }
            if(tableName === 'assetTbl'){
                //If Sites, make the first column as template for lookup
                //$('td', row).eq(0).html('<div class="details-control">' + data["Cyber System"] + '</div>');
                if(data["Cyber Asset Name or Unique ID"]){
                    $('td', row).eq(columnsAdded2.length-1).html('<div class="more-details" style="width:250px;"><a class="moreDetail btn btn-success" data-title="'+ data["Cyber Asset Name or Unique ID"] +'" data-key="Cyber Asset Name or Unique ID" data-val="' + data["Cyber Asset Name or Unique ID"] + '" data-selector="assets" href="javascript:void(0);">More Details</a>&nbsp;&nbsp;<a href="javacript:void(0)" class="moreDetailSAP btn btn-success">SAP Details</a></div>');
                }
            }
        }
    });
    table.fnAddData(json);
    $('#' + tableName + '_filter').append('<a href="javascript:void(0);" class="clearFilter" data-val="' + tableName + '">Clear</a>');
    var groupBy = $('#groupBy' + tableName);
    if(groupBy){
        $('#groupBy' + tableName + ' option').remove();
        $('#groupBy' + tableName).append(new Option('NONE'));
        $.each(columnsAdded, function(index, value){
            $('#groupBy' + tableName).append(new Option(value.title, index));
        });

        $(document).on('change', '#groupBy' + tableName, function(e){
            $this = $(this);
            var selectedVal = $('#groupBy' + tableName).val();
            console.log(selectedVal);
            //debugger;
            // Clear Grouping First
            for(var i=0; i<table.dataTableSettings.length;i++) {
                var oSettings = table.dataTableSettings[i];
                for (var f = 0; f < oSettings.aoDrawCallback.length; f++) {
                    if (oSettings.aoDrawCallback[f].sName == 'fnRowGrouping') {
                        oSettings.aoDrawCallback.splice(f, 1);
                        break;
                    }
                }
                oSettings.aaSortingFixed = null;
            }
            if(selectedVal === 'NONE'){
                // Clear Table and Redraw
                var data = [];
                switch(tableName){
                    case "siteTbl": data = sites;break;
                    case "sysTbl": data = systems;break;
                    case "assetTbl": data = assets;break;
                };
                table.fnClearTable();
                table.fnAddData(data);
            }else {
                table.rowGrouping({
                    //bExpandableGrouping: true,GroupingColumnIndex:5,bHideGroupingColumn: false,asExpandedGroups:[]
                    iGroupingColumnIndex: selectedVal,
                    sGroupingColumnSortDirection: "asc",
                    //iGroupingOrderByColumnIndex: 0,
                    bExpandableGrouping: true,
                    bHideGroupingColumn: false,
                    asExpandedGroups: [],
                    fnOnGrouped: function() {
                        console.log('Rows are regrouped!');
                    }
                });
            }
        });
    }
    if(tableName === 'siteTbl') {
        $('#siteTbl tbody').on('click', 'div.details-control', function () {
            var tr = $(this).closest('tr');
            //var table = $('#sysTbl').DataTable();
            var row = table.api().row(tr);

            if (row.child.isShown()) {
                // This row is already open - close it
                table.api().row(tr).child('Dummy Content').hide();
                tr.removeClass('shown');
                oldTr = null;
            }
            else {
                // Open this row
                //show all Cyber Systems here
                row.child(['<h3>Cyber Systems</h3>', formatCyberSystems( row.data()), '<h3>Cyber Assets</h3>', formatCyberAssets( row.data()), "<h3>&nbsp;</h3>"], 'child-row').show();
                tr.addClass('shown');
                // Hide Old row
                if(oldTr){
                    table.api().row(oldTr).child('Dummy Content').hide();
                    oldTr.removeClass('shown');
                }
                oldTr = tr;
            }
        });
    }
};
var tblCsIdx = 0;
var tblCaIdx = 0;
function formatCyberSystems (data) {
    // `d` is the original data object for the row
    tblCsIdx++;
    var systemNames = [];
    var systemsJson = [];
    var siteName = data["Site Name"];
    $.each(assets, function (index, value) {
        if ($.trim(assets[index]["Site Name"]) === $.trim(siteName))
            systemNames.push(assets[index]["Cyber System"]);
    });
    $.each(systems, function (index, value) {
        $.each($.unique(systemNames), function (i, v) {
            if ($.trim(systems[index]["Cyber System"]).indexOf($.trim(systemNames[i])) > -1)
                systemsJson.push(systems[index]);
        });
    });
    var columnsAdded = [].concat(systemsPrimaryCols);
    columnsAdded.push({data: '', title: ''});
    var oTable = $('<table id="'+ siteName.replace(/ /g,'') + tblCsIdx +'" class="display" width="100%"></table>').dataTable({
        columns: columnsAdded, //systemCols.length > defaultLength? systemCols.slice(0,defaultLength): systemCols,
        bPaginate: false,
        "createdRow": function ( row, data, index ) {
                        //If Sites, make the first column as template for lookup
                        //$('td', row).eq(0).html('<div class="details-control">' + data["Cyber System"] + '</div>');
                        if(data["Cyber System"]){
                            $('td', row).eq(columnsAdded.length-1).html('<div class="more-details" style="width:250px;"><a class="moreDetail btn btn-success" data-title="'+ data["Cyber System"] +'" data-key="Cyber System" data-val="' + data["Cyber System"] + '" data-selector="systems" href="javascript:void(0);">More Details</a>&nbsp;&nbsp;<a href="javacript:void(0)" class="moreDetailSAP btn btn-success">SAP Details</a></div>');
                        }
        }
    });
    //var oTable = $('#sysTbl').dataTable();
    //oTable.fnClearTable();
    oTable.fnAddData($.unique(systemsJson));//($.trim($this.data('val')), 0 );
    return oTable;
}

function formatCyberAssets (data) {
    // `d` is the original data object for the row
    tblCaIdx++;
    var relevantAssets = [];
    var siteName = data["Site Name"];
    $.each(assets, function (index, value) {
        if ($.trim(assets[index]["Site Name"]) === $.trim(siteName))
            relevantAssets.push(assets[index]);
    });
    var columnsAdded = [].concat(assetsPrimaryCols);
    columnsAdded.push({data: '', title: ''});
    var oTable = $('<table id="'+ siteName.replace(/ /g,'') + tblCaIdx +'" class="display" width="100%"></table>').dataTable({
        columns: columnsAdded, //assetCols.length > defaultLength? assetCols.slice(0,defaultLength): assetCols,
        bPaginate: false,
        "createdRow": function ( row, data, index ) {
                //If Sites, make the first column as template for lookup
                //$('td', row).eq(0).html('<div class="details-control">' + data["Cyber System"] + '</div>');
                if(data["Cyber Asset Name or Unique ID"]){
                    $('td', row).eq(columnsAdded.length-1).html('<div class="more-details"  style="width:250px;"><a class="moreDetail btn btn-success" data-title="'+ data["Cyber Asset Name or Unique ID"] +'" data-key="Cyber Asset Name or Unique ID" data-val="' + data["Cyber Asset Name or Unique ID"] + '" data-selector="assets" href="javascript:void(0);">More Details</a>&nbsp;&nbsp;<a href="javacript:void(0)" class="moreDetailSAP btn btn-success">SAP Details</a></div>');
                }
        }
    });
    //var oTable = $('#assetTbl').dataTable();
    //oTable.fnClearTable();
    oTable.fnAddData($.unique(relevantAssets));//($.trim($this.data('val')), 0 );
    return oTable;
}

$(document).on('click', '.viewasset', function(e){
    //debugger;
    e.preventDefault();
    var $this = $(this);
    console.log($this.data('val'));
    var oTable = $('#assetTbl').dataTable();
    oTable.fnFilter($.trim($this.data('val')), 0 );
    $('ul.nav.nav-tabs > li > a[href="#CyberAsset"]').tab('show');
});

$(document).on('click', '.viewsystems', function(e){
    //debugger;
    e.preventDefault();
    var $this = $(this);
    console.log($this.data('val'));

    //var json = systems
    var systemNames = [];
    $.each(assets, function(index, value){
        if($.trim(assets[index]["Site Name"]) === $.trim($this.data('val')))
            systemNames.push(assets[index]["Cyber System"]);
    });
    var systemsJson = [];
    $.each(systems, function(index,value){
        $.each($.unique(systemNames), function(i,v){
           if($.trim(systems[index]["Cyber System"]).indexOf($.trim(systemNames[i])) > -1)
               systemsJson.push(systems[index]);
        });
    });
    var oTable = $('#sysTbl').dataTable();
    oTable.fnClearTable();
    oTable.fnAddData($.unique(systemsJson));//($.trim($this.data('val')), 0 );
    $('ul.nav.nav-tabs > li > a[href="#CyberSystem"]').tab('show');
});

$(document).on('click', 'a.moreDetail', function (e) {
    e.preventDefault();
    var $this = $(this);
    var title = $this.data('title');
    var val = $this.data('val');
    var selector = $this.data('selector');
    var obj;
    switch (selector){
        case 'sites': obj = sites;break;
        case 'systems': obj = systems;break;
        case 'assets': obj = assets;break;
    };
    var datakey = $this.data('key');
    $('#modalTitle').text(title);
    var html = $('<div/>');
    //debugger;
    $.each(obj, function(index,value){
       if($.trim(obj[index][datakey]) === $.trim(val)){
           var result = obj[index];
           var parentRow;
           var index = 0;
           $.each(result, function(k, v) {
               //display the key and value pair
               var divKey = $('<div class="col-sm-3 boldContent"/>').text(k);
               var divVal = $('<div class="col-sm-3"/>').text(v);
               if(index%2 === 0){
                   parentRow = $('<div class="row"/>');
               }
               parentRow.append(divKey);
               parentRow.append(divVal);
               html.append(parentRow);
               index++;
           });
       }
    });
    $('#modalBody').html(html);
    $('#DescModal').modal("show");
});

$(document).on('click', 'a.moreDetailSAP', function (e) {
    e.preventDefault();
    /*var $this = $(this);
    var title = $this.data('title');
    var val = $this.data('val');
    var selector = $this.data('selector');
    var obj;
    switch (selector){
        case 'sites': obj = sites;break;
        case 'systems': obj = systems;break;
        case 'assets': obj = assets;break;
    };
    var datakey = $this.data('key');
    $('#modalTitle').text(title);
    var html = $('<div/>');
    //debugger;
    $.each(obj, function(index,value){
        if($.trim(obj[index][datakey]) === $.trim(val)){
            var result = obj[index];
            var parentRow;
            var index = 0;
            $.each(result, function(k, v) {
                //display the key and value pair
                var divKey = $('<div class="col-sm-3 boldContent"/>').text(k);
                var divVal = $('<div class="col-sm-3"/>').text(v);
                if(index%2 === 0){
                    parentRow = $('<div class="row"/>');
                }
                parentRow.append(divKey);
                parentRow.append(divVal);
                html.append(parentRow);
                index++;
            });
        }
    });
    $('#modalBodySAP').html(html);*/
    $('#DescModalSAP').modal("show");
});

$(document).on('click', '.clearFilter', function(e){
    e.preventDefault();
    var $this = $(this);
    var oTable = $('#' + $this.data('val')).dataTable();
    fnResetAllFilters(oTable);
});

function fnResetAllFilters(oTable) {
    var oSettings = oTable.fnSettings();
    for(iCol = 0; iCol < oSettings.aoPreSearchCols.length; iCol++) {
        oSettings.aoPreSearchCols[ iCol ].sSearch = '';
    }
    oSettings.oPreviousSearch.sSearch = '';
    oTable.fnDraw();
};

function loadData(sheetName, cb){
    $.get(baseUrl + '/sheetNameAndVersion', function(data, status){
        console.log("Data: " + data + "\nStatus: " + status);
        var maxIndex;
        $.each(data, function(index){
            if(data[index].sheetName === sheetName)
                maxIndex = data[index].version;
        });
        //debugger;
        $.get(baseUrl + '/' + sheetName + '/' + maxIndex , function(data, status){
            console.log("Data: " + data + "\nStatus: " + status);
            var json = JSON.parse(data.metaData); //TODO: Get data from MongoDB
            var groupData;
            if(data.groupData)
                groupData = JSON.parse(data.groupData);

            if(!json)
                return;
            var cols = [];
            var data = [].concat(json);
            var keys = Object.keys(data.shift());

            keys.forEach(function(k) {
                cols.push({
                    title: k,
                    data: k
                    //optionally do some type detection here for render function
                });
            });

            var primaryCols = [];
            if(groupData && groupData.Primary) {
                groupData.Primary.forEach(function (k) {
                    primaryCols.push({
                        title: k,
                        data: k
                    });
                });
            }else{
                primaryCols = cols.length > defaultLength? cols.slice(0,defaultLength): cols;
            }

            switch(sheetName){
                case 'Site': sites = data; sitesPrimaryCols = primaryCols; break;
                case 'CyberSystem': systems = data; systemsPrimaryCols = primaryCols; systemCols = cols; break;
                case 'CyberAsset': assets = data; assetsPrimaryCols = primaryCols; assetCols = cols; break;
            };
            cb(cols, data, primaryCols);
        })
        .error(function(xhr, desc, error){
            console.log('An error occurred fetching data.' + xhr);
        });
    });
};