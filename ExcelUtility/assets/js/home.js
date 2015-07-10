/**
 * Created by WizniDev on 7/8/2015.
 */

var oldTr;
var sites = [];
var assets = [];
var systems = [];
var assetCols = [];
var systemCols = [];
var defaultLength = 9;

$(document).ready( function () {
    loadData('Site', loadSitesData);
    loadData('CyberSystem', loadSystemsData);
    loadData('CyberAsset', loadAssetsData);
});

function loadSitesData(cols, json){
    buildTable('siteTbl', cols, json);
};

function loadSystemsData(cols, json){
    buildTable('sysTbl', cols, json);
};

function loadAssetsData(cols, json){
    buildTable('assetTbl', cols, json);
};

function buildTable(tableName, cols, json){
    var table = $('#'+tableName).DataTable({
        columns: cols.length > defaultLength? cols.slice(0,defaultLength): cols,
        bPaginate: false,
        "createdRow": function ( row, data, index ) {
            if(tableName === 'siteTbl'){
                //If Sites, make the first column as template for lookup
                $('td', row).eq(0).html('<div class="details-control">' + data["Site Name"] + '</div>');
                if(data["Site Name"] && cols.length > defaultLength){
                    $('td', row).eq(defaultLength-1).html('<div class="more-details">' + (data[cols[defaultLength-1].data] || '--') + '&nbsp;&nbsp;<a class="moreDetail btn btn-success" data-key="Site Name" data-title="'+ data["Site Name"] +'" data-val="' + data["Site Name"] + '" data-selector="sites" href="javascript:void(0);">More Detail...</a></div>');
                }
            }
            if(tableName === 'sysTbl'){
                //If Sites, make the first column as template for lookup
                //$('td', row).eq(0).html('<div class="details-control">' + data["Cyber System"] + '</div>');
                if(data["Cyber System"] && cols.length > defaultLength){
                    $('td', row).eq(defaultLength-1).html('<div class="more-details">' + (data[cols[defaultLength-1].data] || '--') + '&nbsp;&nbsp;<a class="moreDetail btn btn-success" data-key="Cyber System" data-title="'+ data["Cyber System"] +'" data-val="' + data["Cyber System"] + '" data-selector="systems" href="javascript:void(0);">More Detail...</a></div>');
                }
            }
            if(tableName === 'assetTbl'){
                //If Sites, make the first column as template for lookup
                //$('td', row).eq(0).html('<div class="details-control">' + data["Cyber System"] + '</div>');
                if(data["Cyber Asset Name or Unique ID"] && cols.length > defaultLength){
                    $('td', row).eq(defaultLength-1).html('<div class="more-details">' + (data[cols[defaultLength-1].data] || '--') + '&nbsp;&nbsp;<a class="moreDetail btn btn-success" data-title="'+ data["Cyber Asset Name or Unique ID"] +'" data-key="Cyber Asset Name or Unique ID" data-val="' + data["Cyber Asset Name or Unique ID"] + '" data-selector="assets" href="javascript:void(0);">More Detail...</a></div>');
                }
            }
        }
    });

    table.rows.add(json).draw();
    if(tableName === 'siteTbl') {
        $('#siteTbl tbody').on('click', 'div.details-control', function () {
            var tr = $(this).closest('tr');
            //var table = $('#sysTbl').DataTable();
            var row = table.row(tr);

            if (row.child.isShown()) {
                // This row is already open - close it
            }
            else {
                // Open this row
                //show all Cyber Systems here
                row.child(['<h3>Cyber Systems</h3>', formatCyberSystems( row.data()), '<h3>Cyber Assets</h3>', formatCyberAssets( row.data()), "<h3>&nbsp;</h3>"], 'child-row').show();
                tr.addClass('shown');
                // Hide Old row
                if(oldTr){
                    table.row(oldTr).child('Dummy Content').hide();
                    oldTr.removeClass('shown');
                }
                oldTr = tr;
            }
        });
    }
};

function formatCyberSystems (data) {
    // `d` is the original data object for the row
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

    var oTable = $('<table id="'+ siteName.replace(/ /g,'') +'" class="display" width="100%"></table>').dataTable({
        columns: systemCols.length > defaultLength? systemCols.slice(0,defaultLength): systemCols,
        bPaginate: false,
        "createdRow": function ( row, data, index ) {
                        //If Sites, make the first column as template for lookup
                        //$('td', row).eq(0).html('<div class="details-control">' + data["Cyber System"] + '</div>');
                        if(data["Cyber System"] && systemCols.length > defaultLength){
                            $('td', row).eq(defaultLength-1).html('<div class="more-details">' + (data[systemCols[defaultLength-1].data] || '--') + '&nbsp;&nbsp;<a class="moreDetail btn btn-success" data-title="'+ data["Cyber System"] +'" data-key="Cyber System" data-val="' + data["Cyber System"] + '" data-selector="systems" href="javascript:void(0);">More Detail...</a></div>');
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
    var relevantAssets = [];
    var siteName = data["Site Name"];
    $.each(assets, function (index, value) {
        if ($.trim(assets[index]["Site Name"]) === $.trim(siteName))
            relevantAssets.push(assets[index]);
    });
    var oTable = $('<table id="'+ siteName.replace(/ /g,'') +'" class="display" width="100%"></table>').dataTable({
        columns: assetCols.length > defaultLength? assetCols.slice(0,defaultLength): assetCols,
        bPaginate: false,
        "createdRow": function ( row, data, index ) {
                //If Sites, make the first column as template for lookup
                //$('td', row).eq(0).html('<div class="details-control">' + data["Cyber System"] + '</div>');
                if(data["Cyber Asset Name or Unique ID"] && assetCols.length > defaultLength){
                    $('td', row).eq(defaultLength-1).html('<div class="more-details">' + (data[assetCols[defaultLength-1].data] || '--') + '&nbsp;&nbsp;<a class="moreDetail btn btn-success" data-title="'+ data["Cyber Asset Name or Unique ID"] +'" data-key="Cyber Asset Name or Unique ID" data-val="' + data["Cyber Asset Name or Unique ID"] + '" data-selector="assets" href="javascript:void(0);">More Detail...</a></div>');
                }
        }
    });
    //var oTable = $('#assetTbl').dataTable();
    //oTable.fnClearTable();
    oTable.fnAddData($.unique(relevantAssets));//($.trim($this.data('val')), 0 );
    return oTable;
}

$(document).on('click', '.viewasset', function(e){
    debugger;
    e.preventDefault();
    var $this = $(this);
    console.log($this.data('val'));
    var oTable = $('#assetTbl').dataTable();
    oTable.fnFilter($.trim($this.data('val')), 0 );
    $('ul.nav.nav-tabs > li > a[href="#CyberAsset"]').tab('show');
});

$(document).on('click', '.viewsystems', function(e){
    debugger;
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
    debugger;
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
        $.get(baseUrl + '/' + sheetName + '/' + maxIndex , function(data, status){
            console.log("Data: " + data + "\nStatus: " + status);
            var json = JSON.parse(data.metaData); //TODO: Get data from MongoDB
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
            switch(sheetName){
                case 'Site': sites = data;break;
                case 'CyberSystem': systems = data; systemCols = cols; break;
                case 'CyberAsset': assets = data; assetCols = cols; break;
            };
            cb(cols, data);
        })
        .error(function(xhr, desc, error){
            console.log('An error occurred fetching data.' + xhr);
        });
    });
};