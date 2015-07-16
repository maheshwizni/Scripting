/**
 * Created by Amit Thakkar on 09/07/15.
 */
(function (ng, w) {
    var diffModule = ng.module('diff', ['angularSpinner']);
    diffModule.filter('range', function () {
        return function (max, min) {
            if (min == undefined) {
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
        var URL = w.baseUrl;
        this.getSheetNameAndLatestVersion = function () {
            return $http.get(URL + '/sheetNameAndVersion');
        };
        this.getSheetData = function (sheetName, version) {
            return $http.get(URL + '/' + sheetName + '/' + version);
        };
    }]);
    diffModule.controller('DiffController', ['DiffService', 'usSpinnerService', function (DiffService, usSpinnerService) {
        var diffController = this;
        usSpinnerService.spin('loadingSpin');
        DiffService.getSheetNameAndLatestVersion()
            .success(function (response) {
                usSpinnerService.stop('loadingSpin');
                diffController.sheetNameAndLatestVersion = response;
            }).error(function () {
                diffController.sheetNameAndLatestVersion = [];
            });
        var oldData = undefined;
        var newData = undefined;
        var showBothVersionDiff = function () {
            if (oldData && newData) {
                diffController.isOldNewVersionDataSame = oldData == newData;
                diffController.isShowingDiff = false;
                var oldDataObj = JSON.parse(oldData);
                var newDataObj = JSON.parse(newData);
                diffController.newOldSchema = ng.merge(newDataObj[0], oldDataObj[0]);
                diffController.newVersionData = newDataObj;
                diffController.oldVersionData = oldDataObj;
                usSpinnerService.stop('loadingSpin');
            }
        };
        diffController.showDiff = function () {
            if (diffController.selectedSheet && diffController.selectedToVersion && diffController.selectedFromVersion) {
                usSpinnerService.spin('loadingSpin');
                diffController.isShowingDiff = true;
                diffController.oldVersionData = undefined;
                diffController.newVersionData = undefined;
                diffController.isOldNewVersionDataSame = false;
                diffController.error = undefined;
                oldData = undefined;
                newData = undefined;
                DiffService.getSheetData(diffController.selectedSheet.sheetName, diffController.selectedFromVersion)
                    .success(function (response) {
                        oldData = response.metaData;
                        showBothVersionDiff();
                    })
                    .error(function () {
                        diffController.oldVersionData = undefined;
                    });
                DiffService.getSheetData(diffController.selectedSheet.sheetName, diffController.selectedToVersion)
                    .success(function (response) {
                        newData = response.metaData;
                        showBothVersionDiff();
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
        diffController.isSameRow = function (oldRow, newRow) {
            return ng.equals(oldRow, newRow);
        };
    }]);
})(angular, window);