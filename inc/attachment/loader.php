<?php

/**
 * Customizer additions.
 *
 */
function _attachment_type($form_fields, $post)
{
    $type = get_post_meta($post->ID, "attachment_type", true);
    $form_fields['attachment_type'] = array(
        'label' => 'Visibility',
        'input' => 'html',
        'html' => "<select name='attachments[" . $post->ID . "][attachment_type]'><option " . selected($type, 'public', false) . ' value="public">Public</option><option ' . selected($type, 'private', false) . ' value="private">Private</option></select>',
        'helps' => 'Private: can be accessed if only user is logged in.',
    );
    return $form_fields;
}

add_filter('attachment_fields_to_edit', '_attachment_type', 11, 2);

function _attachment_type_save($post, $attachment)
{
    if (isset($attachment['attachment_type']))
        update_post_meta($post['ID'], 'attachment_type', $attachment['attachment_type']);
    return $post;
}

add_filter('attachment_fields_to_save', '_attachment_type_save', 10, 2);
