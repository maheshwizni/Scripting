/**
 * Created by WizniDev on 7/8/2015.
 */
$(document).ready( function () {
    loadData('Site', loadSitesData);
    loadData('CyberSystem', loadSystemsData);
    loadData('CyberAsset', loadAssetsData);
});

var sites = [];
var assets = [];
var systems = [];

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
        columns: cols,
        bPaginate: false,
        "createdRow": function ( row, data, index ) {
            if(tableName === 'siteTbl'){
                //If Sites, make the first column as template for lookup
                $('td', row).eq(0).html('<div class="btn-group">' +
                    '<button type="button" data-toggle="dropdown" class="btn btn-default dropdown-toggle">' + data["Site Name"] + '<span class="caret"></span></button>' +
                '<ul class="dropdown-menu">' +
                    '<li><a href="javascript:void(0);" class="viewasset" data-val="' + data["Site Name"] + '">View Assets</a></li>' +
                    '<li class="divider"></li>'+
                '<li><a href="javascript:void(0);" class="viewsystems" data-val="' + data["Site Name"] + '">View Systems</a></li>'+
                '</ul></div>');
            }
        }
    });

    table.rows.add(json).draw();
};

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

$(document).on('click', '.clearFilter', function(e){
    e.preventDefault();
    var $this = $(this);
    var oTable = $('#' + $this.data('val')).dataTable();
    fnResetAllFilters(oTable);
});

$(document).on('click', '.clearFilter2', function(e){
    e.preventDefault();
    var $this = $(this);
    var oTable = $('#' + $this.data('val')).dataTable();
    oTable.fnClearTable();
    oTable.fnAddData(systems);//($.trim($this.data('val')), 0 );
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
                case 'CyberSystem': systems = data; break;
                case 'CyberAsset': assets = data; break;
            };
            cb(cols, data);
        })
        .error(function(xhr, desc, error){
            console.log('An error occurred fetching data.' + xhr);
        });
    });
};
