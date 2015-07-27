/**
 * Created by Amit Thakkar on 13/07/15.
 */
(function (ng) {
    var versionModule = ng.module('version', ['ngNewRouter', 'angularSpinner', 'infinite-scroll', 'ui.bootstrap']);
    versionModule.controller('VersionController', ['$router', '$rootScope', function ($router, $scope) {
        var version = this;
        $router.config([
            {
                path: '/',
                redirectTo: '/home'
            },
            {
                path: '/diff',
                component: 'diff'
            },
            {
                path: '/home',
                component: 'home'
            },
            {
                path: '/importExcel',
                component: 'importExcel'
            },
            {
                path: '/history',
                component: 'history'
            }
        ]);
        $scope.setTitleAndPageProperty = function(title, page) {
            version.title = title;
            version.page = page;
        };
    }]);
    versionModule.constant("GlobalConstant", {
        API_URL: 'http://104.236.140.70:9000/site'
    });
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
    versionModule.filter('range', function () {
        return function (max, min, total) {
            if (min == undefined) {
                min = 1;
            }
            if(total && total < max) {
                max = total
            }
            var versions = [];
            max = parseInt(max);
            for (var i = min; i <= max; i++) {
                versions.push(i);
            }
            return versions;
        };
    });
})(angular);