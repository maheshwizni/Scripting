/**
 * Created by Amit Thakkar on 09/07/15.
 */
(function (ng) {
    var versionModule = ng.module('version');
    versionModule.service('VersionService', ['$http', 'GlobalConstant', function ($http, GlobalConstant) {
        var URL = GlobalConstant.API_URL;
        this.getSheetNameAndLatestVersion = function () {
            return $http.get(URL + '/sheetNameAndVersion');
        };
        this.getSheetData = function (sheetName, version) {
            return $http.get(URL + '/' + sheetName + '/' + version);
        };
        this.postSheetData = function (postData) {
            return $http.post(URL, postData);
        };
    }]);
    versionModule.controller('ImportController', ['$timeout', 'VersionService', 'usSpinnerService', function ($timeout, VersionService, usSpinnerService) {
        /** drop target **/
        var importController = this;
        importController.showSaveOption = false;
        var _target = document.getElementById('drop');
        var _target2 = document.getElementById('files');
        var element = angular.element('#myModal');
        var _workstart = function() {
            usSpinnerService.spin('loadingSpin');
        };
        var _workend = function() {
            usSpinnerService.stop('loadingSpin');
        };

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

        var make_buttons = function(sheetnames) {
            importController.sheets = [];
            sheetnames.forEach(function(s,idx) {
                importController.sheets.push({text: s, name: 'btn' + idx});
            });
            $timeout(function(){
                //console.log('Timeout');
            });
        };

        importController.renderSheet = function(idx){
            console.log(idx);
            importController.selectedSheetIndex = idx;
            importController.sheetCallback(idx);
        };

        importController.saveSheet = function() {
            usSpinnerService.spin('loadingSpin');
            var groups = {Groups: importController.groupsData};
            var postData = {
                sheetName: getSimplifiedSheetName(importController.selectedSheet),
                metaData: JSON.stringify(importController.jsonData),
                groupData: JSON.stringify(groups)
            };
            VersionService.postSheetData(postData)
                .success(function (resp) {
                    usSpinnerService.stop('loadingSpin');
                    alertify.alert('Sheet saved successfully.', function(){});
                })
                .error(function (err) {
                    console.log(err);
                    usSpinnerService.stop('loadingSpin');
                    alertify.alert('Error occurred while saving sheet data.', function(){});
                });
        };

        importController.addNewGroup = function(){
          importController.groupsData.push({Name: '', Cols: []});
        };

        importController.configureGroups = function(){
            var isValid = true;
            $.each(importController.groupsData, function(idx,val){
               if($.trim(val.Name) === '' || val.Cols.length === 0)
                isValid=false;
            });
            if(isValid)
                element.modal('hide');
        };

        importController.showGroups = function(){
            element.modal('show');
        };

        var _onsheet = function(json, cols, sheetnames, select_sheet_cb) {
            usSpinnerService.spin('loadingSpin');
            make_buttons(sheetnames, select_sheet_cb);
            importController.selectedSheet = sheetnames[importController.selectedSheetIndex || 0];
            /*console.log(json);
            console.log(cols);*/
            if(!json) json = [];
            var jsonData = [].concat(json);
            jsonData.unshift(function(head){var o = {}; for(i=0;i!=head.length;++i) o[head[i]] = head[i]; return o;}(cols));
            //console.log(jsonData);
            VersionService.getSheetNameAndLatestVersion()
                .success(function (response) {
                    console.log(response);
                    var currentVersion = 0;
                    var simplifiedSheetName = getSimplifiedSheetName(importController.selectedSheet);
                    $.each(response, function(idx, val){
                       if(val.sheetName === simplifiedSheetName) {
                           currentVersion = val.version;
                       }
                    });
                    VersionService.getSheetData(getSimplifiedSheetName(importController.selectedSheet), currentVersion)
                        .success(function(resp){
                            var groups = resp.groupData ? JSON.parse(resp.groupData).Groups : null;
                            importController.showSaveOption = true;
                            importController.sheetCallback = select_sheet_cb;
                            importController.headers = jsonData[0];
                            importController.rowData = json;
                            importController.jsonData = jsonData;
                            importController.groupsData = groups || [{Name: "Primary", Cols: []}];
                            importController.groupsConfigured = groups[0].Cols.length === 0;
                            usSpinnerService.stop('loadingSpin');
                        })
                        .error(function(){
                            console.log('Error');
                            usSpinnerService.stop('loadingSpin');
                        })
                })
                .error(function () {
                    //diffController.oldVersionData = undefined;
                    console.log('Error');
                    usSpinnerService.stop('loadingSpin');
                });

        };

        function getSimplifiedSheetName(sheetName){
            var simplifiedSelectedSheet = sheetName;
            if(sheetName.indexOf('Site Detail') > -1)
                simplifiedSelectedSheet = 'Site';
            if(sheetName.indexOf('Cyber System') > -1)
                simplifiedSelectedSheet = 'CyberSystem';
            if(sheetName.indexOf('Cyber Asset') > -1)
                simplifiedSelectedSheet = 'CyberAsset';

            return simplifiedSelectedSheet;
        }

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
        });
    }]);
})(angular);