<?php

/**
 * The template for displaying pages
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other "pages" on your WordPress site will use a different template.
 *
 * @package WordPress
 */
global $naTheme, $post;


$cursiveList = function ($items) {
?>
    <ul class="tag-list">
        <?php foreach ($items as $item) : ?>
            <?php if (is_array($item)) : ?>
                <li class="with-children">
                    <?php foreach ($item as $key => $value) : ?>
                        <ul>
                            <li><label><?php echo $key ?></label></li>
                            <li>
                                <ul>
                                    <?php foreach ($value as $label) : ?>
                                        <li class="tag"><?php echo $label; ?></li>
                                    <?php endforeach ?>
                                </ul>
                            </li>
                        </ul>
                    <?php endforeach ?>
                </li>
            <?php else : ?>
                <li class="tag"><label><?php echo $item ?></label></li>
            <?php endif ?>
        <?php endforeach ?>
    </ul>
<?php
};

get_header(); ?>

<div id="primary" class="content-area">
    <main id="main" class="site-main" role="main">

        <?php
        // Start the loop.
        while (have_posts()) : the_post();
        ?>
            <?php
            /**
             * The template used for displaying page content
             *
             * @package WordPress
             * @subpackage Twenty_Sixteen
             * @since Twenty Sixteen 1.0
             */

            /**
             * Featured Image
             */
            $featured_image = $naTheme->get_post_thumbnail(null, 'full');
            ?>

            <div id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <header class="<?php $naTheme->classes('header', 'entry-header'); ?>">
                    <?php
                    if ($featured_image) :
                    ?>
                        <figure class="entry-image" style="background-image:url(<?php echo $featured_image; ?>)">
                            <img src="<?php echo $featured_image; ?>" />
                        </figure>
                    <?php endif; ?>
                    <div class="container">
                        <div class="row">
                            <div class="col-md-12"><?php the_title('<h1 class="entry-title">', '</h1>'); ?></div>
                        </div>
                    </div>
                </header><!-- .entry-header -->
                <div class="sections-list alternating doctor-sections">
                    <section class="<?php $naTheme->classes('content', 'entry-content'); ?>">
                        <div class="container">
                            <div class="row">
                                <div class="col-md-12">
                                    <?php the_content(); ?>
                                </div>
                            </div>
                        </div>
                    </section>
                    <?php if (!empty($post->services)) : ?>
                        <section class="section-services">
                            <div class="container">
                                <div class="row">
                                    <div class="col-md-12">
                                        <h3 class="section-title"><?php _e('Doctor can help with', 'na-theme'); ?></h3>
                                        <ul>
                                        <?php foreach($post->services as $item): ?>
                                            <li><h4><?php echo $item['title']; ?></h4><?php echo $item['description']; ?></li>
                                        <?php endforeach; ?>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                    <?php endif; ?>
                    <?php if (!empty($post->education)) : ?>
                        <section class="section-education">
                            <div class="container">
                                <div class="row">
                                    <div class="col-md-12">
                                        <h3 class="section-title"><?php _e('Education', 'na-theme'); ?></h3>
                                        <ul>
                                        <?php foreach($post->education as $item): ?>
                                            <li><h4><?php echo $item['title']; ?></h4><?php echo $item['description']; ?></li>
                                        <?php endforeach; ?>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                    <?php endif; ?>
                    <?php if (!empty($post->experience)) : ?>
                        <section class="section-experience">
                            <div class="container">
                                <div class="row">
                                    <div class="col-md-12">
                                        <h3 class="section-title"><?php _e('Experience', 'na-theme'); ?></h3>
                                        <ul>
                                        <?php foreach($post->experience as $item): ?>
                                            <li><h4><?php echo $item['title']; ?></h4><?php echo $item['description']; ?></li>
                                        <?php endforeach; ?>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                    <?php endif; ?>
                    <section class="section-related">
                        <div class="container">
                            <div class="row">
                                <div class="col-md-12">
                                    <h2 class="section-title"><?php _e('Other Departments', 'na-theme'); ?></h2>
                                    <?php echo do_shortcode('[departments limit="3"]'); ?>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div><!-- #post-## -->
        <?php
        endwhile;
        ?>
    </main><!-- .site-main -->
</div><!-- .content-area -->

<?php get_footer(); ?>