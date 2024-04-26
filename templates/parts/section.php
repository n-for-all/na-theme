<?php
$name = $post->post_name;
if (function_exists('pll_default_language')) {
    $npost = get_post(pll_get_post($post->ID, pll_default_language()));
    if ($npost) {
        $name = $npost->post_name;
    }
}

?>
<section data-index="<?php echo $i; ?>" id="section-<?php echo $naTheme->get_section_id($post->ID, $post->post_name); ?>" class="<?php echo $_class; ?> relative" style="<?php echo $background ? 'background-image:url(' . $background . ');' : '' ?>">
    <?php edit_post_link('Edit Section', '', '', 0, 'absolute left-0 top-0'); ?>
    <?php get_template_part('template-parts/' . $naTheme->get_template_part($post->ID, 'content-section-notitle')); ?>
</section> 