/**
 * Created by Amit Thakkar on 13/07/15.
 */
(function (ng) {
    var versionModule = ng.module('version', ['ngRoute']);
    versionModule.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/diff', {
            templateUrl: 'components/diff/_diff.html',
            controller: 'DiffController',
            controllerAs: 'diffController',
            controllerUrl: 'components/diff/diff.controller.js'
        });
        $routeProvider.otherwise('/diff');
    }]);
})(angular);