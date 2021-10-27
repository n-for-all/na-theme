<?php $fullLayout = $naTheme->get_template_layout($post->ID, 'container') == '' ?>
<?php $layout = $naTheme->get_template_layout($post->ID, 'container');


$name = $post->post_name;
if (function_exists('pll_default_language')) {
    $npost = get_post(pll_get_post($post->ID, pll_default_language()));
    if ($npost) {
        $name = $npost->post_name;
    }
}

?>
<section data-index="<?php echo $i; ?>" id="section-<?php echo $naTheme->get_section_id($post->ID, $post->post_name); ?>" class="<?php echo $_class; ?>" style="<?php echo $background ? 'background-image:url(' . $background . ');' : '' ?>">
    <?php get_template_part('template-parts/' . $naTheme->get_template_part($post->ID, 'content-page-notitle')); ?>
</section>