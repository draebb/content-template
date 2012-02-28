(function() {
  var testLinksButtonsWhileAjax, testSpinnerWhileAjax;

  this.$ = jQuery;

  this.tinyMCE = {
    get: function() {}
  };

  describe('Content Template', function() {
    var $, ajaxExpection, fakeSwitchToTinyMCE, l10n;
    $ = jQuery;
    ajaxExpection = {
      type: 'POST',
      url: ajaxurl,
      data: {
        action: 'content_template',
        nonce: contentTemplate.nonce
      }
    };
    l10n = contentTemplate.l10n;
    fakeSwitchToTinyMCE = function() {
      return $('#wp-content-wrap').removeClass('html-active').addClass('tmce-active');
    };
    beforeEach(function() {
      loadFixtures('fixture.html');
      jasmine.Ajax.useMock();
      spyOn($, 'ajax').andCallThrough();
      spyOn($.fn, 'dialog').andCallThrough();
      tagBox.init();
      contentTemplate.data = {};
      return contentTemplate.init();
    });
    describe('init', function() {
      describe('restore', function() {
        it('restores template list and sorts alphabetically', function() {
          var $options, expection, option, texts, values;
          contentTemplate.restore({
            'a': {},
            'c': {},
            'B': {}
          });
          $options = $('#content-template-list option');
          texts = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = $options.length; _i < _len; _i++) {
              option = $options[_i];
              _results.push($(option).text());
            }
            return _results;
          })();
          values = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = $options.length; _i < _len; _i++) {
              option = $options[_i];
              _results.push(option.value);
            }
            return _results;
          })();
          expection = ['a', 'B', 'c'];
          expect(texts).toEqual(expection);
          return expect(values).toEqual(expection);
        });
        it('hides the insert/override/delete part of the form if no template exists', function() {
          return expect($('#content-template-section-non-add')).toBeHidden();
        });
        return it('shows the insert/override/delete part of the form if a template exists', function() {
          contentTemplate.restore({
            'Template A': {}
          });
          return expect($('#content-template-section-non-add')).toBeVisible();
        });
      });
      it('builds dialogs', function() {
        expect($.fn.dialog).toHaveBeenCalledWith({
          autoOpen: false,
          dialogClass: 'wp-dialog',
          modal: true,
          resizable: false,
          buttons: [
            {
              id: 'content-template-update-update',
              text: l10n.update,
              click: jasmine.any(Function)
            }, {
              id: 'content-template-update-cancel',
              text: l10n.cancel,
              click: jasmine.any(Function)
            }
          ]
        });
        expect($('#content-template-update-dialog')).toExist();
        expect($.fn.dialog).toHaveBeenCalledWith({
          autoOpen: false,
          dialogClass: 'wp-dialog',
          modal: true,
          resizable: false,
          buttons: [
            {
              id: 'content-template-delete-delete',
              text: l10n['delete'],
              click: jasmine.any(Function)
            }, {
              id: 'content-template-delete-cancel',
              text: l10n.cancel,
              click: jasmine.any(Function)
            }
          ]
        });
        return expect($('#content-template-delete-dialog')).toExist();
      });
      return it('builds a hidden spinner image', function() {
        var $spinner;
        expect($('#content-template')).toContain('#content-template-spinner');
        $spinner = $('#content-template-spinner');
        expect($spinner).toHaveAttr('src', contentTemplate.spinnerUrl);
        return expect($spinner).toBeHidden();
      });
    });
    it('triggers add button when press enter in template name field', function() {
      var event;
      spyOnEvent($('#content-template-add'), 'click');
      event = $.Event('keydown', {
        which: 13
      });
      spyOn(event, 'preventDefault');
      $('#content-template-name').trigger(event);
      expect('click').toHaveBeenTriggeredOn($('#content-template-add'));
      return expect(event.preventDefault).toHaveBeenCalled();
    });
    describe('when click the add button', function() {
      var testNameDuplicated, testNameEmpty;
      beforeEach(function() {
        $('#title').val('the title');
        $('#content').val('the content');
        $('#excerpt').val('the excerpt');
        $('#in-category-1').prop('checked', true);
        $('#in-category-2').prop('checked', true);
        $('#tax-input-post_tag').val('t1,t2');
        return $('#content-template-name').val('template name');
      });
      it('denys if the template name is empty', testNameEmpty);
      testNameEmpty = function() {
        $('#content-template-name').val('');
        $('#content-template-add').click();
        expect($('#content-template-list')).not.toContain('option');
        return expect($('#content-template-message')).toHaveHtml(l10n.nameRequired);
      };
      it('denys if the template name is duplicated', testNameDuplicated);
      testNameDuplicated = function() {
        var data;
        data = contentTemplate.data = {
          'template name': {}
        };
        contentTemplate.restore(data);
        $('#content-template-add').click();
        expect($('#content-template-list option').length).toEqual(1);
        return expect($('#content-template-message')).toHaveHtml(l10n.nameDuplicated);
      };
      it('clears error message after corrected', function() {
        testNameEmpty();
        $('#content-template-name').val('template name');
        $('#content-template-add').click();
        expect($('#content-template-message')).toBeEmpty();
        testNameDuplicated();
        $('#content-template-name').val('new name');
        $('#content-template-add').click();
        return expect($('#content-template-message')).toBeEmpty();
      });
      it('sends a ajax', function() {
        $('#content-template-add').click();
        return expect($.ajax).toHaveBeenCalledWith($.extend(true, {}, ajaxExpection, {
          data: {
            state: 'add',
            name: 'template name',
            title: 'the title',
            content: 'the content',
            excerpt: 'the excerpt',
            categories: ['1', '2'],
            tags: 't1,t2'
          }
        }));
      });
      it('shows a spinner while ajax', function() {
        $('#content-template-add').click();
        testSpinnerWhileAjax(200);
        $('#content-template-name').val('new name');
        $('#content-template-add').click();
        return testSpinnerWhileAjax(500);
      });
      it('hides links and disables buttons while ajax', function() {
        $('#content-template-add').click();
        testLinksButtonsWhileAjax(200);
        $('#content-template-name').val('new name');
        $('#content-template-add').click();
        return testLinksButtonsWhileAjax(500);
      });
      describe('when ajax is done', function() {
        beforeEach(function() {
          $('#content-template-add').click();
          return mostRecentAjaxRequest().response({
            status: 200
          });
        });
        it('adds the template to the template list and sort alphabetically', function() {
          var $options, expection, option, texts, values;
          $('#content-template-name').val('a');
          $('#content-template-add').click();
          testLinksButtonsWhileAjax(200);
          $('#content-template-name').val('Z');
          $('#content-template-add').click();
          testLinksButtonsWhileAjax(200);
          $options = $('#content-template-list option');
          texts = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = $options.length; _i < _len; _i++) {
              option = $options[_i];
              _results.push($(option).text());
            }
            return _results;
          })();
          values = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = $options.length; _i < _len; _i++) {
              option = $options[_i];
              _results.push(option.value);
            }
            return _results;
          })();
          expection = ['a', 'template name', 'Z'];
          expect(texts).toEqual(expection);
          return expect(values).toEqual(expection);
        });
        it('saves contents to local data', function() {
          return expect(contentTemplate.data).toEqual({
            'template name': {
              title: 'the title',
              content: 'the content',
              excerpt: 'the excerpt',
              categories: ['1', '2'],
              tags: 't1,t2'
            }
          });
        });
        it('shows the insert/override/delete part of the form after added the first template', function() {
          return expect($('#content-template-section-non-add')).toBeVisible();
        });
        return it('selects the new template in the template list', function() {
          $('#content-template-name').val('new template');
          $('#content-template-add').click();
          mostRecentAjaxRequest().response({
            status: 200
          });
          return expect($('#content-template-list').val()).toEqual('new template');
        });
      });
      describe('if ajax is fail', function() {
        beforeEach(function() {
          $('#content-template-add').click();
          return mostRecentAjaxRequest().response({
            status: 500
          });
        });
        it('not adds the template name to the template list.', function() {
          return expect($('#content-template-list option')).not.toExist();
        });
        return it('not saves contents to local data', function() {
          return expect(contentTemplate.data['template name']).toBeUndefined();
        });
      });
      return it('pre_wpautop "content" when in TinyMCE mode', function() {
        spyOn(tinyMCE, 'get').andReturn({
          getContent: function() {
            return '<p>tinymce content</p>';
          }
        });
        fakeSwitchToTinyMCE();
        $('#content-template-add').click();
        mostRecentAjaxRequest().response({
          status: 200
        });
        return expect(contentTemplate.data).toEqual({
          'template name': {
            title: jasmine.any(String),
            content: 'tinymce content',
            excerpt: jasmine.any(String),
            categories: jasmine.any(Array),
            tags: jasmine.any(String)
          }
        });
      });
    });
    describe('when click the insert button', function() {
      beforeEach(function() {
        var data;
        data = contentTemplate.data = {
          'template name': {
            title: 'the title',
            content: 'the content',
            excerpt: 'the excerpt',
            categories: ['1', '2'],
            tags: 't1,t2'
          }
        };
        contentTemplate.restore(data);
        return $('#content-template-list').val('template name');
      });
      it('clears placeholder text of title', function() {
        $('#content-template-insert').click();
        return expect($('#title-prompt-text')).toBeHidden();
      });
      it('inserts contents', function() {
        spyOn(tagBox, 'flushTags');
        $('#content-template-insert').click();
        expect($('#title').val()).toEqual('the title');
        expect($('#content').val()).toEqual('the content');
        expect($('#excerpt').val()).toEqual('the excerpt');
        expect($('#category-all input:checked').eq(0).val()).toEqual('1');
        expect($('#category-all input:checked').eq(1).val()).toEqual('2');
        expect($('#tax-input-post_tag').val()).toEqual('t1,t2');
        return expect(tagBox.flushTags).toHaveBeenCalledWith(null, null, false);
      });
      it('wpautop "content" when in TinyMCE mode', function() {
        var setContent;
        setContent = jasmine.createSpy();
        spyOn(tinyMCE, 'get').andReturn({
          setContent: setContent,
          getContent: function() {
            return '';
          }
        });
        fakeSwitchToTinyMCE();
        $('#content-template-insert').click();
        return expect(setContent).toHaveBeenCalledWith('<p>the content</p>\n');
      });
      it('appends "content" if "content" has been filled in TinyMCE mode', function() {
        var setContent;
        setContent = jasmine.createSpy();
        spyOn(tinyMCE, 'get').andReturn({
          setContent: setContent,
          getContent: function() {
            return '<p>the content</p>';
          }
        });
        fakeSwitchToTinyMCE();
        $('#content-template-insert').click();
        return expect(setContent).toHaveBeenCalledWith('<p>the content</p><p>the content</p>\n');
      });
      it('unchecks already selected categories when insert contents', function() {
        $('#in-category-3').prop('checked', true);
        $('#content-template-insert').click();
        return expect($('#in-category-3').prop('checked')).toBeFalsy();
      });
      return it('appends contents if title, post content or excerpt has been filled', function() {
        $('#title').val('the title');
        $('#content').val('the content');
        $('#excerpt').val('the excerpt');
        $('#content-template-insert').click();
        expect($('#title').val()).toEqual('the titlethe title');
        expect($('#content').val()).toEqual('the contentthe content');
        return expect($('#excerpt').val()).toEqual('the excerptthe excerpt');
      });
    });
    describe('when click the update button', function() {
      beforeEach(function() {
        var data;
        data = contentTemplate.data = {
          'template name': {
            title: 'the title',
            content: 'the content',
            excerpt: 'the excerpt',
            categories: ['1', '2'],
            tags: 't1,t2'
          }
        };
        contentTemplate.restore(data);
        $('#content-template-list').val('template name');
        $('#title').val('new title');
        $('#content').val('new content');
        $('#excerpt').val('new excerpt');
        $('#in-category-3').prop('checked', true);
        $('#in-category-4').prop('checked', true);
        return $('#tax-input-post_tag').val('t3,t4');
      });
      it('shows a confirmation message', function() {
        $('#title').val('new title');
        $('#content-template-update').click();
        expect($('#content-template-update-dialog').html()).toEqual(l10n.updateConfirm);
        expect($.fn.dialog).toHaveBeenCalledWith('open');
        $('#content-template-update-cancel').click();
        expect(contentTemplate.data).toEqual({
          'template name': {
            title: 'the title',
            content: jasmine.any(String),
            excerpt: jasmine.any(String),
            categories: jasmine.any(Array),
            tags: jasmine.any(String)
          }
        });
        $('#content-template-update').click();
        $('#content-template-update-update').click();
        return expect($('#content-template-update-dialog').dialog('isOpen')).toBeFalsy();
      });
      it('sends a ajax', function() {
        $('#content-template-update').click();
        $('#content-template-update-update').click();
        return expect($.ajax).toHaveBeenCalledWith($.extend(true, {}, ajaxExpection, {
          data: {
            state: 'update',
            name: 'template name',
            title: 'new title',
            content: 'new content',
            excerpt: 'new excerpt',
            categories: ['3', '4'],
            tags: 't3,t4'
          }
        }));
      });
      it('shows a spinner while ajax', function() {
        $('#content-template-update').click();
        $('#content-template-update-update').click();
        testSpinnerWhileAjax(200);
        $('#content-template-update').click();
        $('#content-template-update-update').click();
        return testSpinnerWhileAjax(500);
      });
      it('hides links and disables buttons while ajax', function() {
        $('#content-template-update').click();
        $('#content-template-update-update').click();
        testLinksButtonsWhileAjax(200);
        $('#content-template-update').click();
        $('#content-template-update-update').click();
        return testLinksButtonsWhileAjax(500);
      });
      it('updates the template data when ajax is done', function() {
        $('#content-template-update').click();
        $('#content-template-update-update').click();
        mostRecentAjaxRequest().response({
          status: 200
        });
        return expect(contentTemplate.data).toEqual({
          'template name': {
            title: 'new title',
            content: 'new content',
            excerpt: 'new excerpt',
            categories: ['3', '4'],
            tags: 't3,t4'
          }
        });
      });
      it('not updates the template data if ajax is fail', function() {
        $('#content-template-update').click();
        $('#content-template-update-update').click();
        mostRecentAjaxRequest().response({
          status: 500
        });
        return expect(contentTemplate.data).toEqual({
          'template name': {
            title: 'the title',
            content: 'the content',
            excerpt: 'the excerpt',
            categories: ['1', '2'],
            tags: 't1,t2'
          }
        });
      });
      return it('pre_wpautop "content" when in TinyMCE mode', function() {
        spyOn(tinyMCE, 'get').andReturn({
          getContent: function() {
            return '<p>tinymce content</p>';
          }
        });
        fakeSwitchToTinyMCE();
        $('#content-template-update').click();
        $('#content-template-update-update').click();
        mostRecentAjaxRequest().response({
          status: 200
        });
        return expect(contentTemplate.data).toEqual({
          'template name': {
            title: jasmine.any(String),
            content: 'tinymce content',
            excerpt: jasmine.any(String),
            categories: jasmine.any(Array),
            tags: jasmine.any(String)
          }
        });
      });
    });
    return describe('when click the delete button', function() {
      beforeEach(function() {
        var data;
        data = contentTemplate.data = {
          'template name': {
            title: 'the title',
            content: 'the content',
            excerpt: 'the excerpt',
            categories: ['1', '2'],
            tags: 't1,t2'
          }
        };
        contentTemplate.restore(data);
        return $('#content-template-list').val('template name');
      });
      it('shows a confirmation message', function() {
        $('#content-template-delete').click();
        expect($('#content-template-delete-dialog').html()).toEqual(l10n.deleteConfirm);
        expect($.fn.dialog).toHaveBeenCalledWith('open');
        $('#content-template-delete-cancel').click();
        expect($('#content-template-list option')).toExist();
        $('#content-template-delete').click();
        $('#content-template-delete-delete').click();
        return expect($('#content-template-update-dialog').dialog('isOpen')).toBeFalsy();
      });
      it('sends a ajax', function() {
        $('#content-template-delete').click();
        $('#content-template-delete-delete').click();
        return expect($.ajax).toHaveBeenCalledWith($.extend(true, {}, ajaxExpection, {
          data: {
            state: 'delete',
            name: 'template name'
          }
        }));
      });
      it('shows a spinner while ajax', function() {
        $('#content-template-delete').click();
        $('#content-template-delete-delete').click();
        testSpinnerWhileAjax(200);
        $('#content-template-delete').click();
        $('#content-template-delete-delete').click();
        return testSpinnerWhileAjax(500);
      });
      it('hides links and disables buttons while ajax', function() {
        $('#content-template-delete').click();
        $('#content-template-delete-delete').click();
        testLinksButtonsWhileAjax(200);
        $('#content-template-delete').click();
        $('#content-template-delete-delete').click();
        return testLinksButtonsWhileAjax(500);
      });
      describe('when ajax is done', function() {
        beforeEach(function() {
          $('#content-template-delete').click();
          $('#content-template-delete-delete').click();
          return mostRecentAjaxRequest().response({
            status: 200
          });
        });
        it('deletes the template', function() {
          expect($('#content-template-list option')).not.toExist();
          expect(contentTemplate.data['template name']).toBeUndefined();
          contentTemplate.restore({
            "'": {}
          });
          $('#content-template-list').val("'");
          $('#content-template-delete').click();
          $('#content-template-delete-delete').click();
          mostRecentAjaxRequest().response({
            status: 200
          });
          expect($('#content-template-list option')).not.toExist();
          expect(contentTemplate.data["'"]).toBeUndefined();
          contentTemplate.restore({
            '"': {}
          });
          $('#content-template-list').val('"');
          $('#content-template-delete').click();
          $('#content-template-delete-delete').click();
          mostRecentAjaxRequest().response({
            status: 200
          });
          expect($('#content-template-list option')).not.toExist();
          return expect(contentTemplate.data['"']).toBeUndefined();
        });
        return it('hides the insert/override/delete part of the form if no more templates', function() {
          return expect($('#content-template-section-non-add')).toBeHidden();
        });
      });
      return it('not deletes the template if ajax is fail', function() {
        $('#content-template-delete').click();
        $('#content-template-delete-delete').click();
        mostRecentAjaxRequest().response({
          status: 500
        });
        expect($('#content-template-list option')).toExist();
        return expect(contentTemplate.data['template name']).toBeDefined();
      });
    });
  });

  testSpinnerWhileAjax = function(status) {
    expect($('#content-template-spinner').css('display')).toEqual('inline');
    mostRecentAjaxRequest().response({
      status: status
    });
    return expect($('#content-template-spinner').css('display')).toEqual('none');
  };

  testLinksButtonsWhileAjax = function(status) {
    expect($('a.content-template-action').css('visibility')).toEqual('hidden');
    expect($('input.content-template-action').prop('disabled')).toEqual(true);
    mostRecentAjaxRequest().response({
      status: status
    });
    expect($('a.content-template-action').css('visibility')).toEqual('visible');
    return expect($('input.content-template-action').prop('disabled')).toEqual(false);
  };

}).call(this);
