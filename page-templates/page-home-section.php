<?php
/**
 * Template Name: Home Page - Sections
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other "pages" on your WordPress site will use a different template.
 *
 * @package WordPress
 */

get_header(); ?>
    <div id="primary" class="content-area ">
        <main id="main" class="site-main" role="main">
            <div class="main-inner">
        <?php
		// Start the loop.
		while ( have_posts() ) : the_post();
			// Include the page content template.
			$args = array(
				'post_parent' => get_the_ID(),
				'post_type'   => 'page',
				'posts_per_page' => -1,
				'post_status' => 'publish',
				'orderby'			=> 'menu_order',
				'order'	=> 'ASC'
			);
			$_children = get_posts( $args );
			$i = 0;
			global $_class, $theme;
			foreach($_children as $post){
				//print_r($post);
				setup_postdata($post);
				$_class = 'section ';
				$_class .= $i % 2 == 0 ? 'even' : 'odd';
				$_class .= " section-scroll section-".$post->post_type;
				$_class .= " ".$theme->get_template_part($post->ID, 'content-page-notitle');
				$_class .= " subsection";

                $background = $theme->get_post_thumbnail($post, 'full');
                if($background){
                    $_class .= " has-post-thumbnail";
                }
                ?>
                <?php if($theme->homepage_scrolling != ""): //scrollmagic manual
                    if($i == 1):
                    ?>
                    <div id="scroll-container" class="scrolling-container--<?php echo $theme->homepage_scrolling; ?>">
                    <div id="inner-scroll" class="scrolling-style-<?php echo $theme->homepage_scrolling; ?>">
                    <?php endif; ?>
                <?php endif; ?>
                <section id="section-<?php echo $post->post_name; ?>" class="<?php echo $_class; ?>" style="<?php echo $background ? 'background-image:url('.$background.');': '' ?>">
                    <div class="<?php echo $theme->get_template_layout($post->ID, 'container'); ?>">
                        <?php get_template_part( 'template-parts/'.$theme->get_template_part($post->ID, 'content-page-notitle'));
                        if($i == 0 && $theme->show_scroll_icon == 1){
                            ?>
                            <span class="mouse"><span class="scroll" title=""></span></span>
                            <?php
                        }
                        ?>
                    </div>
                </section>
                <?php if($theme->homepage_scrolling != ""): //scrollmagic manual
                    if($i == sizeof($_children)-1 && $i > 1):
                        if($theme->homepage_scrolling == 4):
                    ?>
                        <section class="section-placeholder"></section>
                        <?php endif; ?>
                    </div>
                    </div>
                    <?php endif; ?>
                <?php endif; ?>
            <?php
                $i ++;
			}
			wp_reset_postdata();
			//get_template_part( 'content', 'home' );

			// If comments are open or we have at least one comment, load up the comment template.
			if ( comments_open() || get_comments_number() ) :
				comments_template();
			endif;
		// End the loop.
			break;
		endwhile;
		?>
    </div>
        </main>
        <!-- .site-main -->
    </div>
    <!-- .content-area -->
<?php get_footer(); ?>
