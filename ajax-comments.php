<?php
/**
 * Plugin Name: Test Ajax Comments
 * Description: Тестовое задание
 */

add_action('wp_enqueue_scripts', 'test_ajax_comments_scripts');

function test_ajax_comments_scripts()
{
    wp_enqueue_script('test_ajax_comments', plugin_dir_url(__FILE__) . '/js/ajax-comments.js', ['jquery']);

    wp_localize_script('test_ajax_comments', 'test_ajax_comment_params', array(
        'ajaxurl' => site_url() . '/wp-admin/admin-ajax.php'
    ));
}

add_action('wp_ajax_testajaxcomments', 'test_submit_ajax_comment');
add_action('wp_ajax_nopriv_testajaxcomments', 'test_submit_ajax_comment');

function test_submit_ajax_comment()
{
    $comment = wp_handle_comment_submission(wp_unslash($_POST));
    if (is_wp_error($comment)) {
        $error_data = intval($comment->get_error_data());
        if (!empty($error_data)) {
            wp_die('<p>' . $comment->get_error_message() . '</p>', __('Comment Submission Failure'), array('response' => $error_data, 'back_link' => true));
        } else {
            wp_die(__('Unknown error'));
        }
    }

    $user = wp_get_current_user();
    do_action('set_comment_cookies', $comment, $user);

    $comment_depth = 1;
    $comment_parent = $comment->comment_parent;
    while ($comment_parent) {
        $comment_depth++;
        $parent_comment = get_comment($comment_parent);
        $comment_parent = $parent_comment->comment_parent;
    }

    $GLOBALS['comment'] = $comment;
    $GLOBALS['comment_depth'] = $comment_depth;

    $comment_html = '';

    $defaults = array(
        'walker'            => null,
        'max_depth'         => '',
        'style'             => 'ul',
        'callback'          => null,
        'end-callback'      => null,
        'type'              => 'all',
        'page'              => '',
        'per_page'          => '',
        'avatar_size'       => 32,
        'reverse_top_level' => null,
        'reverse_children'  => '',
        'format'            => current_theme_supports( 'html5', 'comment-list' ) ? 'html5' : 'xhtml',
        'short_ping'        => false,
        'echo'              => true,
    );

    $walker = new Walker_Comment();
    $walker->start_el( $comment_html, $comment, -1, $defaults);
    $walker->end_el( $comment_html, $comment );

    echo $comment_html;

    die();
}