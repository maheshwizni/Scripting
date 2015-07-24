/**
 * Created by Amit Thakkar on 09/07/15.
 */
(function (ng) {
    var versionModule = ng.module('version');
    versionModule.controller('HistoryController', ['VersionService', 'usSpinnerService', HistoryController]);
    function HistoryController(VersionService, usSpinnerService) {
        var history = this;
        history.activate = ['$scope', function ($scope) {
            $scope.setTitleAndPageProperty('Version History', 'history');
        }];
        var loadingBarName = 'loadingVersionSpin';
        usSpinnerService.spin(loadingBarName);
        VersionService.getSheetNameAndLatestVersion()
            .success(function (response) {
                usSpinnerService.stop(loadingBarName);
                history.sheetNameAndLatestVersion = response;
            }).error(function () {
                usSpinnerService.stop(loadingBarName);
                history.sheetNameAndLatestVersion = [];
            });
        history.showData = function () {
            usSpinnerService.spin(loadingBarName);
            history.data = undefined;
            VersionService.getSheetData(history.selectedSheet.sheetName, history.selectedVersion)
                .success(function (response) {
                    usSpinnerService.stop(loadingBarName);
                    history.data = JSON.parse(response.metaData);
                })
                .error(function () {
                    usSpinnerService.stop(loadingBarName);
                    history.data = undefined;
                });
        };
    }
})(angular);