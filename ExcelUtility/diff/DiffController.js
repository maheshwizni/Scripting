/**
 * Created by Amit Thakkar on 09/07/15.
 */
(function (ng) {
    var diffModule = ng.module('diff', []);
    diffModule.filter('range', function () {
        return function (max) {
            var versions = [];
            max = parseInt(max);
            for (var i = 1; i < max; i++) {
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
            if (diffController.selectedSheet && diffController.selectedVersion) {
                diffController.isShowingDiff = true;
                diffController.oldVersionData = undefined;
                diffController.newVersionData = undefined;
                diffController.isOldNewVersionDataSame = false;
                oldData = undefined;
                newData = undefined;
                DiffService.getSheetData(diffController.selectedSheet.sheetName, diffController.selectedVersion - 1)
                    .success(function (response) {
                        oldData = response.metaData;
                        diffController.oldVersionData = JSON.parse(oldData);
                        diffController.isOldNewVersionDataSame = oldData == newData;
                    })
                    .error(function () {
                        diffController.oldVersionData = undefined;
                    });
                DiffService.getSheetData(diffController.selectedSheet.sheetName, diffController.selectedVersion)
                    .success(function (response) {
                        var newData = response.metaData;
                        diffController.newVersionData = JSON.parse(newData);
                        diffController.isOldNewVersionDataSame = oldData == newData;
                    })
                    .error(function () {
                        diffController.newVersionData = undefined;
                    });
            } else if (!diffController.selectedSheet) {
                diffController.error = 'Please Select Sheet Name';
            } else if (!diffController.selectedVersion) {
                diffController.error = 'Please Select Version Number';
            }
        };
    }]);
})(angular);