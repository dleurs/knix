/*
   Copyright 2020 The KNIX Authors

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

(function () {
  'use strict';

  angular.module('MfnWebConsole.pages.storage')
      .controller('StorageTableCtrl', StorageTableCtrl);

  /** @ngInject */
  function StorageTableCtrl($scope, $http, $cookies, $filter, editableOptions, editableThemes, $uibModal, baProgressModal, toastr, sharedProperties, sharedData) {

    $scope.itemsByPage=10;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    var token = $cookies.get('token');
    var email = $cookies.get('email');
    var urlPath = "/storage/";



    //$scope.storageObjects = sharedData.getStorageObjects();
    if (!$scope.storageObjects) {
      $scope.storageObjects = [ ];
    }
    getStorageObjectsList();
    //}

    $scope.open = function (page, size, key, message) {
      sharedProperties.setObjectKey(key);
      $scope.errorMessage = message;
      $uibModal.open({
        animation: true,
        scope: $scope,
        backdrop  : 'static',
        keyboard  : false,
        templateUrl: page,
        size: size,
      });

    };

    function getStorageObjectsList() {

      var req = {
        method: 'GET',
        url: urlPath + "?token=" + token + "&email=" + email + "&table=defaultTable&action=listKeys&start=0&count=2000",
        headers: {
             'Content-Type': 'application/x-www-form-urlencoded'
        }
      }

      $http(req).then(function successCallback(response) {

          $scope.storageObjects = [ ];
          for (var i=0;i<response.data.length;i++) {
            if (!response.data[i].startsWith("grain_requirements_") && !response.data[i].startsWith("grain_source_") && !response.data[i].startsWith("workflow_json_") && !response.data[i].endsWith("_metadata")) {
              $scope.storageObjects.push({"key" : response.data[i], "modified" : "Z"});
            }
          }
          //sharedData.setStorageObjects($scope.storageObjects);

      }, function errorCallback(response) {
          console.log("Error occurred during listKeys action");
          console.log("Response:" + response);
          if (response.statusText) {
            $scope.errorMessage = response.statusText;
          } else {
            $scope.errorMessage = response;
          }
          $uibModal.open({
            animation: true,
            scope: $scope,
            templateUrl: 'app/pages/workflows/modals/errorModal.html',
            size: 'md',
          });
      });
    }

    $scope.getIndex = function(storageObject) {
      return $scope.storageObjects.indexOf(storageObject);
    }



    function dateFormat(d) {
      var format = "d-m-Y H:i:s";
      return format

        .replace(/d/gm, ('0' + (d.getDate())).substr(-2))
        .replace(/m/gm, monthNames[d.getMonth()])
        .replace(/Y/gm, d.getFullYear().toString())
        .replace(/H/gm, ('0' + (d.getHours() + 0)).substr(-2))
        .replace(/i/gm, ('0' + (d.getMinutes() + 0)).substr(-2))
        .replace(/s/gm, ('0' + (d.getSeconds() + 0)).substr(-2));
    }

    

    $scope.downloadStorageObject = function(key) {
      console.log('retrieving storage object ' + key);
      toastr.success('Your object is being downloaded');

      var req = {
        method: 'GET',
        url: urlPath + "?token=" + token + "&email=" + email + "&table=defaultTable&action=getData&key=" + encodeURIComponent(key),
        headers: {
             'Content-Type': 'application/x-www-form-urlencoded'
        }

      }
      $http(req).then(function successCallback(response) {

          var objectData = response.data;

          if (objectData!="") {
            console.log('Storage object sucessfully retrieved.');
            
            var binaryString = "";
            var blob = "";
            try {
              binaryString = window.atob(objectData);
                       
              var binaryLen = binaryString.length;
              var bytes = new Uint8Array(binaryLen);
              for (var i = 0; i < binaryLen; i++) {
                var ascii = binaryString.charCodeAt(i);
                bytes[i] = ascii;
              }
              blob = new Blob([bytes]);
              var link = document.createElement('a');
              link.href = window.URL.createObjectURL(blob);
              var fileName = "";
              if(key.indexOf('.') == -1) {
                fileName = key + '.dat';
              } else {
                fileName = key;
              }
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } catch(e) {
              var element = document.createElement('a');
              element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(objectData));
              var fileName = "";
              if(key.indexOf('.') == -1) {
                fileName = key + '.dat';
              } else {
                fileName = key;
              }
              element.setAttribute('download', fileName);
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }  
            
          } else {
            console.log("getData action returned empty string");
            $scope.errorMessage = "The object does not contain any data.";
            $uibModal.open({
              animation: true,
              scope: $scope,
              templateUrl: 'app/pages/workflows/modals/errorModal.html',
              size: 'md',
            });
          }
      }, function errorCallback(response) {
          console.log("Error occurred during getData action");
          console.log("Response:" + response);
          if (response.statusText) {
            $scope.errorMessage = response.statusText;
          } else {
            $scope.errorMessage = response;
          }
          $uibModal.open({
            animation: true,
            scope: $scope,
            templateUrl: 'app/pages/workflows/modals/errorModal.html',
            size: 'md',
          });

      });

    }


    $scope.deleteStorageObject = function(index) {
      console.log('deleting storage object ' + $scope.storageObjects[index].key);

      var req = {
        method: 'GET',
        url: urlPath + "?token=" + token + "&email=" + email + "&table=defaultTable&action=deleteData&key=" + encodeURIComponent($scope.storageObjects[index].key),
        headers: {
             'Content-Type': 'application/x-www-form-urlencoded'
        }

      }
      $http(req).then(function successCallback(response) {

          if (response.data=="true") {
            console.log('Storage object sucessfully deleted.');
            toastr.success('Your object has been deleted successfully!');
            $scope.storageObjects.splice(index, 1);
          } else {
            console.log("Failure status returned by deleteData action");
            console.log("Message:" + response.data);
            $scope.errorMessage = "An error occurred while attempting to delete the object.";
            $uibModal.open({
              animation: true,
              scope: $scope,
              templateUrl: 'app/pages/workflows/modals/errorModal.html',
              size: 'md',
            });
          }
      }, function errorCallback(response) {
          console.log("Error occurred during deleteData action");
          console.log("Response:" + response);
          if (response.statusText) {
            $scope.errorMessage = response.statusText;
          } else {
            $scope.errorMessage = response;
          }
          $uibModal.open({
            animation: true,
            scope: $scope,
            templateUrl: 'app/pages/workflows/modals/errorModal.html',
            size: 'md',
          });

      });

    }

    $scope.showEndpoint = function(storageObject) {
      if (storageObject.key) {
        return window.location.protocol + '//' + window.location.host + urlPath + "?token=" + token + "&email=" + email + "&table=defaultTable&action=getData&key=" + storageObject.key;
      } else {
        return "";
      }


    }


    $scope.removeStorageObject = function(index) {
      $scope.storageObjectToBeDeleted = $scope.storageObjects[index];
      $uibModal.open({
        animation: true,
        scope: $scope,
        templateUrl: 'app/pages/storage/modals/deleteStorageObjectModal.html',
        size: 'md',
      });


    };

    $scope.gotoPage = function(page) {

      angular
       .element( $('#storageObjectPagination') )
       .isolateScope()
       .selectPage(page);

    }

    $scope.reloadStorageObjects = function() {
      getStorageObjectsList();
    }

    $scope.navigate = function(event,rowform,storageObject) {

      if (event.keyCode==13) {
        rowform.$submit();
      }

    }

    // save storage object
    $scope.saveStorageObject = function(storageObject) {

      if (storageObject.key!='')
      {
        console.log('creating new storage object ' + storageObject.key);

        var req = {
          method: 'GET',
          url: urlPath + "?token=" + token + "&email=" + email + "&table=defaultTable&action=putData&key=" + encodeURIComponent(storageObject.key) + "&value=",
          headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
          }

        }
        $http(req).then(function successCallback(response) {
          if (response.data=="true") {
            console.log('Storage object sucessfully created.');
            toastr.success('Your object has been created successfully!');
            $scope.reloadStorageObjects();
            $scope.open('app/pages/storage/modals/uploadStorageObjectModal.html', 'lg', storageObject.key);
          } else {
            console.log("Failure status returned by putData action");
            console.log("Message:" + response.data);
            $scope.errorMessage = "An error occurred while attempting to create the object.";
            $uibModal.open({
              animation: true,
              scope: $scope,
              templateUrl: 'app/pages/workflows/modals/errorModal.html',
              size: 'md',
            });
          }
        }, function errorCallback(response) {
          console.log("Error occurred during putData action");
          console.log("Response:" + response);
          if (response.statusText) {
            $scope.errorMessage = response.statusText;
          } else {
            $scope.errorMessage = response;
          }
          $uibModal.open({
            animation: true,
            scope: $scope,
            templateUrl: 'app/pages/workflows/modals/errorModal.html',
            size: 'md',
          });
        });
      }
    };

    $scope.addStorageObject = function() {
      $scope.inserted = {
        key: '',
        modified: 'A'
      };
      $scope.storageObjects.push($scope.inserted);
      $scope.gotoPage(1);
    };

    editableOptions.theme = 'bs3';
    editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
    editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';


  }

})();
