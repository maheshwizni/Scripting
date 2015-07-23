/**
 * Created by Amit Thakkar on 09/07/15.
 */
(function (ng, w) {
    var versionModule = ng.module('version');
    versionModule.controller('DiffController', ['VersionService', 'usSpinnerService', '$timeout', function (VersionService, usSpinnerService, $timeout) {
        var diffController = this;
        var loadingBarName = 'loadingSpin';
        usSpinnerService.spin(loadingBarName);
        VersionService.getSheetNameAndLatestVersion()
            .success(function (response) {
                usSpinnerService.stop(loadingBarName);
                diffController.sheetNameAndLatestVersion = response;
            }).error(function () {
                diffController.sheetNameAndLatestVersion = [];
            });
        var oldData = undefined;
        var newData = undefined;
        var showBothVersionDiff = function () {
            if (oldData && newData) {
                diffController.isOldNewVersionDataSame = oldData == newData;
                var oldDataObj = JSON.parse(oldData);
                var newDataObj = JSON.parse(newData);
                diffController.newOldSchema = ng.merge(newDataObj[0], oldDataObj[0]);
                diffController.newVersionData = newDataObj;
                diffController.oldVersionData = oldDataObj;
                diffController.isShowingDiff = false;
                usSpinnerService.stop(loadingBarName);
            }
        };
        diffController.showDiff = function () {
            if (diffController.selectedSheet && diffController.selectedToVersion && diffController.selectedFromVersion) {
                usSpinnerService.spin(loadingBarName);
                diffController.showMaxDiffRows = 20;
                diffController.isShowingDiff = true;
                diffController.oldVersionData = undefined;
                diffController.newVersionData = undefined;
                diffController.isOldNewVersionDataSame = false;
                diffController.error = undefined;
                oldData = undefined;
                newData = undefined;
                VersionService.getSheetData(diffController.selectedSheet.sheetName, diffController.selectedFromVersion)
                    .success(function (response) {
                        oldData = response.metaData;
                        showBothVersionDiff();
                    })
                    .error(function () {
                        diffController.oldVersionData = undefined;
                    });
                VersionService.getSheetData(diffController.selectedSheet.sheetName, diffController.selectedToVersion)
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
        diffController.showMoreDiff = function () {
            usSpinnerService.spin(loadingBarName);
            diffController.showMaxDiffRows += 20;
            $timeout(function() {
                usSpinnerService.stop(loadingBarName);
            }, 5000);
        };
        diffController.showMaxDiffRows = 0;
    }]);
})(angular, window);