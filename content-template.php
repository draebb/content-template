<?php
/*
Plugin Name: Content Template
Plugin URI: https://github.com/draebb/content-template
Description: Define templates for repeated contents.
Version: 0.1.2
License: GPLv2 or later
*/


define( 'CONTENT_TEMPLATE_VERSION', '0.1' );
define( 'CONTENT_TEMPLATE_DB_VERSION', 1 );
define( 'CONTENT_TEMPLATE_NONCE', 'content-template' );


add_action( 'init', 'content_template_load_textdomain' );
function content_template_load_textdomain() {
	$plugin_dir = basename( dirname( __FILE__ ) );
	load_plugin_textdomain(
		'content-template', false, $plugin_dir . '/languages'
	);
}


add_action( 'load-post-new.php', 'content_template_hook_post_new' );
function content_template_hook_post_new() {
	add_action( 'admin_enqueue_scripts', 'content_template_enqueue_scripts' );
	add_action( 'add_meta_boxes', 'content_template_add_meta_boxes' );
}


function content_template_enqueue_scripts( $hook ) {
	wp_enqueue_style( 'wp-jquery-ui-dialog' );

	wp_enqueue_style(
		'content-template',
		plugins_url( 'style.css', __FILE__ ),
		false,
		CONTENT_TEMPLATE_VERSION
	);

	wp_enqueue_script(
		'content-template',
		plugins_url( 'js/script.js', __FILE__ ),
		array( 'jquery-ui-dialog' ),
		CONTENT_TEMPLATE_VERSION
	);

	wp_localize_script(
		'content-template', 'contentTemplate', array(
			'spinnerUrl' =>
				esc_url( admin_url( 'images/wpspin_light.gif' ) ),
			'data' =>
				get_option( 'content_template_data' ),
			'nonce' =>
				wp_create_nonce( CONTENT_TEMPLATE_NONCE ),
			'l10n' => array(
				'name' =>
					__( 'Template Name', 'content-template' ),
				'add' =>
					__( 'Add New Template', 'content-template' ),
				'select' =>
					__( 'Select a Template', 'content-template' ),
				'insert' =>
					__( 'Insert', 'content-template' ),
				'update' =>
					__( 'Update', 'content-template' ),
				'updateConfirm' =>
					__( 'Update Template?', 'content-template' ),
				'delete' =>
					__( 'Delete', 'content-template' ),
				'deleteConfirm' =>
					__( 'Delete Template?', 'content-template' ),
				'cancel' =>
					__( 'Cancel', 'content-template' ),
				'nameRequired' =>
					__( 'Template name is required.', 'content-template' ),
				'nameDuplicated' =>
					__( 'Template name is duplicated.', 'content-template' ),
			)
		)
	);
}


add_action( 'wp_ajax_content_template', 'content_template_do_ajax' );
function content_template_do_ajax() {
	check_ajax_referer( CONTENT_TEMPLATE_NONCE, 'nonce' );

	$state = $_POST['state'];
	$name = stripslashes( $_POST['name'] );

	$data = get_option( 'content_template_data' );

	if ( in_array( $state, array( 'add', 'update' ) ) ) {
		$data[$name]['title'] = stripslashes( $_POST['title'] );
		$data[$name]['content'] = stripslashes( $_POST['content'] );
		$data[$name]['excerpt'] = stripslashes( $_POST['excerpt'] );
		$data[$name]['categories'] =
			isset( $_POST['categories'] ) ? $_POST['categories'] : array();
		$data[$name]['tags'] = stripslashes( $_POST['tags'] );
	} elseif ( $state === 'delete' ) {
		unset( $data[$name] );
	}

	update_option( 'content_template_data', $data );
	die();
}


function content_template_add_meta_boxes() {
	add_meta_box(
		'content-template',
		__( 'Content Template', 'content-template' ),
		'content_template_render_meta_box',
		'post',
		'side',
		'high'
	);
}


function content_template_render_meta_box() {
?>
	<noscript>
		<?php echo __( 'JavaScript is required to use Content Template ', 'content-template' ) ?>
	</noscript>
	<div id="content-template-content"></div>
<?php
}


register_activation_hook( __FILE__, 'content_template_activation' );
function content_template_activation() {
	add_option( 'content_template_db_version', CONTENT_TEMPLATE_DB_VERSION );
	add_option( 'content_template_data', '', '', 'no' );
}


register_uninstall_hook( __FILE__, 'content_template_uninstall' );
function content_template_uninstall() {
	delete_option( 'content_template_db_version' );
	delete_option( 'content_template_data' );
}
