/**
 * Created by Amit Thakkar on 09/07/15.
 */
(function (ng) {
    var diffModule = ng.module('diff', []);
    diffModule.filter('range', function () {
        return function (max, min) {
            if(min == undefined) {
                min = 1;
            }
            var versions = [];
            max = parseInt(max);
            for (var i = min; i <= max; i++) {
                versions.push(i);
            }
            return versions;
        };
    });
    diffModule.service('DiffService', ['$http', function ($http) {
        var URL = 'http://104.236.140.70:9000/site';
        this.getSheetNameAndLatestVersion = function () {
            return $http.get(URL + '/sheetNameAndVersion');
        };
        this.getSheetData = function (sheetName, version) {
            return $http.get(URL + '/' + sheetName + '/' + version);
        };
    }]);
    diffModule.controller('DiffController', ['DiffService', function (DiffService) {
        var diffController = this;
        DiffService.getSheetNameAndLatestVersion()
            .success(function (response) {
                diffController.sheetNameAndLatestVersion = response;
            }).error(function () {
                diffController.sheetNameAndLatestVersion = [];
            });
        var oldData = undefined;
        var newData = undefined;
        diffController.showDiff = function () {
            if (diffController.selectedSheet && diffController.selectedToVersion && diffController.selectedFromVersion) {
                diffController.isShowingDiff = true;
                diffController.oldVersionData = undefined;
                diffController.newVersionData = undefined;
                diffController.isOldNewVersionDataSame = false;
                oldData = undefined;
                newData = undefined;
                if(diffController.selectedToVersion != 1) {
                    DiffService.getSheetData(diffController.selectedSheet.sheetName, diffController.selectedToVersion)
                        .success(function (response) {
                            oldData = response.metaData;
                            diffController.oldVersionData = JSON.parse(oldData);
                            diffController.isOldNewVersionDataSame = oldData == newData;
                        })
                        .error(function () {
                            diffController.oldVersionData = undefined;
                        });
                }
                DiffService.getSheetData(diffController.selectedSheet.sheetName, diffController.selectedFromVersion)
                    .success(function (response) {
                        newData = response.metaData;
                        diffController.newVersionData = JSON.parse(newData);
                        diffController.isOldNewVersionDataSame = oldData == newData;
                    })
                    .error(function () {
                        diffController.newVersionData = undefined;
                    });
            } else if (!diffController.selectedSheet) {
                diffController.error = 'Please Select Sheet Name';
            } else if (!diffController.selectedToVersion) {
                diffController.error = 'Please Select To Version Number';
            } else if (!diffController.selectedFromVersion) {
                diffController.error = 'Please Select From Version Number';
            }
        };
        diffController.isSameRow = function(oldRow, newRow) {
            return ng.equals(oldRow, newRow);
        };
    }]);
})(angular);