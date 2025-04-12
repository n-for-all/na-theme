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

                    <div class="container">
                        <div class="row">
                            <div class="col-md-12 col-lg-6 d-flex align-items-end">
                                <?php if ($featured_image) : ?>
                                    <img class="featured" src="<?php echo $featured_image; ?>" />
                                <?php endif; ?>
                            </div>
                            <div class="col-md-12 col-lg-6">
                                <?php the_title('<h1 class="entry-title">', '</h1>'); ?>
                                <?php if ($post->position != '') : ?>
                                    <h4 class="entry-position"><?php echo $post->position; ?></h4>
                                <?php endif; ?>
                                <ul class="meta">
                                    <?php if ($post->languages != '') : ?><li class="meta-item languages"><label><?php _e('Languages Spoken:', 'na-theme'); ?></label><?php echo $post->languages; ?></li><?php endif; ?>
                                </ul>
                                <a class="btn btn-default" href="#!section/book-an-appointment"><?php _e('Book an appointment', 'na-theme'); ?></a>
                            </div>
                        </div>
                    </div>
                </header>
                <div class="sections-list alternating doctor-sections">
                    <section class="<?php $naTheme->classes('content', 'entry-content'); ?> section-doctor-description">
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
                                            <?php foreach ($post->services as $item) : ?>
                                                <li>
                                                    <label><?php echo $item['title']; ?></label><?php echo $item['description']; ?>
                                                </li>
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
                                        <h3 class="section-title"><?php _e('Training & Work Experience', 'na-theme'); ?></h3>
                                        <div class="timeline">
                                            <ul>
                                                <?php foreach ($post->experience as $item) : ?>
                                                    <li>
                                                        <div class="content">
                                                            <div class="description">
                                                                <h3><?php echo $item['title']; ?></h3><?php echo $item['description']; ?>
                                                            </div>
                                                        </div>
                                                    </li>
                                                <?php endforeach; ?>
                                            </ul>
                                        </div>
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
                                        <div class="timeline">
                                            <ul>
                                                <?php foreach ($post->education as $item) : ?>
                                                    <li>
                                                        <div class="content">
                                                            <div class="description">
                                                                <h3><?php echo $item['title']; ?></h3><?php echo $item['description']; ?>
                                                            </div>
                                                        </div>
                                                    </li>
                                                <?php endforeach; ?>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    <?php endif; ?>
                    <?php
                    $department = $post->department ? get_post($post->department) : null;
                    if ($department) :
                        $output = do_shortcode(sprintf('[doctors department="%s" exclude="%s" limit="%s"]', $department->ID, get_the_ID(), 3));
                        if ($output) :
                    ?>
                            <section class="section-related">
                                <div class="container">
                                    <div class="row">
                                        <div class="col-md-12 col-lg-8">
                                            <h3 class="section-title"><?php _e('Doctors from the same specialty', 'na-theme'); ?></h3>
                                        </div>
                                        <div class="col-md-12 col-lg-4 align-right">
                                            <a href="<?php echo get_permalink($department); ?>" class="btn btn-default"><?php _e(sprintf('View all "%s" doctors', $department->post_title)); ?></a>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <?php echo $output; ?>
                                        </div>
                                    </div>
                                </div>
                            </section>
                    <?php
                        endif;
                    endif;
                    ?>
                    <?php echo do_action('after_single_doctor', $post); ?>
                </div>
            </div><!-- #post-## -->
        <?php
        endwhile;
        ?>
    </main><!-- .site-main -->
</div><!-- .content-area -->

<?php get_footer(); ?>