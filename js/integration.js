function dbeta(x, alpha, beta, NC) {
    return (Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1)) * NC;
}

function mbeta(alpha, beta) {
    return ((fact(alpha + beta - 1)) / (fact(alpha - 1) * fact(beta - 1)));
}

function fact(x) {
    if (x == 0) {
        return 1;
    }
    return x * fact(x - 1);
}

var module = angular.module('stats', ["ng-fusioncharts", "ngMaterial", "ngAnimate"]);

module.controller('MainCtrl', [
    '$scope', '$http', '$sce',
    function ($scope, $http, $sce) {
        $scope.successCount = 5;
        $scope.failCount = 5;
        $scope.priorAlpha = 1;
        $scope.priorBeta = 1;
        $scope.oldAlpha = -1;
        $scope.oldBeta = -1;
        $scope.oldAlphaStar = -1;
        $scope.oldBetaStar = -1;

        $scope.prior_title = "Click button to update your Prior Distribution";
        $scope.posterior_title = "Click button to update your Posterior Distribution"

        $scope.success = 5;
        $scope.fails = 5;

        $scope.isDisabled = false;
        $scope.isDisabledPrior = false;

        $scope.init = function () {
            $http({
                method: "GET",                
                url: "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=Beta%20distribution&origin=*"
            }).then(function successCallback(response) {
                var data = response.data.query.pages;
                for(key in data)
                {
                    $scope.wiki_data = $sce.trustAsHtml("<div>"+data[key].extract+"</div>");
                }
            }, function errorCallback(response) {
                $scope.wiki_data = "ERROR";
            });
        };

        $scope.binomData = {
            chart: {
                caption: "Success vs. Failure Data",
                subCaption: "",
                theme: "ocean",
                showvalues: "0"
            },
            data: [{
                label: "Successes",
                value: "5"
            },
            {
                label: "Failures",
                value: "5"
            }]
        };

        $scope.priorData = {
            chart: {
                caption: "Prior Distribution",
                subCaption: "",
                theme: "ocean",
                labelDisplay: "none",
                showvalues: "0",
                drawAnchors: "0",
                yAxisMinValue: "0"
            },
            data: []
        };

        $scope.postData = {
            chart: {
                caption: "Posterior Distribution",
                subCaption: "",
                theme: "ocean",
                labelDisplay: "none",
                showvalues: "0",
                drawAnchors: "0",
                yAxisMinValue: "0"
            },
            data: []
        };

        $scope.events = {
            rendercomplete: function (ev, props) {
                $scope.$apply(function () {
                    console.log("renderedPosterior");
                    $scope.isDisabled = false;
                });
            }
        };

        $scope.eventsPrior = {
            rendercomplete: function (ev, props) {
                $scope.$apply(function () {
                    console.log("renderedPrior");
                    $scope.isDisabledPrior = false;
                });
            }
        };

        $scope.changeSuccess = function () {
            $scope.success = $scope.successCount;
            $scope.binomData.data[0].value = $scope.success;
        };

        $scope.changeFailure = function () {
            $scope.fails = $scope.failCount;
            $scope.binomData.data[1].value = $scope.fails;
            $scope.binomData.data.push()
        };

        $scope.drawPost = function () {
            let astar = $scope.priorAlpha + $scope.success;
            let bstar = $scope.priorBeta + $scope.failCount;

            if ($scope.oldAlphaStar == astar & $scope.oldBetaStar == bstar) {
                return;
            }
            $scope.oldAlphaStar = astar;
            $scope.oldBetaStar = bstar;

            $scope.posterior_title = "beta(" + astar + "," + bstar + ")"

            $scope.isDisabled = true;
            $scope.postData.data = [];
            dat = [];
            let NC = mbeta(astar, bstar);
            for (i = 0; i < 1001; i++) {
                dat.push({ label: i, value: dbeta(.001 * i, astar, bstar, NC) });
            }
            $scope.postData.data = dat;
        };

        $scope.drawPrior = function () {
            let a = $scope.priorAlpha;
            let b = $scope.priorBeta;

            if ($scope.oldAlpha == a & $scope.oldBeta == b) {
                return;
            }
            $scope.isDisabledPrior = true;

            $scope.oldAlpha = a;
            $scope.oldBeta = b;

            $scope.prior_title = "beta(" + a + "," + b + ")"

            $scope.priorData.data = [];
            dat = [];
            let NC = mbeta(a, b);
            for (i = 0; i < 1001; i++) {
                dat.push({ label: i, value: dbeta(.001 * i, a, b, NC) });
            }
            $scope.priorData.data = dat;
        };


    }
]);