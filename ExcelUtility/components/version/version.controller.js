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
    }]);
})(angular);