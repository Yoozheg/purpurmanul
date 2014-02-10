(function(window, document, $, undefined){
 "use strict";
 var countdownObj  = {timestamp: (new Date(2014,1,14))}; // 2014 февраль 14
 
 $(document).ready(function(){
  $('#countdown').countdown(countdownObj);
	

 });
})(window, document, jQuery);