/**
 * Created by WizniDev on 7/23/2015.
 */
(function (ng) {
    var versionModule = ng.module('version');
    versionModule.service('homeService', function ($http, $q) {
        this.testFunction = function (a) {
            alert(a);
        };
        this.loadData = function (url) {
            var deferred = $q.defer();
            $http.get(url).
                success(function (data, status, headers, config) {
                   return deferred.resolve(data);
                }).
                error(function (data, status, headers, config) {
                    deferred.reject();
                });
            return deferred.promise;
        }
    });
})(angular);
