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
                <header class="<?php $naTheme->classes('header', 'entry-header'); ?> d-flex align-items-center">
                    <?php
                    if ($featured_image) :
                    ?>
                        <figure class="entry-image" style="background-image:url(<?php echo $featured_image; ?>)">
                            <img src="<?php echo $featured_image; ?>" />
                        </figure>
                    <?php endif; ?>
                    <div class="container">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="d-flex entry-title align-items-center relative">
                                    <?php if (!empty($post->icon)) : ?>
                                        <img class="icon me-3" src="<?php echo $post->icon[0]; ?>" />
                                        <?php the_title('<h1>', '</h1>'); ?>
                                    <?php endif ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </header><!-- .entry-header -->
                <div class="sections-list alternating department-sections">
                    <section class="<?php $naTheme->classes('content', 'entry-content'); ?>">
                        <div class="container">
                            <div class="row">
                                <div class="col-md-12">
                                    <?php the_content(); ?>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="section-related">
                        <div class="container">
                            <div class="row">
                                <div class="col-md-12">
                                    <h2 class="section-title"><?php _e('Departments', 'na-theme'); ?></h2>
                                    <?php echo do_shortcode(sprintf('[departments division="%s" limit="%s"]', get_the_ID(), -1)); ?>
                                </div>
                            </div>
                        </div>
                    </section>
                    <?php
                    $func = $post->departments;
                    $departments = array_map(function ($item) {
                        return $item->ID;
                    }, $func());

                    $doctors = do_shortcode(sprintf('[doctors department="%s" limit="%s"]', implode(',', $departments), -1));
                    if (!empty($doctors)) :
                    ?>
                        <section class="section-doctors">
                            <div class="container">
                                <div class="row">
                                    <div class="col-md-12">
                                        <h2 class="section-title"><?php _e('Doctors', 'na-theme'); ?></h2>
                                        <?php echo $doctors; ?>
                                    </div>
                                </div>
                            </div>
                        </section>
                    <?php endif; ?>
                </div>
            </div><!-- #post-## -->
        <?php
        endwhile;
        ?>
    </main><!-- .site-main -->
</div><!-- .content-area -->

<?php get_footer(); ?>