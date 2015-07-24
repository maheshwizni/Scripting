/**
 * Created by Amit Thakkar on 09/07/15.
 */
(function (ng, w) {
    var versionModule = ng.module('version');
    versionModule.controller('DiffController', ['VersionService', 'usSpinnerService', '$timeout', DiffController]);
    function DiffController(VersionService, usSpinnerService, $timeout) {
        var diff = this;
        diff.activate = ['$scope', function ($scope) {
            $scope.setTitleAndPageProperty('Version Difference', 'diff');
        }];
        var loadingBarName = 'loadingSpin';
        usSpinnerService.spin(loadingBarName);
        VersionService.getSheetNameAndLatestVersion()
            .success(function (response) {
                usSpinnerService.stop(loadingBarName);
                diff.sheetNameAndLatestVersion = response;
            }).error(function () {
                diff.sheetNameAndLatestVersion = [];
            });
        var oldData = undefined;
        var newData = undefined;
        var showBothVersionDiff = function () {
            if (oldData && newData) {
                diff.isOldNewVersionDataSame = oldData == newData;
                var oldDataObj = JSON.parse(oldData);
                var newDataObj = JSON.parse(newData);
                diff.newOldSchema = ng.merge(newDataObj[0], oldDataObj[0]);
                diff.newVersionData = newDataObj;
                diff.oldVersionData = oldDataObj;
                diff.isShowingDiff = false;
                usSpinnerService.stop(loadingBarName);
            }
        };
        diff.showDiff = function () {
            if (diff.selectedSheet && diff.selectedToVersion && diff.selectedFromVersion) {
                usSpinnerService.spin(loadingBarName);
                diff.showMaxDiffRows = 20;
                diff.isShowingDiff = true;
                diff.oldVersionData = undefined;
                diff.newVersionData = undefined;
                diff.isOldNewVersionDataSame = false;
                diff.error = undefined;
                oldData = undefined;
                newData = undefined;
                VersionService.getSheetData(diff.selectedSheet.sheetName, diff.selectedFromVersion)
                    .success(function (response) {
                        oldData = response.metaData;
                        showBothVersionDiff();
                    })
                    .error(function () {
                        diff.oldVersionData = undefined;
                    });
                VersionService.getSheetData(diff.selectedSheet.sheetName, diff.selectedToVersion)
                    .success(function (response) {
                        newData = response.metaData;
                        showBothVersionDiff();
                    })
                    .error(function () {
                        diff.newVersionData = undefined;
                    });
            } else if (!diff.selectedSheet) {
                diff.error = 'Please Select Sheet Name';
            } else if (!diff.selectedToVersion) {
                diff.error = 'Please Select To Version Number';
            } else if (!diff.selectedFromVersion) {
                diff.error = 'Please Select From Version Number';
            }
        };
        diff.isSameRow = function (oldRow, newRow) {
            return ng.equals(oldRow, newRow);
        };
        diff.showMoreDiff = function () {
            usSpinnerService.spin(loadingBarName);
            diff.showMaxDiffRows += 20;
            $timeout(function () {
                usSpinnerService.stop(loadingBarName);
            }, 5000);
        };
        diff.showMaxDiffRows = 0;
    }
})(angular, window);