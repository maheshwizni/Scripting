/**
 * Created by Amit Thakkar on 09/07/15.
 */

(function (ng) {
    var versionModule = ng.module('version');
    versionModule.controller('HomeController', function ($scope, $rootScope, homeService, GlobalConstant) {
        console.log("Home Controller");
        $scope.oldTr;
        $scope.sites = [];
        $scope.sitesPrimaryCols = [];
        $scope.assets = [];
        $scope.assetsPrimaryCols = [];
        $scope.systems = [];
        $scope.systemsPrimaryCols = [];
        $scope.assetCols = [];
        $scope.systemCols = [];
        $scope.defaultLength = 9;
        $scope.loadData = function(sheetName){
            var url = GlobalConstant.API_URL + '/sheetNameAndVersion';
            homeService.loadData(url).then(function(response){
                console.log(response);
                var maxIndex;
                angular.forEach(response, function(item){
                    if(item.sheetName === sheetName)
                        maxIndex = item.version;
                });
                var url2 = GlobalConstant.API_URL + '/' + sheetName + '/' + maxIndex;
                homeService.loadData(url2).then(function(data){
                    console.log(data);
                    var json = JSON.parse(data.metaData); //TODO: Get data from MongoDB
                    var groupData;
                    if(data.groupData)
                        groupData = JSON.parse(data.groupData);

                    if(!json)
                        return;
                    var cols = [];
                    var data = [].concat(json);
                    var keys = Object.keys(data.shift());

                    keys.forEach(function(k) {
                        cols.push({
                            title: k,
                            data: k
                            //optionally do some type detection here for render function
                        });
                    });

                    var primaryCols = [];
                    if(groupData && groupData.Groups) {
                        var filter = groupData.Groups.filter(function(item){
                            return item.Name === 'Primary';
                        });
                        filter[0].Cols.forEach(function (k) {
                            primaryCols.push({
                                title: k,
                                data: k
                            });
                        });
                    }else{
                        primaryCols = cols.length > defaultLength? cols.slice(0,defaultLength): cols;
                    }
                    switch(sheetName){
                        case 'Site': $scope.sites = data; $scope.sitesPrimaryCols = primaryCols; break;
                        case 'CyberSystem': $scope.systems = data; $scope.systemsPrimaryCols = primaryCols; $scope.systemCols = cols; break;
                        case 'CyberAsset': $scope.assets = data; $scope.assetsPrimaryCols = primaryCols; $scope.assetCols = cols; break;
                    };
                    console.log($scope.sites + "/n" + $scope.sitesPrimaryCols);
                    console.log($scope.systems + "/n" + $scope.systemsPrimaryCols);
                    console.log($scope.assets + "/n" + $scope.assetsPrimaryCols);
                });

            });
        }
        $scope.loadData('Site');
        //$scope.init = function(){
        //    $scope.loadData('Site');
        //
        //}


    });
})(angular);