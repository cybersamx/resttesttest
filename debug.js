function showParamHeaders() {
	if ($("#allparameters").find(".realinputvalue").length > 0) {
		$("#allparameters").show();
	} else {
		$("#allparameters").hide();
	}
}

//this specifies the parameter names
$(".fakeinputname").blur(function() {
  var newparamname = $(this).val();
  $(this).parent().parent().parent().parent().find(".realinputvalue").attr("name", newparamname);
});
 

$(".close").click(function(e) {
  e.preventDefault();
  $(this).parent().remove();
	showParamHeaders();
});

$("#addprambutton").click(function(e) {
  e.preventDefault();
	$('.httpparameter:first').clone(true).appendTo("#allparameters");
	showParamHeaders();
});

$("#addfilebutton").click(function(e) {
  e.preventDefault();
	$('.httpfile:first').clone(true).appendTo("#allparameters");
	showParamHeaders();
});

$("#resetfilebutton").click(function(e) {
  e.preventDefault();
  initForm("GET", "", {});
  showParamHeaders();
});

function postWithAjax(myajax) {
  myajax = myajax || {};
  myajax.url = $("#urlvalue").val();
  myajax.type = $("#httpmethod").val();
  myajax.complete = function(jqXHR) {
		$("#statuspre").text(
				"HTTP " + jqXHR.status + " " + jqXHR.statusText);
		if (jqXHR.status == 0) {
			httpZeroError();
		} else if (jqXHR.status >= 200 && jqXHR.status < 300) {
			$("#statuspre").addClass("alert-success");
		} else if (jqXHR.status >= 400) {
			$("#statuspre").addClass("alert-error");
		} else {
			$("#statuspre").addClass("alert-warning");
		}

    var contentType = jqXHR.getResponseHeader('content-type');

    if (contentType.indexOf('application/json') >= 0) {
      $("#outputpre").show();
      $("#outputpre").text(jqXHR.responseText);
      $("#outputiframe").hide();
      $("#outputiframe").empty();
      $("#outputimg").hide();
      $("#outputimg").empty();
    }
    else if (contentType.match(/image\/.*/gif)) {
      $("#outputpre").hide();
      $("#outputpre").empty();
      $("#outputiframe").hide();
      $("#outputiframe").empty();
      $("#outputimg").show();
      $("#outputimg").attr("src", myajax.url);  // TODO: Load the image directly to the img element.
    }
    else {
      $("#outputpre").hide();
      $("#outputpre").empty();
      $("#outputiframe").show();
      $("#outputiframe").attr("srcdoc", jqXHR.responseText);
      $("#outputimg").hide();
      $("#outputimg").empty();
    }

		$("#headerpre").text(jqXHR.getAllResponseHeaders());
	}

	if (jQuery.isEmptyObject(myajax.data)) {
		myajax.contentType = 'application/x-www-form-urlencoded';
	}

	$("#outputframe").hide();
  $("#outputpre").show();
  $("#outputpre").empty();
  $("#outputiframe").hide();
  $("#outputiframe").empty();
  $("#outputframe").attr("src", "")
  $("#outputframe").attr("srcdoc", "")
  $("#outputimg").hide();
  $("#outputimg").empty();
	$("#headerpre").empty();
	$("#ajaxoutput").show();
	$("#statuspre").text("0");
	$("#statuspre").removeClass("alert-success");
	$("#statuspre").removeClass("alert-error");
	$("#statuspre").removeClass("alert-warning");

  $('#ajaxspinner').show();
	var req = $.ajax(myajax).always(function(){
    $('#ajaxspinner').hide();
	});
}

$("#submitajax").click(function(e) {
  e.preventDefault();
  if(checkForFiles()){
    postWithAjax({
      data : createMultipart(), 
      cache: false,
      contentType: false,
      processData: false  
    });
  } else {
    postWithAjax({
      data : createUrlData()
    });    
  }
});

function checkForFiles() {
	return $("#paramform").find(".input-file").length > 0;
}

function createUrlData(){
  var mydata = {};
	var parameters = $("#allparameters").find(".realinputvalue");
	for (var i = 0; i < parameters.length; i++) {
		name = $(parameters).eq(i).attr("name");
		if (name == undefined || name == "undefined") {
			continue;
		}
		value = $(parameters).eq(i).val();
		mydata[name] = value
	}
  return(mydata);
}

function createMultipart(){
  //create multipart object
  var data = new FormData();
  
  //add parameters
  var parameters = $("#allparameters").find(".realinputvalue");
	for (var i = 0; i < parameters.length; i++) {
		name = $(parameters).eq(i).attr("name");
		if (name == undefined || name == "undefined") {
			continue;
		}
    if(parameters[i].files){
  	  data.append(name, parameters[i].files[0]);      
    } else {
		  data.append(name, $(parameters).eq(i).val());
    }
	}
  return(data)  
}

function httpZeroError() {
	$("#errordiv").append('<div class="alert alert-error"> <a class="close" data-dismiss="alert">&times;</a> <strong>Oh no!</strong> Javascript returned an HTTP 0 error. One common reason this might happen is that you requested a cross-domain resource from a server that did not include the appropriate CORS headers in the response. Better open up your Firebug...</div>');
}

function initForm(verb, url, params) {
  var elems = $("#allparameters").find(".httpparameter");
  for (var i=0; i<elems.length; i++) {
    elems[i].remove();
  }

  for (var key in params) {
    var httpparam = $(".httpparameter:first").clone(true).appendTo("#allparameters");
    httpparam.find(".fakeinputname").attr("value", key);
    httpparam.find(".realinputvalue").attr("name", key);
    httpparam.find(".realinputvalue").attr("value", params[key]);
  }

  $("#urlvalue").val(url);
  $("#httpmethod").val(verb);

  showParamHeaders();
}