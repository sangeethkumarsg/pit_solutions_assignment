angular.module('myApp', ['ui.router'])
.controller('AppCtrl',['$scope',function($scope){
    $scope.appData = {};
}])

.controller('CustomerDataCtrl',['$scope','$state',function($scope,$state){
    $scope.appData.customerData = {};
    $scope.submitCustomerData = function(){
        localStorage.setItem('currentuserData',JSON.stringify($scope.appData.customerData));
        $state.go('app.product');
    }
}])

.controller('ProductEntryCtrl',['$scope','$state',function($scope,$state){
    window.onbeforeunload = function() {
        return "Do you want to reload ? All data will be lost.";
    }
    $scope.appData.productInfo = {
        items : [
            {
                productName : null,
                quantity : null,
                amount : null,
                tax : null,
                total : null
            }
        ],
        subtotal : 0,
        grandTotal : 0,
        discount : 0,
        discountAmount : 0

    };

    $scope.addNewItem = function(){
        var item = {
            productName : null,
            quantity : null,
            amount : null,
            tax : null,
            total : null
        };
        $scope.appData.productInfo.items.push(item);
    };
    $scope.removeItem = function(index){
        $scope.appData.productInfo.items.splice(index,1);
    }

    var roundToTwo = function (num) {    
        return +(Math.round(num + "e+2")  + "e-2");
    }
    /* $("[data-validation]").on("keydown", function(e) {
        if(!((e.keyCode > 95 && e.keyCode < 106)
            || (e.keyCode > 47 && e.keyCode < 58) 
            || e.keyCode == 8)) {
                return false;
            }
            
      });
 */
    
      
      
    var sumTotal = function(){
        var total = 0;
        for(var i=0;i<$scope.appData.productInfo.items.length;i++){
            if($scope.appData.productInfo.items[i].total){
                total += parseFloat($scope.appData.productInfo.items[i].total);
            }
        }
        return isNaN(parseFloat(total)) ? 0 : parseFloat(total);
    }

    var calculateDiscount = function(){
        var discountAmount = 0;
        if($scope.appData.productInfo.discount){
            if($scope.appData.productInfo.discount.indexOf('%') > 0){
                var total = sumTotal();
                var discountPercentage = parseFloat($scope.appData.productInfo.discount.substring(0,$scope.appData.productInfo.discount.indexOf('%')).trim());
                if(!isNaN(discountPercentage)){
                    discountAmount = total * (discountPercentage/100);
                }
            }else{
                discountAmount = $scope.appData.productInfo.discount;
            }
        }
        return discountAmount;
    }

    $scope.getProductTotal = function(index){
        var quantity = parseInt($scope.appData.productInfo.items[index].quantity);
        var amount = parseFloat($scope.appData.productInfo.items[index].amount);
        var tax = parseFloat($scope.appData.productInfo.items[index].tax);
        var productAmount = quantity * amount;
        var productTaxAmount = productAmount * (tax/100);
        var total = parseFloat(productAmount) + parseFloat(productTaxAmount);
        //var total =(($scope.appData.productInfo.items[index].quantity * $scope.appData.productInfo.items[index].amount) * ($scope.appData.productInfo.items[index].tax/100) );
        $scope.appData.productInfo.items[index].total = roundToTwo(isNaN(parseFloat(total)) ? 0 : parseFloat(total));
        return $scope.appData.productInfo.items[index].total;
    }
    
    $scope.getGrandTotal = function(){
        var total = sumTotal();
        var discountAmount = calculateDiscount();
        $scope.appData.productInfo.grandTotal = roundToTwo(total - discountAmount)
        return $scope.appData.productInfo.grandTotal;
    }

    $scope.print = function(){
        $scope.appData.productInfo.subtotal = sumTotal();
        $scope.appData.productInfo.discountAmount = calculateDiscount();
        $state.go('app.invoice',{'data': $scope.appData});
    }


}])

.controller('InvoiceCtrl',['$scope','$state','$stateParams',function($scope,$state,$stateParams){
    if(!$stateParams.data || $stateParams.data == {}){
        $state.go('app.customer');
    }
    window.onbeforeunload = function() {
        return "Do you want to reload ? All data will be lost.";
    }
    var getCurrentDate = function(){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd = '0'+dd
        } 

        if(mm<10) {
            mm = '0'+mm
        } 

        today = dd + '/' + mm + '/' + yyyy;
        return today;
    }
    $scope.billNumber = Math.floor(1000 + Math.random() * 9000);
    $scope.companyName = "PIT Solutions Pvt Ltd";
    $scope.currentDate = getCurrentDate();
    $scope.location = "Technopark, Trivandrum";
    $scope.customerInfo = $stateParams.data.customerData;
    $scope.productInfo = $stateParams.data.productInfo;
    
}])

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/customer');
    $locationProvider.html5Mode(true);
    $stateProvider
        .state('app',{
            url:'',
            templateUrl:'templates/app.html',
            abstract:true,
            controller: 'AppCtrl'
        })
        .state('app.customerData',{
            url:'/customer',
            templateUrl:'templates/customerDataCollection.html',
            controller: 'CustomerDataCtrl'
        })
        .state('app.product',{
            url:'/product',
            templateUrl:'templates/productEntry.html',
            controller: 'ProductEntryCtrl'
        })
        .state('app.invoice',{
            url:'/invoice',
            templateUrl:'templates/invoice.html',
            controller: 'InvoiceCtrl',
            params : {
                'data' : {}
            }
        })
});