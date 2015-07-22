/**
 * Created by Amit Thakkar on 09/07/15.
 */
(function (ng) {
    var versionModule = ng.module('version');
    versionModule.controller('VersionController', ['DiffService', function (DiffService) {
        var versionController = this;
        DiffService.getSheetNameAndLatestVersion()
            .success(function (response) {
                versionController.sheetNameAndLatestVersion = response;
            }).error(function () {
                versionController.sheetNameAndLatestVersion = [];
            });
        versionController.showData = function() {
            DiffService.getSheetData(versionController.selectedSheet.sheetName, versionController.selectedVersion)
                .success(function (response) {
                    versionController.data = JSON.parse(response.metaData);
                    console.log(versionController.data);
                })
                .error(function () {
                    versionController.data = undefined;
                });
        };
    }]);
})(angular);