(function(window, document, $, undefined){
 "use strict";
 var countdownObj  = {timestamp: (new Date(2014,1,14))}; // 2014 февраль 14 == 2014,1,14 // месяцы начинаются с 0, т.е., январь - 0, декабрь - 11
 
 function ajax(text, addr, callback, params){
  var req = (parseURL(addr).host === window.location.hostname) ? new XMLHttpRequest() : (function(XHR){return new XHR()})(window.XDomainRequest || window.XMLHttpRequest);
  var defaultParams = {method: text ? "post" : "get", json: false, async: true};
  if(!params) params = {};
	 for(var key in defaultParams) if(params[key] === undefined) params[key] = defaultParams[key];
  params.method = (params.method || (text ? "post" : "get")).toLowerCase();
  if(text !== undefined && typeof text !== "string"){
   if(params.method === "post"){
   var res = new FormData();
    for(var f in text){
     if(typeof text[f] === "object" && text[f] instanceof Array){
      for(var i = 0; i < text[f].length; ++i) res.append(f, text[f][i]);
     }else res.append(f, text[f]);
    }
    text = res;
   }else text = toQueryString(text); // get
  }
  if(params.method === "get" && text) addr += "?" + text;
  req.open(params.method, addr, params.async);
  xcrft(req, {type: params.method, url: addr});
  req.send(params.method === "get" ? null : text);
  if(params.async && callback) req.onload = function(){callback.call(null, params.json ? JSON.parse(req.responseText) : req.responseText)}
  if(!params.async && req.status === 200){return params.json ? JSON.parse(req.responseText) : req.responseText}
  return this;

  function xcrft(xhr, settings){
   function sameOrigin(url){
    var host = document.location.host; // host + port
    var protocol = document.location.protocol;
    var sr_origin = '//' + host;
    var origin = protocol + sr_origin;
    return (url == origin || url.slice(0, origin.length + 1) == origin + '/')
     || (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/')
     || !(/^(\/\/|http:|https:).*/.test(url));
   }
   function safeMethod(method){ return (/^(GET|HEAD|OPTIONS|TRACE)$/i.test(method)) }
   if(!safeMethod(settings.type) && sameOrigin(settings.url)) xhr.setRequestHeader("X-CSRFToken", cookie("csrftoken"));
  }
 }
 function cookie(name, value, props){
  if(!value && !props){
   var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
   return matches ? decodeURIComponent(matches[1]) : undefined;
  }
  props = props ||{};
  var exp = props.expires;
  if(typeof exp == "number" && exp){
   var d = new Date();
   d.setTime(d.getTime() + exp*1000);
   exp = props.expires = d;
  }
  if(exp && exp.toUTCString){props.expires = exp.toUTCString()}
  value = encodeURIComponent(value);
  var updatedCookie = name + "=" + value;
  for(var propName in props){
   updatedCookie += "; " + propName;
   var propValue = props[propName];
   if(propValue !== true) updatedCookie += "=" + propValue;
  }
  document.cookie = updatedCookie;
  return this
 }
 function toQueryString(obj, prefix){
  var str = [];
  for(var p in obj){
   var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
   str.push(typeof v == "object" ? $.toQueryString(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
  }
  return str.join("&");
 }
 function parseURL(url){
  var a =  document.createElement('a');
  a.href = url;
  return {
   source: url,
   protocol: a.protocol.replace(':',''),
   host: a.hostname,
   port: a.port,
   query: a.search,
   params: (function(){
    var ret = {}, seg = a.search.replace(/^\?/,'').split('&'), len = seg.length, i = 0, s;
    for(;i<len;i++){
     if(!seg[i]) continue;
     s = seg[i].split('=');
     ret[s[0]] = s[1];
    }
    return ret;
   })(),
   file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
   hash: a.hash.replace('#',''),
   path: a.pathname.replace(/^([^\/])/,'/$1'),
   relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
   segments: a.pathname.replace(/^\//,'').split('/')
  };
 }
 function copy(dst){
   for(var i = 1; i < arguments.length; ++i){
    var obj = arguments[i];
    for(var key in obj){
     dst[key] = obj[key];
    }
   }
   return dst;
  }
 
 function getFormData(form, clean){
  var data = [], inputs = $(form).find('input'), textareas = $(form).find('textarea');
	for(var i = 0; i < inputs.length; ++i){
	 data.push({
	  name: inputs[i].name,
		value: inputs[i].value,
		valid: (inputs[i].value.length > 0 && inputs[i].checkValidity())
	 });
	 if(clean) inputs[i].value = '';
  }
	for(var i = 0; i < textareas.length; ++i){
	 data.push({
	  name: textareas[i].name,
		value: textareas[i].value,
		valid: textareas[i].value.length > 0
	 });
	 if(clean) textareas[i].value = '';
  }
  return data;
 }
 function adaper(data){
  var adaptedData = {};
	for(var i = 0; i < data.length; ++i){
	 if(data[i].valid){
	  adaptedData[data[i].name] = data[i].value;
	 }
	}
	return adaptedData;
 }
 function sendData(data){
  copy(data, window.data);
  ajax(data, 'server.php', function(r){
   alert(r);
   $('#splash').hide();
   window.data = {};
  });
 }
 function initForm(form, button){
  function submit(e){
   var fields = $('#'+form).find('input:required');
   for(var i=0;i<fields.length;++i){
    if($.trim(fields[i].value).length == 0) return alert('Одно из полей не заполнено!');
   }
	 var data = getFormData('#'+form, true);
	 data = adaper(data);
	 sendData(data)
   e.preventDefault();
   e.stopPropagation();
   e.cancelBubble = true;
	 return false;
	}
  function stop(e){
   e.preventDefault();
   e.stopPropagation();
   e.cancelBubble = true;
	 return false;
  }
	if(button) $('#'+button).click(submit);
  $('#'+form).find('input').click(stop);
  $('#'+form).find('textarea').click(stop);
	$('#'+form).submit(submit);
 }
 function initForms(inits){
  for(var i = 0; i < inits.length; ++i){
	 typeof inits[i] == 'object' ? initForm(inits[i].form, inits[i].button) : initForm(inits[i]);
	}
 }
 
 
 $(document).ready(function(){
  window.data = {};
  $('#countdown').countdown(countdownObj);
	initForms([
	 {form:'topform', button:'topformbutton'},
	 {form:'greenform', button:'greenformbutton'},
	 {form:'featureform', button:'featureformbutton'},
	 {form:'footerform', button:'footerformbutton'},
	 {form:'splashform', button:'splashformbutton'}
	]);

	$('#splash').click(function(e){$(this).hide();window.data = {}})
	$('header #top div img').click(function(e){$('#splash').show()});
	$('#present_woman img.mini').click(function(e){
	 var li = $(this.parentNode);
	 li.find('img.show').toggleClass('show');
	 var src = this.getAttribute('src').replace('mini/','').replace('m.jpg','.jpg');
	 li.find('img[src="'+src+'"]').toggleClass('show');
	});
	$('#present_woman img.color').click(function(e){
	 var li = $(this.parentNode);
	 li.find('img.selected').toggleClass('selected');
	 $(this).toggleClass('selected');
	});
	$('#present_woman img.button').click(function(e){
	 var li = $(this.parentNode);
	 var color = li.find('img.color.selected');
	 color = $.trim(color.attr("class").replace('selected','').replace('color',''));
	 var present = li.find('h3').html();
   window.data = {present:present, color:color};
   $('#splash').show();
	});
 });
})(window, document, jQuery);