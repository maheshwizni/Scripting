/**
 * Created by Amit Thakkar on 09/07/15.
 */
(function (ng) {
    var versionModule = ng.module('version');
    versionModule.controller('VersionController', ['DiffService', 'usSpinnerService', function (DiffService, usSpinnerService) {
        var versionController = this;
        var loadingBarName = 'loadingVersionSpin';
        usSpinnerService.spin(loadingBarName);
        DiffService.getSheetNameAndLatestVersion()
            .success(function (response) {
                usSpinnerService.stop(loadingBarName);
                versionController.sheetNameAndLatestVersion = response;
            }).error(function () {
                usSpinnerService.stop(loadingBarName);
                versionController.sheetNameAndLatestVersion = [];
            });
        versionController.showData = function() {
            usSpinnerService.spin(loadingBarName);
            versionController.data = undefined;
            DiffService.getSheetData(versionController.selectedSheet.sheetName, versionController.selectedVersion)
                .success(function (response) {
                    usSpinnerService.stop(loadingBarName);
                    versionController.data = JSON.parse(response.metaData);
                })
                .error(function () {
                    usSpinnerService.stop(loadingBarName);
                    versionController.data = undefined;
                });
        };
    }]);
})(angular);