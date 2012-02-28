$ = jQuery
l10n = contentTemplate.l10n

ajax = (data, ajaxMeta) ->
  $('#content-template-spinner').show()
  $('a.content-template-action').css 'visibility', 'hidden'
  $('input.content-template-action').prop 'disabled', true

  args =
    type: 'POST'
    url: ajaxurl
    data:
      action: 'content_template'
      nonce: contentTemplate.nonce
  $.extend true, args.data, data, ajaxMeta
  return $.ajax(args).always ->
    $('#content-template-spinner').hide()
    $('.content-template-action').css 'visibility', 'visible'
    $('input.content-template-action').prop 'disabled', false


init = ->
  buildHtml()
  buildDialogs()
  buildSpinner()
  setupEvents()
  restore contentTemplate.data


buildHtml = ->
  $("""
    <p id="content-template-message"></p>

    <div id="content-template-section-non-add">
      <p>
        <label>
          <span class="screen-reader-text">#{ l10n.select }</span>
          <select id="content-template-list" name="content_template_list">
          </select>
        </label>
      </p>
      <p>
        <a id="content-template-update" class="content-template-action" tabindex="0">#{ l10n.update }</a>
        <a id="content-template-delete" class="content-template-action" tabindex="0">#{ l10n.delete }</a>
        <input id="content-template-insert" class="button content-template-action" type="button" value="#{ l10n.insert }" />
      </p>
    </div>

    <div id="content-template-section-add">
      <p>
        <label>
          <span class="screen-reader-text">#{ l10n.name }</span>
          <input id="content-template-name" type="text" name="content_template_name" />
        </label>
      </p>
      <p>
        <input id="content-template-add" class="button content-template-action" type="button" value="#{ l10n.add }" />
      </p>
    </div>
    """
  ).appendTo '#content-template-content'


buildSpinner = ->
  $('<img/>', id: 'content-template-spinner', src: contentTemplate.spinnerUrl)
    .appendTo('#content-template .hndle')
    .hide()


buildDialogs = ->
  commonDialogArgs =
    autoOpen: false
    dialogClass: 'wp-dialog'
    modal: true
    resizable: false

  $('<div/>', id: 'content-template-update-dialog')
    .dialog $.extend true, {}, commonDialogArgs,
      buttons: [
        id: 'content-template-update-update'
        text: l10n.update
        click: ->
          onUpdate()
          $(this).dialog 'close'
      ,
        id: 'content-template-update-cancel'
        text: l10n.cancel
        click: ->
          $(this).dialog 'close'
      ]

  $('<div/>', id: 'content-template-delete-dialog')
    .dialog $.extend true, {}, commonDialogArgs,
      buttons: [
        id: 'content-template-delete-delete'
        text: l10n['delete']
        click: ->
          onDelete()
          $(this).dialog 'close'
      ,
        id: 'content-template-delete-cancel'
        text: l10n.cancel
        click: ->
          $(this).dialog 'close'
      ]


setupEvents = ->
  $('#content-template-name').keydown (event) ->
    if event.which is 13 # the "Enter" key
      event.preventDefault()
      $('#content-template-add').click()
  $('#content-template-add').click onAdd
  $('#content-template-insert').click onInsert
  $('#content-template-update').click ->
    $('#content-template-update-dialog')
      .html(l10n.updateConfirm)
      .dialog('open')
  $('#content-template-delete').click ->
    $('#content-template-delete-dialog')
      .html(l10n.deleteConfirm)
      .dialog('open')


restore = (data) ->
  keys = (key for key of data).sort (a, b) ->
    a = a.toUpperCase()
    b = b.toUpperCase()
    if a > b
      1
    else if (a < b)
      -1
    else
      0

  for key in keys
    $('<option/>',
      text: key
      value: key
    ).appendTo '#content-template-list'

  if $('#content-template-list option').length
    $('#content-template-section-non-add').show()
  else
    $('#content-template-section-non-add').hide()


onAdd = ->
  templateName = $('#content-template-name').val()

  unless templateName
    $('#content-template-message').html l10n.nameRequired
    return
  else
    $('#content-template-message').html ''

  for nameInData of contentTemplate.data
    if nameInData is templateName
      $('#content-template-message').html l10n.nameDuplicated
      return

  data = {}
  data.title = $('#title').val()
  data.excerpt = $('#excerpt').val()
  data.tags = $('#tax-input-post_tag').val()
  if $('#wp-content-wrap').hasClass 'tmce-active'
    data.content = switchEditors.pre_wpautop tinyMCE.get('content').getContent()
  else
    data.content = $('#content').val()
  data.categories = for input in $ '#category-all input:checked'
    /in-category-(\d+)/.exec(input.id)[1]

  ajax(data, state: 'add', name: templateName)
    .done ->
      $options = $('#content-template-list option')
      $options.push(
        $('<option/>',
          text: templateName
          value: templateName
        )[0]
      )
      $options.sort (a, b) ->
        a = $(a).text().toUpperCase()
        b = $(b).text().toUpperCase()
        if a > b
          1
        else if (a < b)
          -1
        else
          0
      $('#content-template-list')
        .empty()
        .append($options)
        .val(templateName)

      $('#content-template-section-non-add').show()

      contentTemplate.data[templateName] = data


onInsert = ->
  templateName = $('#content-template-list').val()
  data = contentTemplate.data[templateName]

  $('#title-prompt-text').hide()

  $title = $('#title')
  $title.val $title.val() + data.title

  $excerpt = $('#excerpt')
  $excerpt.val $excerpt.val() + data.excerpt

  $content = $('#content')
  if $('#wp-content-wrap').hasClass 'tmce-active'
    tinyMCE.get('content').setContent(
      tinyMCE.get('content').getContent() +
      switchEditors.wpautop data.content
    )
  else
    $content.val $content.val() + data.content

  $('#category-all input:checked').each ->
    $(this).prop 'checked', false
  for category in data.categories
    $('#in-category-' + category).prop 'checked', true

  $('#tax-input-post_tag').val data.tags
  tagBox.flushTags null, null, false


onUpdate = ->
  templateName = $('#content-template-list').val()
  data = {}
  data.title = $('#title').val()
  data.excerpt = $('#excerpt').val()
  data.tags = $('#tax-input-post_tag').val()
  if $('#wp-content-wrap').hasClass('tmce-active')
    data.content = switchEditors.pre_wpautop tinyMCE.get('content').getContent()
  else
    data.content = $('#content').val()
  data.categories = for input in $ '#category-all input:checked'
    /in-category-(\d+)/.exec(input.id)[1]

  ajax(data, state: 'update', name: templateName)
    .done ->
      contentTemplate.data[templateName] = data


onDelete = ->
  templateName = $('#content-template-list').val()

  ajax({}, state: 'delete', name: templateName)
    .done ->
      delete contentTemplate.data[templateName]
      $('#content-template-list option').each ->
        $this = $ this
        if $this.text() is templateName
          $this.remove()
          return false
      unless $('#content-template-list option').length
        $('#content-template-section-non-add').hide()


$.extend true, contentTemplate,
  init: init
  restore: restore


$(document).ready contentTemplate.init
