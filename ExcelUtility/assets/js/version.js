/**
 * Created by WizniDev on 7/6/2015.
 */
var url = baseUrl;
/** Handsontable magic **/
var boldRenderer = function (instance, td, row, col, prop, value, cellProperties) {
    Handsontable.TextCell.renderer.apply(this, arguments);
    $(td).css({'font-weight': 'bold'});
};

//Custom renderer add class if the element have the data "change"
var myRenderer = function (instance, td, row, col, prop, value, cellProperties) {
    Handsontable.TextCell.renderer.apply(this, arguments);
    if($(td).data("change")){
        $(td).addClass('changeInput');
    }
};

var $container, $parent, $window, availableWidth, availableHeight;
var calculateSize = function () {
    var offset = $container.offset();
    availableWidth = Math.max($window.width() - 250,600);
    availableHeight = Math.max($window.height() - 250, 400);
};

function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}

$(document).ready(function() {
    /*debugger;*/
    $container = $("#hot"); $parent = $container.parent();
    $window = $(window);
    $window.on('resize', calculateSize);
    $('#hot').hide();
    //Get sheetname
    var sheet = getUrlParameter('context');
    if(sheet)
        $('#context').val(sheet);
    //Initialize table
    initSheet();

});
var selectedSheet;
$(document).on('change', '#context', function(e){
    console.log('Change of sheet called...');
    initSheet();
});

function initSheet(){
    selectedSheet = $('#context').val();
    console.log(selectedSheet);
    loadVersions(selectedSheet);
};

function loadVersions(sheetName){
    $('#hot').hide();
  $('#version option').remove();
    //TODO: Add versions to the list retrieved from MongoDB
    $('#version').append(new Option('Loading...'));
    $.get(url + '/sheetNameAndVersion', function(data, status){
        $('#version option').remove();
        console.log("Data: " + data + "\nStatus: " + status);
        //var versions = $.grep(data, function(obj){return obj.sheetName === selectedSheet;});
        var maxIndex;
        $.each(data, function(index){
            if(data[index].sheetName === sheetName)
            maxIndex = data[index].version;
        });
        if(maxIndex) {
            for(var k = maxIndex; k>0;k--)
                $('#version').append(new Option(k));
            $('#version').trigger('change');
        }
    });
};

$(document).on('change', '#version', function(e){
    var selectedVersion = $('#version').val();
    console.log(selectedVersion);

    $.get(url + '/' + selectedSheet + '/' + selectedVersion , function(data, status){
        console.log("Data: " + data + "\nStatus: " + status);
        var json = JSON.parse(data.metaData); //TODO: Get data from MongoDB
        if(!json)
        return;
        var cols = json[0];
        if(cols) {
            var target = document.getElementById('foo');
            var spinner = new Spinner().spin();
            target.appendChild(spinner.el);
            $('#hot').show();
            $("#hot").handsontable({
                data: json,
                rowHeaders: false,
                contextMenu: true,
                /*columns: cols.map(function (x) {
                    return {data: x};
                }),*/
                colHeaders: false,
                cells: function (r, c, p) {
                    if (r === 0) {
                        this.renderer = boldRenderer;
                        this.readOnly = true;
                    }
                    else {
                        this.renderer = myRenderer;
                    }
                },
                width: function () {
                    return availableWidth;
                },
                height: function () { return availableHeight; },
                stretchH: 'all',
                afterRender: function(){
                console.log('Draw');
                    spinner.stop();
                }
            });
            //spinner.stop();
        }
    })
        .error(function(xhr, desc, error){
            console.log('An error occurred fetching data.' + xhr);
        });

});