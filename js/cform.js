/***
 * @name   SerpTop
 * @email  tech@serptop.ru
 * @site   serptop.ru
 ***/

function cForm( options ){
	this.dom = {};
	this.dom.$root = options.cForm;
	this.options = jQuery.extend(true, {}, this.optionsDefault, options );
}

cForm.prototype = {
	constructor: cForm,

	optionsDefault: {
    id: '',
		output: 'text',
		validation: 'feedback',
		lang: {
			validation: {
				validation_field: "Поле не может быть пустым",
				validation_phone: "Укажите правильный номер телефона",
				validation_email: "Укажите правильный Email адрес",
				validation_checkbox: "Вы должны отметить данное поле",
				validation_radio: "Вы должны выбрать хотя бы одно значение"
			}
		}
	},

	dom: {},
	validation : {},
	action: true,
  file: false,

	run: function() {
		this.doSetDom();
		this.doBindEvents();
	},


	doSetDom: function() {
  	this.dom.$form               = this.dom.$root.find('form');
		this.dom.$formControl        = this.dom.$root.find('input, select, textarea');
    this.dom.$file               = this.dom.$root.find('input[type="file"]');

		this.validation.type 			   = this.options.validation;
    this.validation.required     = this.dom.$root.find('*[required], .validation-phone, .validation-email');
	},

	doBindEvents: function() {

		var $that = this;
		var $validate = true;

		this.doInitForm();
		this.doChangeFormControl();
		this.doFormProcesedPersonalData();

		this.dom.$form.submit(function(event){

      event.preventDefault();
      event.stopPropagation();
	  	$that.doSetDom();

			if($that.validation.required.length) {
				$validate = $that.doValidateFormSubmit($that.validation.required);
			}
			else {
				$validate = true;
			}

			if($validate == true) {
				if($that.options.action != false) {
					$that.sendAjaxRequest();
				}
				else {
					$(this).unbind('submit').submit();
				}
			}

		});

	},

  doInitForm: function() {

    var $key = Math.floor(Math.random() * (100 - 0 + 1)) + 0;
    var $fields = this.dom.$root.find('input:not([type="hidden"]):not([type="submit"]):not([id]), select:not([id]), textarea:not([id])');

    if($fields.length) {
      for (var i = 0; i < $fields.length; i++) {
				if($($fields[i]).attr('type') == 'checkbox' || $($fields[i]).attr('type') == 'radio') {
					$($fields[i]).attr('id', 'field-input--'+$key+'-'+(i+1)).siblings('label').attr('for', 'field-input--'+$key+'-'+(i+1));
				}
				else {
        	$($fields[i]).attr('id', 'field-input--'+$key+'-'+(i+1)).parents('.form-group').find('label').attr('for', 'field-input--'+$key+'-'+(i+1));
				}
      }
    }

    if(this.validation.required) {
      for (var i = 0; i < this.validation.required.length; i++) {
				if($(this.validation.required[i]).parent('.form-check').length) {
					$(this.validation.required[i]).parents('.form-check').find('label').append('<sup class="required-field" data-toggle="tooltip" data-container="body" title="Обязательное поле">*</sup>');
				}
				else {
        	$(this.validation.required[i]).parents('.form-group').find('label').append('<sup class="required-field" data-toggle="tooltip" data-container="body" title="Обязательное поле">*</sup>');
				}
      }
    }


    if(this.dom.$file.length) {
      this.file = true;
      this.dom.$form.attr('enctype', 'multipart/form-data');
    }

    if(this.dom.$root.find('.validation-phone')) {
			this.dom.$root.find('.validation-phone').mask('+375 (__) ___ - __ - __', {autoclear: false});
		}

    this.dom.$form.append('<input type="hidden" name="c-form-anti" value="" />');
    this.dom.$form.append('<input type="hidden" name="c-form-id" value="'+this.options.id+'" />');

	},

	doValidateFormSubmit: function(fields) {

		var $validateForm = true;
    for (var i = 0; i < fields.length; i++) {
			var $validate = this.doValidateField(fields[i]);
      if($validate == false) {
				$validateForm = false;
      }
    }

    if($validateForm == true) {
      return true;
    }
    else {
      return false;
    }

	},

	doChangeFormControl: function() {
		var $that = this
		this.validation.required.change(function() {
			$that.doValidateField(this);
		});

	},


	sendAjaxRequest: function() {
		var $that = this;
		var $url = this.dom.$form.prop('action');

		if(this.file == false) {
			var $data = $( this.dom.$form ).serialize();
			$.ajax({
				type: "POST",
				url: $url,
				data: $data,
				dataType: "json",
				success: function( response ){
					$that.onAjaxResponse( response );
				},
				error: function( response ) {
					$that.onAjaxResponse( response );
				}
			});

		}
		else {
			var $form = this.dom.$form.get(0);
			var $data = new FormData($form);
			$.ajax({
				type: "POST",
				url: $url,
				processData: false,
				contentType: false,
				data: $data,
				dataType: "json",
				success: function( response ){
					$that.onAjaxResponse( response );
				},
				error: function( response ) {
					$that.onAjaxResponse( response );
				}
			});
		}

	},

	onAjaxResponse: function( response ) {

		if(this.options.output == 'text') {
			if(this.dom.$form.find('.form-group--result').length) {
				this.dom.$form.find('.form-group--result').html('<div class="alert alert-'+response.status+'"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+response.result+'</div>');
			}
			else {
				this.dom.$form.find('*[type="submit"]').parents('.form-group').before('<div class="form-group form-group--result"><div class="alert alert-'+response.status+'"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+response.result+'</div></div>');
			}
		}

		if(this.options.output == 'modal') {
			var $key = Math.floor(Math.random() * (100 - 0 + 1)) + 0;
			$('body').append('<div class="modal fade" id="modal-'+$key+'" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-body"><div class="alert alert-'+response.status+' mb-0">'+response.result+'<br /> Окно автоматически закроется через 3 секунды.</div></div></div></div>');
			$('#modal-'+$key).modal({
  			keyboard: true
			})
			$('#modal-'+$key).modal('show');
			setTimeout(function() {
				$('#modal-'+$key).modal('hide');
			}, 3000);
		}

		if(response.status == 'success') {
			this.doFormReset();
			if(this.options.hasOwnProperty('goals')) {
	 			this.doReachGoal();
			}
		}
	},

	doValidateField: function(self) {

		var $validation = true;
		if($(self).attr('type') == 'file' && $(self)[0].files.length) {
			var $val = $(self)[0].files[0].name;
		}
		else {
			 var $val = $(self).val();
		}

		if($(self).attr('type') == 'checkbox' || $(self).attr('type') == 'radio') {

			var $validation = $(self).get(0).checkValidity();

			if($(self).attr('type') == 'checkbox') {
				var $type = 'checkbox';
			}
			if($(self).attr('type') == 'radio') {
				var $type = 'radio';
			}

		}
		else {
			if($(self).hasClass('validation-phone')) {
				var $reg = /^\+375\s\([\d]{2,3}\)\s[\d]{2,3}\s-\s[\d]{2,3}\s-\s[\d]{2,3}$/i;
				var $validation = $reg.test($val);
				var $type = 'phone';
			}

			if($(self).hasClass('validation-email')) {
				var $reg = /^[\w]{1}[\w-\.]*@[\w-]+\.[a-z]{2,4}$/i;
				var $validation = $reg.test($val);
				var $type = 'email';
			}

			if($(self).prop('required') && $val.length == 0) {
				var $validation = false;
				var $type = 'empty';
			}
		}

		if($validation == true) {
			this.doRenderValidate(self, 'is-valid', $type);
			return true;
		}
		else {
			this.doRenderValidate(self, 'is-invalid', $type);
			return false;
		}
	},

	doRenderValidate: function (self, status, type) {

		if(status == 'is-invalid') {
			$(self).removeClass('is-valid');
			if($(self).data('validation-msg')) {
				var $text = $(self).data('validation-msg');
			}
			else {
				switch(type) {
					case 'phone': var $text = this.options.lang.validation.validation_phone; break;
					case 'email': var $text = this.options.lang.validation.validation_email; break;
					case 'checkbox': var $text = this.options.lang.validation.validation_checkbox; break;
					case 'radio': var $text = this.options.lang.validation.validation_radio; break;
					default: var $text = this.options.lang.validation.validation_field;
				}
			}

			if(type == 'radio') {
				$(self).parents('.form-group').find('.form-check-input').addClass('is-invalid');
				if(!$(self).parents('.form-group').find('.invalid-'+this.validation.type+'--radio').length) {
					$(self).parents('.form-group').append('<div class="invalid-'+this.validation.type+' invalid-'+this.validation.type+'--radio">'+$text+'</div>');
				}
				else {
					$(self).parents('.form-group').find('.invalid-'+this.validation.type+'--radio').text($text);
				}
			}
			else {
				if(!$(self).hasClass('is-invalid')) {
					$(self).addClass('is-invalid');
				}
				if(!$(self).parent().find('.invalid-'+this.validation.type).length) {
					$(self).parent().append('<div class="invalid-'+this.validation.type+'">'+$text+'</div>');
				}
				else {
					$(self).parent().find('.invalid-+'+this.validation.type).text($text);
				}
			}

		}

		if(status == 'is-valid') {
			if(type == 'radio') {
				$(self).parents('.form-group').find('.form-check-input').removeClass('is-invalid').addClass('is-valid');
				if($(self).parents('.form-group').find('.invalid-'+this.validation.type).length) {
					$(self).parents('.form-group').find('.invalid-'+this.validation.type).remove();
				}
			}
			else {
				$(self).removeClass('is-invalid');
				if(!$(self).hasClass('is-valid')) {
					$(self).addClass('is-valid');
				}
				if($(self).siblings('.invalid-'+this.validation.type).length) {
					$(self).siblings('.invalid-'+this.validation.type).remove();
				}
			}
		}

	},


	doFormProcesedPersonalData: function() {
		var $that = this;
		this.dom.$form.find('.person-data--checkbox').on('click', function() {
			if (!$(this).is(':checked')) {
				$that.dom.$form.find('*[type="submit"]').attr('disabled', 'disabled');
			} else {
			  $that.dom.$form.find('*[type="submit"]').removeAttr('disabled');
			}
		});
	},

	doFormReset: function(  ) {
		$(this.dom.$form)[0].reset();
		$(this.dom.$formControl).removeClass('is-valid');
	},

	doReachGoal: function() {

		if ( this.options.goals.YaMetrika.goalId === '' &&  this.options.goals.YaMetrika.goalCounter === '' ) {
			return false;
		}

		if ( window[ 'yaCounter'+this.options.goals.YaMetrika.goalCounter ] !== 'undefined' ) {
			counter = window['yaCounter'+this.options.goals.YaMetrika.goalCounter];
			counter.reachGoal( this.options.goals.YaMetrika.goalId );
		}

	}
};
