/**
 * Created by Amit Thakkar on 13/07/15.
 */
(function (ng) {
    var versionModule = ng.module('version', ['ngRoute', 'angularSpinner']);
    versionModule.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/diff', {
            page: 'diff',
            title: 'Version History',
            templateUrl: 'components/diff/_diff.html',
            controller: 'DiffController',
            controllerAs: 'diffController',
            controllerUrl: 'components/diff/diff.controller.js'
        });
        $routeProvider.when('/home', {
            page: 'home',
            title: 'Excel Import',
            templateUrl: 'components/home/_home.html',
            controller: 'HomeController',
            controllerAs: 'homeController',
            controllerUrl: 'components/home/home.controller.js'
        });
        $routeProvider.when('/version', {
            page: 'Version Administration',
            title: ' History',
            templateUrl: 'components/version/_version.html',
            controller: 'VersionController',
            controllerAs: 'versionController',
            controllerUrl: 'components/version/version.controller.js'
        });
        $routeProvider.otherwise('/home');
    }]);
    versionModule.controller('MasterController', ['$rootScope', function ($rootScope) {
        var masterController = this;
        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            masterController.page = current.$$route.page;
            masterController.title = current.$$route.title;
        });
    }]);
    versionModule.constant("GlobalConstant", {
        API_URL: 'http://104.236.140.70:9000/site'
    });
})(angular);