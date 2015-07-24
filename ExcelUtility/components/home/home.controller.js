/**
 * Created by Amit Thakkar on 09/07/15.
 */
(function (ng) {
    var versionModule = ng.module('version');
    versionModule.controller('HomeController', [HomeController]);
    function HomeController() {
        var home = this;
        home.activate = ['$scope', function ($scope) {
            $scope.setTitleAndPageProperty('Home', 'home');
        }];
    }
})(angular);