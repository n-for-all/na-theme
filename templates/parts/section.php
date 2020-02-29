<?php $fullLayout = $naTheme->get_template_layout($post->ID, 'container') == '' ?>
<section data-index="<?php echo $i; ?>" id="section-<?php echo $naTheme->get_section_id($post->ID, $post->post_name); ?>" class="<?php echo $_class; ?>" style="<?php echo $background && $fullLayout ? 'background-image:url(' . $background . ');' : '' ?>">
    <div class="<?php is_home() ? 'full-height': '' ?> <?php echo $naTheme->get_template_layout($post->ID, 'container'); ?>">
        <div class="row">
            <div class="col-12">
                <?php get_template_part('template-parts/' . $naTheme->get_template_part($post->ID, 'content-page-notitle'));
                ?>
            </div>
        </div>
    </div>
</section>