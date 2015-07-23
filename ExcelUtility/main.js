/**
 * Created by Amit Thakkar on 13/07/15.
 */
(function (ng) {
    var versionModule = ng.module('version', ['ngNewRouter', 'angularSpinner', 'infinite-scroll']);
    versionModule.controller('VersionController', ['$rootScope', '$router', function ($rootScope, $router) {
        var master = this;
        $router.config([
            {
                path: '/',
                redirectTo: '/home'
            },
            {
                page: 'diff',
                title: 'Version Difference',
                path: '/diff',
                component: 'diff'
            },
            {
                page: 'home',
                title: 'Home',
                path: '/home',
                component: 'home'
            },
            {
                page: 'import',
                title: 'Excel Import',
                path: '/import',
                component: 'import'
            },
            {
                page: 'Version Administration',
                title: 'Version History',
                path: '/history',
                component: 'history'
            }
        ]);
        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            master.page = current.$$route.page;
            master.title = current.$$route.title;
        });
    }]);
    versionModule.service('VersionService', ['$http', 'GlobalConstant', function ($http, GlobalConstant) {
        var URL = GlobalConstant.API_URL;
        this.getSheetNameAndLatestVersion = function () {
            return $http.get(URL + '/sheetNameAndVersion');
        };
        this.getSheetData = function (sheetName, version) {
            return $http.get(URL + '/' + sheetName + '/' + version);
        };
        this.postSheetData = function (postData) {
            return $http.post(URL, postData);
        };
    }]);
    versionModule.constant("GlobalConstant", {
        API_URL: 'http://104.236.140.70:9000/site'
    });
})(angular);