(function() {
  var $, ajax, buildDialogs, buildHtml, buildSpinner, init, l10n, onAdd, onDelete, onInsert, onUpdate, restore, setupEvents;

  $ = jQuery;

  l10n = contentTemplate.l10n;

  ajax = function(data, ajaxMeta) {
    var args;
    $('#content-template-spinner').show();
    $('a.content-template-action').css('visibility', 'hidden');
    $('input.content-template-action').prop('disabled', true);
    args = {
      type: 'POST',
      url: ajaxurl,
      data: {
        action: 'content_template',
        nonce: contentTemplate.nonce
      }
    };
    $.extend(true, args.data, data, ajaxMeta);
    return $.ajax(args).always(function() {
      $('#content-template-spinner').hide();
      $('.content-template-action').css('visibility', 'visible');
      return $('input.content-template-action').prop('disabled', false);
    });
  };

  init = function() {
    buildHtml();
    buildDialogs();
    buildSpinner();
    setupEvents();
    return restore(contentTemplate.data);
  };

  buildHtml = function() {
    return $("<p id=\"content-template-message\"></p>\n\n<div id=\"content-template-section-non-add\">\n  <p>\n    <label>\n      <span class=\"screen-reader-text\">" + l10n.select + "</span>\n      <select id=\"content-template-list\" name=\"content_template_list\">\n      </select>\n    </label>\n  </p>\n  <p>\n    <a id=\"content-template-update\" class=\"content-template-action\" tabindex=\"0\">" + l10n.update + "</a>\n    <a id=\"content-template-delete\" class=\"content-template-action\" tabindex=\"0\">" + l10n["delete"] + "</a>\n    <input id=\"content-template-insert\" class=\"button content-template-action\" type=\"button\" value=\"" + l10n.insert + "\" />\n  </p>\n</div>\n\n<div id=\"content-template-section-add\">\n  <p>\n    <label>\n      <span class=\"screen-reader-text\">" + l10n.name + "</span>\n      <input id=\"content-template-name\" type=\"text\" name=\"content_template_name\" />\n    </label>\n  </p>\n  <p>\n    <input id=\"content-template-add\" class=\"button content-template-action\" type=\"button\" value=\"" + l10n.add + "\" />\n  </p>\n</div>").appendTo('#content-template-content');
  };

  buildSpinner = function() {
    return $('<img/>', {
      id: 'content-template-spinner',
      src: contentTemplate.spinnerUrl
    }).appendTo('#content-template .hndle').hide();
  };

  buildDialogs = function() {
    var commonDialogArgs;
    commonDialogArgs = {
      autoOpen: false,
      dialogClass: 'wp-dialog',
      modal: true,
      resizable: false
    };
    $('<div/>', {
      id: 'content-template-update-dialog'
    }).dialog($.extend(true, {}, commonDialogArgs, {
      buttons: [
        {
          id: 'content-template-update-update',
          text: l10n.update,
          click: function() {
            onUpdate();
            return $(this).dialog('close');
          }
        }, {
          id: 'content-template-update-cancel',
          text: l10n.cancel,
          click: function() {
            return $(this).dialog('close');
          }
        }
      ]
    }));
    return $('<div/>', {
      id: 'content-template-delete-dialog'
    }).dialog($.extend(true, {}, commonDialogArgs, {
      buttons: [
        {
          id: 'content-template-delete-delete',
          text: l10n['delete'],
          click: function() {
            onDelete();
            return $(this).dialog('close');
          }
        }, {
          id: 'content-template-delete-cancel',
          text: l10n.cancel,
          click: function() {
            return $(this).dialog('close');
          }
        }
      ]
    }));
  };

  setupEvents = function() {
    $('#content-template-name').keydown(function(event) {
      if (event.which === 13) {
        event.preventDefault();
        return $('#content-template-add').click();
      }
    });
    $('#content-template-add').click(onAdd);
    $('#content-template-insert').click(onInsert);
    $('#content-template-update').click(function() {
      return $('#content-template-update-dialog').html(l10n.updateConfirm).dialog('open');
    });
    return $('#content-template-delete').click(function() {
      return $('#content-template-delete-dialog').html(l10n.deleteConfirm).dialog('open');
    });
  };

  restore = function(data) {
    var key, keys, _i, _len;
    keys = ((function() {
      var _results;
      _results = [];
      for (key in data) {
        _results.push(key);
      }
      return _results;
    })()).sort(function(a, b) {
      a = a.toUpperCase();
      b = b.toUpperCase();
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 0;
      }
    });
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      $('<option/>', {
        text: key,
        value: key
      }).appendTo('#content-template-list');
    }
    if ($('#content-template-list option').length) {
      return $('#content-template-section-non-add').show();
    } else {
      return $('#content-template-section-non-add').hide();
    }
  };

  onAdd = function() {
    var data, input, nameInData, templateName;
    templateName = $('#content-template-name').val();
    if (!templateName) {
      $('#content-template-message').html(l10n.nameRequired);
      return;
    } else {
      $('#content-template-message').html('');
    }
    for (nameInData in contentTemplate.data) {
      if (nameInData === templateName) {
        $('#content-template-message').html(l10n.nameDuplicated);
        return;
      }
    }
    data = {};
    data.title = $('#title').val();
    data.excerpt = $('#excerpt').val();
    data.tags = $('#tax-input-post_tag').val();
    if ($('#wp-content-wrap').hasClass('tmce-active')) {
      data.content = switchEditors.pre_wpautop(tinyMCE.get('content').getContent());
    } else {
      data.content = $('#content').val();
    }
    data.categories = (function() {
      var _i, _len, _ref, _results;
      _ref = $('#category-all input:checked');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        input = _ref[_i];
        _results.push(/in-category-(\d+)/.exec(input.id)[1]);
      }
      return _results;
    })();
    return ajax(data, {
      state: 'add',
      name: templateName
    }).done(function() {
      var $options;
      $options = $('#content-template-list option');
      $options.push($('<option/>', {
        text: templateName,
        value: templateName
      })[0]);
      $options.sort(function(a, b) {
        a = $(a).text().toUpperCase();
        b = $(b).text().toUpperCase();
        if (a > b) {
          return 1;
        } else if (a < b) {
          return -1;
        } else {
          return 0;
        }
      });
      $('#content-template-list').empty().append($options).val(templateName);
      $('#content-template-section-non-add').show();
      return contentTemplate.data[templateName] = data;
    });
  };

  onInsert = function() {
    var $content, $excerpt, $title, category, data, templateName, _i, _len, _ref;
    templateName = $('#content-template-list').val();
    data = contentTemplate.data[templateName];
    $('#title-prompt-text').hide();
    $title = $('#title');
    $title.val($title.val() + data.title);
    $excerpt = $('#excerpt');
    $excerpt.val($excerpt.val() + data.excerpt);
    $content = $('#content');
    if ($('#wp-content-wrap').hasClass('tmce-active')) {
      tinyMCE.get('content').setContent(tinyMCE.get('content').getContent() + switchEditors.wpautop(data.content));
    } else {
      $content.val($content.val() + data.content);
    }
    $('#category-all input:checked').each(function() {
      return $(this).prop('checked', false);
    });
    _ref = data.categories;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      category = _ref[_i];
      $('#in-category-' + category).prop('checked', true);
    }
    $('#tax-input-post_tag').val(data.tags);
    return tagBox.flushTags(null, null, false);
  };

  onUpdate = function() {
    var data, input, templateName;
    templateName = $('#content-template-list').val();
    data = {};
    data.title = $('#title').val();
    data.excerpt = $('#excerpt').val();
    data.tags = $('#tax-input-post_tag').val();
    if ($('#wp-content-wrap').hasClass('tmce-active')) {
      data.content = switchEditors.pre_wpautop(tinyMCE.get('content').getContent());
    } else {
      data.content = $('#content').val();
    }
    data.categories = (function() {
      var _i, _len, _ref, _results;
      _ref = $('#category-all input:checked');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        input = _ref[_i];
        _results.push(/in-category-(\d+)/.exec(input.id)[1]);
      }
      return _results;
    })();
    return ajax(data, {
      state: 'update',
      name: templateName
    }).done(function() {
      return contentTemplate.data[templateName] = data;
    });
  };

  onDelete = function() {
    var templateName;
    templateName = $('#content-template-list').val();
    return ajax({}, {
      state: 'delete',
      name: templateName
    }).done(function() {
      delete contentTemplate.data[templateName];
      $('#content-template-list option').each(function() {
        var $this;
        $this = $(this);
        if ($this.text() === templateName) {
          $this.remove();
          return false;
        }
      });
      if (!$('#content-template-list option').length) {
        return $('#content-template-section-non-add').hide();
      }
    });
  };

  $.extend(true, contentTemplate, {
    init: init,
    restore: restore
  });

  $(document).ready(contentTemplate.init);

}).call(this);
