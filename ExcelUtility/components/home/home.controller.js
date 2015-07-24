/**
 * Created by Amit Thakkar on 09/07/15.
 */
(function (ng) {
    var versionModule = ng.module('version');
    versionModule.controller('HomeController', ['$rootScope', HomeController]);
    function HomeController($rootScope) {
        var home = this;
        home.activate = function () {
            $rootScope.setTitleAndPageProperty('Home', 'home');
        };
    }
})(angular);