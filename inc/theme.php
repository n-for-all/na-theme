<?php

/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 */
class Na_Theme {

	private $search = [];
	private $modules = [];

	public function __construct(){
		$this->actions();
		$this->filters();
	}

	protected function actions(){
		add_action( 'after_setup_theme', array($this, 'setup') );
		add_action( 'widgets_init', array(&$this, 'widgets_init') );
		add_action( 'wp_head', array(&$this, 'javascript_detection'), 0 );
		add_action( 'wp_head', array(&$this, 'head') );
		add_action( 'wp_enqueue_scripts', array(&$this, 'scripts') , 11);
		add_action( 'admin_enqueue_scripts', array(&$this, 'admin_scripts') );
		add_action( 'credits', array(&$this, 'credits') );
		add_action('woocommerce_before_shop_loop', array( &$this,'woocommerce_before_shop_loop'), 10);
		add_action('woocommerce_after_shop_loop', array( &$this,'woocommerce_after_shop_loop'), 10);
		if(is_admin()){
			add_action( 'dynamic_sidebar_before',  array(&$this, 'dynamic_sidebar_before'), 10, 2 );
			add_action( 'wp_ajax_na_save_sidebars', array(&$this, 'save_sidebars') );
            add_action( 'page_attributes_meta_box_template', array(&$this, 'page_attributes_meta_box_template'), 10,2 );
			add_action( 'save_post_page', array(&$this, 'save_page_template_part'), 10,3 );
		}
	}

	protected function filters(){
		add_filter( 'get_search_form', array(&$this, 'search_form_modify') );
		if(!is_admin()){
			add_filter( 'excerpt_more', array(&$this, 'excerpt_more') );
		}
		add_filter( 'body_class', array(&$this, 'body_class') );
		add_filter( 'get_the_excerpt', array(&$this, 'get_excerpt') );
		add_filter('pre_get_posts', array(&$this, 'search_filter'));
	}

	public function setup(){
			/*
		 * Make theme available for translation.
		 * Translations can be filed in the /languages/ directory.
		 * If you're building a theme based on na_theme, use a find and replace
		 * to change NA_THEME_TEXT_DOMAIN to the name of your theme in all the template files
		 */
		load_theme_textdomain( NA_THEME_TEXT_DOMAIN, get_template_directory() . '/languages' );

		// Add default posts and comments RSS feed links to head.
		add_theme_support( 'automatic-feed-links' );
		add_theme_support( 'woocommerce' );
		/*
		 * Let WordPress manage the document title.
		 * By adding theme support, we declare that this theme does not use a
		 * hard-coded <title> tag in the document head, and expect WordPress to
		 * provide it for us.
		 */
		add_theme_support( 'title-tag' );

		/*
		 * Enable support for Post Thumbnails on posts and pages.
		 *
		 * See: https://codex.wordpress.org/Function_Reference/add_theme_support#Post_Thumbnails
		 */
		add_theme_support( 'post-thumbnails' );
		set_post_thumbnail_size( 825, 510, true );

		// This theme uses wp_nav_menu() in three locations.
		register_nav_menus( array(
			'primary' => __( 'Primary Left Menu',      NA_THEME_TEXT_DOMAIN ),
			'primary-right'  => __( 'Primary Right Menu', NA_THEME_TEXT_DOMAIN ),
			'social'  => __( 'Social Links Menu', NA_THEME_TEXT_DOMAIN ),
			'footer'  => __( 'Footer Menu', NA_THEME_TEXT_DOMAIN ),
		) );

		/*
		 * Switch default core markup for search form, comment form, and comments
		 * to output valid HTML5.
		 */
		add_theme_support( 'html5', array(
			'search-form', 'comment-form', 'comment-list', 'gallery', 'caption'
		) );

		/*
		 * Enable support for Post Formats.
		 *
		 * See: https://codex.wordpress.org/Post_Formats
		 */
		add_theme_support( 'post-formats', array(
			'aside', 'image', 'video', 'quote', 'link', 'gallery', 'status', 'audio', 'chat'
		) );


		add_image_size( 'news', 300, 300, true );

		/*
		 * This theme styles the visual editor to resemble the theme style,
		 * specifically font, colors, icons, and column width.
		 */
	}
	/*
		Print the credits in the footer
	*/
	function credits(){
		?>
		<span class="copyright"><?php echo $this->copyright; ?></span>

		<?php
	}

	function body_class( $classes ) {
		if(is_singular()){
			// search the array for the class
			if(has_post_thumbnail()){
				$key = array_search('has-featured-image', $classes);
				if ( false === $key ) {
						$classes[] = 'has-featured-image' ;
				}
			}
			// return the $classes array
		}
		if(is_search()){
			$classes[] = "woocommerce";
		}
		if($this->navbar){
			$classes[] = "nav-".$this->navbar;
		}
		return $classes;
	}
	/**
	 * Register widget area.
	 *
	 * @link https://codex.wordpress.org/Function_Reference/register_sidebar
	 */
	function widgets_init() {
		register_sidebar( array(
			'name'          => __( 'Widget Area', NA_THEME_TEXT_DOMAIN ),
			'id'            => 'sidebar-1',
			'description'   => __( 'Add widgets here to appear in your sidebar.', NA_THEME_TEXT_DOMAIN ),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</aside>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		) );
		register_sidebar(array(
			'name'          => __('Shop Widget Area', NA_THEME_TEXT_DOMAIN),
			'id'            => 'shop',
			'description'   => __('Add widgets here to appear in your sidebar.', NA_THEME_TEXT_DOMAIN),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</div></aside>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2><div class="widget-inner">',
		));
		register_sidebar( array(
			'name'          => __( 'Service Widget Area', NA_THEME_TEXT_DOMAIN ),
			'id'            => 'sidebar-service',
			'description'   => __( 'Add widgets here to appear in your sidebar.', NA_THEME_TEXT_DOMAIN ),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</aside>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		) );
		register_sidebar( array(
			'name'          => __( 'Blog Widget Area', NA_THEME_TEXT_DOMAIN ),
			'id'            => 'blog-sidebar',
			'description'   => __( 'Add widgets here to appear in your sidebar.', NA_THEME_TEXT_DOMAIN ),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</aside>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		) );
		register_sidebar( array(
			'name'          => __( 'Top Header Widget Area', NA_THEME_TEXT_DOMAIN ),
			'id'            => 'header-sidebar-top',
			'description'   => __( 'Add widgets here to appear in your top header sidebar.', NA_THEME_TEXT_DOMAIN ),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</aside>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		) );

		register_sidebar( array(
			'name'          => __( 'Footer Widget Area 1', NA_THEME_TEXT_DOMAIN ),
			'id'            => 'footer-1',
			'description'   => __( 'Add widgets here to appear in your top header sidebar.', NA_THEME_TEXT_DOMAIN ),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</aside>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		) );
		register_sidebar( array(
			'name'          => __( 'Footer Widget Area 2', NA_THEME_TEXT_DOMAIN ),
			'id'            => 'footer-2',
			'description'   => __( 'Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN ),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</aside>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		) );

		register_sidebar( array(
			'name'          => __( 'Footer Widget Area 3', NA_THEME_TEXT_DOMAIN ),
			'id'            => 'footer-3',
			'description'   => __( 'Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN ),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</aside>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		) );
		register_sidebar( array(
			'name'          => __( 'Footer Widget Area 4', NA_THEME_TEXT_DOMAIN ),
			'id'            => 'footer-4',
			'description'   => __( 'Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN ),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</aside>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		) );
		register_sidebar( array(
			'name'          => __( 'Footer Widget Area 5', NA_THEME_TEXT_DOMAIN ),
			'id'            => 'footer-5',
			'description'   => __( 'Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN ),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</aside>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		) );
		register_sidebar( array(
			'name'          => __( 'Footer Widget Area 6', NA_THEME_TEXT_DOMAIN ),
			'id'            => 'footer-6',
			'description'   => __( 'Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN ),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</aside>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		) );
		register_sidebar( array(
			'name'          => __( 'Footer Widget Area 7', NA_THEME_TEXT_DOMAIN ),
			'id'            => 'footer-7',
			'description'   => __( 'Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN ),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</aside>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		) );
		register_sidebar( array(
			'name'          => __( 'Footer Widget Area 8', NA_THEME_TEXT_DOMAIN ),
			'id'            => 'footer-8',
			'description'   => __( 'Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN ),
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</aside>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		) );
	}
	/**
	 * Register Google fonts
	 *
	 * @return string Google fonts URL for the theme.
	 */
	function fonts_url() {
		$fonts_url = '';
		$font     = get_theme_mod('font', "");
		$font_variants     = (array)get_theme_mod('variant', array());
		$header_font     = get_theme_mod('header-font', "");
		$header_variants     = (array)get_theme_mod('header-variant', array());

		//$font_variants = (array)get_theme_mod('font_variants', array());
		wp_enqueue_style(
        'custom-fonts',
        get_template_directory_uri() . '/assets/css/fonts.css'
    );
		$fonts = array();
		if(trim($font) != ""){
			$fonts = array_merge($fonts, (array)($font.":".implode(",", $font_variants)));
			$custom_css = "
			html, body, div, p, a, *{
				font-family: {$font}, Arial, tahoma, sans-serif;
			}";
      wp_add_inline_style( 'custom-fonts', $custom_css );
		}
		if(trim($header_font) != ""){
			$fonts = array_merge($fonts, (array)($header_font.":".implode(",", $header_variants)));
			$custom_css = "
			h1, h2, h3, h4, h5, h6, .entry-title{
				font-family: {$header_font}, Arial, tahoma, sans-serif;
			}";
      wp_add_inline_style( 'custom-fonts', $custom_css );
		}
		if ( $fonts ) {
			$fonts_url = add_query_arg( array(
				'family' => urlencode( implode( '|', $fonts ) )
			), 'https://fonts.googleapis.com/css' );
		}

		return $fonts_url;
	}
	/**
	 * JavaScript Detection.
	 *
	 * Adds a `js` class to the root `<html>` element when JavaScript is detected.
	 */
	function javascript_detection() {
		echo "<script>(function(html){html.className = html.className.replace(/\bno-js\b/,'js')})(document.documentElement);</script>\n";
	}

	function head(){
		if($this->browser_color){
			?>
<meta name="theme-color" content="<?php echo $this->browser_color; ?>">
<meta name="msapplication-navbutton-color" content="<?php echo $this->browser_color; ?>">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="<?php echo $this->browser_color; ?>">
	<?php
		}
	}
	/**
	 * Enqueue scripts and styles.
	 */
	public function scripts() {


		//bootstrap styles for this theme
		wp_enqueue_style( 'grid', get_template_directory_uri() . '/assets/css/bootstrap.min.css', array(), '1.0' );

		// Add custom fonts, used in the main stylesheet
		$fonts = $this->fonts_url();
		wp_enqueue_style( 'na_fonts', $fonts, array(), null );

		//main styles for this theme
		wp_enqueue_style( 'main', get_template_directory_uri() . '/assets/css/style.css', array(), '1.0' );
		wp_enqueue_style( 'main-edge', get_template_directory_uri() . '/assets/css/edge.css', array(), '1.0' );

		// font awesome icons
		wp_enqueue_style( 'font-awesome', get_template_directory_uri() . '/assets/css/font-awesome.min.css', array(), '3.2' );

		// Load our main stylesheet.
		wp_enqueue_style( 'na_theme-style', get_stylesheet_uri() );

		// Load the Internet Explorer specific stylesheet.
		wp_enqueue_style( 'na_theme-ie', get_template_directory_uri() . '/assets/css/ie.css', array( 'na_theme-style' ), '20141010' );
		wp_style_add_data( 'na_theme-ie', 'conditional', 'lt IE 9' );


		wp_enqueue_style( 'na_theme-ie7', get_template_directory_uri() . '/assets/css/ie7.css', array( 'na_theme-style' ), '20141010' );
		wp_style_add_data( 'na_theme-ie7', 'conditional', 'lt IE 8' );

		//custom styles for this theme
		if($this->menu){
			wp_enqueue_style( 'na_menu', get_template_directory_uri() . '/assets/css/menu/'.$this->menu, array(), '1.0' );
		}else{
			wp_enqueue_style( 'na_menu', get_template_directory_uri() . '/assets/css/menu/default.css', array(), '1.0' );
		}
		if ( class_exists( 'woocommerce' ) ){
			wp_enqueue_style( 'na_woocommerce', get_template_directory_uri() . '/assets/css/woocommerce.css', array('woocommerce-general'), '1.0' );
		}
		if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
			wp_enqueue_script( 'comment-reply' );
		}

		if ( is_singular() && wp_attachment_is_image() ) {
			wp_enqueue_script( 'na_theme-keyboard-image-navigation', get_template_directory_uri() . '/assets/js/keyboard-image-navigation.js', array( 'jquery' ), '20141010' );
		}
		//main scripts
		wp_enqueue_script( 'jquery' );
		wp_enqueue_script( 'jquery-hashchange', get_template_directory_uri() . '/assets/js/plugins/jquery.hashchange.js', array('jquery' ), '1.0.0', true );


		wp_enqueue_script( 'bootstrap', get_template_directory_uri() . '/assets/js/bootstrap.min.js', array( 'jquery' ), '1.0.0', true );



		wp_enqueue_script( 'na_theme-custom', get_template_directory_uri() . '/assets/js/custom.js', array( 'jquery' ), '1.0.0', true );
		wp_enqueue_script( 'na_theme-script', get_template_directory_uri() . '/assets/js/functions.js', array( 'jquery' ), '1.0.0', true );
		wp_enqueue_script( 'na_theme-scripts', get_template_directory_uri() . '/assets/js/scripts.js', array( 'jquery' ), '1.0.0', true );
		wp_add_inline_script('na_theme-script', 'var options = {};options.ajax = "'.admin_url('admin-ajax.php').'"');
		wp_enqueue_script( 'na_theme-waypoints', get_template_directory_uri() . '/assets/js/plugins/jquery.waypoints.min.js', array( 'jquery' ), '1.0.0', true );

		if($this->homepage_scrolling != ""){
			wp_add_inline_script('na_theme-scripts', 'options["scrolling"] = "'.$this->homepage_scrolling.'";');
			wp_enqueue_script( 'na_theme-tweenmax', get_template_directory_uri() . '/assets/js/plugins/scrollmagic/TweenMax.min.js', array( 'jquery' ), '1.0.0', true );
			wp_enqueue_script( 'na_theme-scrollmagic', get_template_directory_uri() . '/assets/js/plugins/scrollmagic/ScrollMagic.js', array( 'jquery' ), '1.0.0', true );
			wp_enqueue_script( 'na_theme-gsap-animation', get_template_directory_uri() . '/assets/js/plugins/scrollmagic/animation.gsap.js', array( 'jquery' ), '1.0.0', true );
			wp_enqueue_script( 'na_theme-gsap-scrollto-plugin', get_template_directory_uri() . '/assets/js/plugins/scrollmagic/ScrollToPlugin.min.js', array( 'jquery' ), '1.0.0', true );
		}
		wp_localize_script( 'na_theme-script', 'screenReaderText', array(
			'expand'   => '<span class="screen-reader-text">' . __( 'expand child menu', NA_THEME_TEXT_DOMAIN ) . '</span>',
			'collapse' => '<span class="screen-reader-text">' . __( 'collapse child menu', NA_THEME_TEXT_DOMAIN ) . '</span>',
		) );
	}
	public function admin_scripts() {

		//admin styles for this theme
		wp_enqueue_style( 'na_theme-admin', get_template_directory_uri() . '/admin/css/admin.css', array(), '1.0' );
		wp_enqueue_script( 'na_theme-admin-scripts', get_template_directory_uri() . '/admin/js/admin.js', array( 'jquery' ), '1.0.0', true );
	}
	/**
	 * Add a `screen-reader-text` class to the search form's submit button.
	 *
	 * @param string $html Search form HTML.
	 * @return string Modified search form HTML.
	 */
	function search_form_modify( $html ) {
		return str_replace( 'class="search-submit"', 'class="search-submit screen-reader-text"', $html );
	}
	/**
	 * Replaces "[...]" (appended to automatically generated excerpts) with ... and a 'Continue reading' link.
	 *
	 * @since Twenty Fifteen 1.0
	 *
	 * @return string 'Continue reading' link prepended with an ellipsis.
	 */
	function excerpt_more( $more ) {
		$link = sprintf( '<br/><a href="%1$s" class="btn btn-default more-link">%2$s &raquo;</a>',
			esc_url( get_permalink( get_the_ID() ) ),
			_('Read More')
			);
		return $link;
	}
	function get_excerpt( $output ) {
		global $post;
		if ( has_excerpt() && ! is_attachment() && ! is_admin() ) {
			$output .= sprintf( '<br/><a href="%1$s" class="btn btn-default more-link">%2$s &raquo;</a>',
				esc_url( get_permalink( get_the_ID() ) ),
				_('Read More')
				);
		}
		return $output;
	}

	function the_post_thumbnail(){
		if ( post_password_required() || is_attachment() || ! has_post_thumbnail() ) {
			return;
		}

		if ( is_singular() ) :
		?>

		<div class="post-thumbnail">
			<?php the_post_thumbnail(); ?>
		</div><!-- .post-thumbnail -->

		<?php else : ?>

		<a class="post-thumbnail" href="<?php the_permalink(); ?>" aria-hidden="true">
			<?php
				the_post_thumbnail( 'post-thumbnail', array( 'alt' => get_the_title() ) );
			?>
		</a>

		<?php endif; // End is_singular()
	}
	function get_post_thumbnail($post = null, $size = 'post-thumbnail', $icon = false){
		$post = get_post( $post );
    if ( ! $post ) {
        return false;
    }
    $post_thumbnail_id = get_post_thumbnail_id( $post );
    $size = apply_filters( 'post_thumbnail_size', $size );
    if ( $post_thumbnail_id ) {
			if ( in_the_loop() )
            update_post_thumbnail_cache();
        $src = wp_get_attachment_image_src( $post_thumbnail_id, $size, $icon );
				return $src[0];
		}else{
			return false;
		}
	}
	function the_entry_meta(){
		if ( is_sticky() && is_home() && ! is_paged() ) {
			printf( '<span class="sticky-post">%s</span>', __( 'Featured', 'twentyfifteen' ) );
		}

		$format = get_post_format();
		if ( current_theme_supports( 'post-formats', $format ) ) {
			printf( '<span class="entry-format">%1$s<a href="%2$s">%3$s</a></span>',
				sprintf( '<span class="screen-reader-text">%s </span>', _x( 'Format', 'Used before post format.', 'twentyfifteen' ) ),
				esc_url( get_post_format_link( $format ) ),
				get_post_format_string( $format )
			);
		}

		if ( in_array( get_post_type(), array( 'post', 'attachment' ) ) ) {
			$time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';

			if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) {
				$time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
			}

			$time_string = sprintf( $time_string,
				esc_attr( get_the_date( 'c' ) ),
				get_the_date(),
				esc_attr( get_the_modified_date( 'c' ) ),
				get_the_modified_date()
			);

			printf( '<span class="posted-on"><span class="screen-reader-text">%1$s </span><a href="%2$s" rel="bookmark">%3$s</a></span>',
				_x( 'Posted on', 'Used before publish date.', 'twentyfifteen' ),
				esc_url( get_permalink() ),
				$time_string
			);
		}

		if ( 'post' == get_post_type() ) {
			if ( is_singular() || is_multi_author() ) {
				printf( '<span class="byline"><span class="author vcard"><span class="screen-reader-text">%1$s </span><a class="url fn n" href="%2$s">%3$s</a></span></span>',
					_x( 'Author', 'Used before post author name.', 'twentyfifteen' ),
					esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ),
					get_the_author()
				);
			}

			$categories_list = get_the_category_list( _x( ', ', 'Used between list items, there is a space after the comma.', 'twentyfifteen' ) );
			if ( $categories_list ) {
				printf( '<span class="cat-links"><span class="screen-reader-text">%1$s </span>%2$s</span>',
					_x( 'Categories', 'Used before category names.', 'twentyfifteen' ),
					$categories_list
				);
			}

			$tags_list = get_the_tag_list( '', _x( ', ', 'Used between list items, there is a space after the comma.', 'twentyfifteen' ) );
			if ( $tags_list ) {
				printf( '<span class="tags-links"><span class="screen-reader-text">%1$s </span>%2$s</span>',
					_x( 'Tags', 'Used before tag names.', 'twentyfifteen' ),
					$tags_list
				);
			}
		}

		if ( is_attachment() && wp_attachment_is_image() ) {
			// Retrieve attachment metadata.
			$metadata = wp_get_attachment_metadata();

			printf( '<span class="full-size-link"><span class="screen-reader-text">%1$s </span><a href="%2$s">%3$s &times; %4$s</a></span>',
				_x( 'Full size', 'Used before full size attachment link.', 'twentyfifteen' ),
				esc_url( wp_get_attachment_url() ),
				$metadata['width'],
				$metadata['height']
			);
		}

		if ( ! is_single() && ! post_password_required() && ( comments_open() || get_comments_number() ) ) {
			echo '<span class="comments-link">';
			/* translators: %s: post title */
			comments_popup_link( sprintf( __( 'Leave a comment<span class="screen-reader-text"> on %s</span>', 'twentyfifteen' ), get_the_title() ) );
			echo '</span>';
		}
	}

	public function __get($name){
		switch(strtolower($name)){
			case 'logo':
			case 'logo_dark':
			case 'loading_logo':
      		case 'favicon':
			case 'logo_footer':
				$logo = get_theme_mod($name, $default = '');
				$src = wp_get_attachment_image_src($logo, 'full');
				return $src[0];
			default:
				return get_theme_mod($name, $default = '');
		}
	}
	public function get($name, $default = ''){
		return get_theme_mod($name, $default = '');
	}

	public function dynamic_sidebar_before($index, $empty){
		global $wp_registered_sidebars;
		$sidebars = array('footer-1', 'footer-2', 'footer-3', 'footer-4', 'footer-5', 'footer-6', 'footer-7', 'footer-8');
		//echo $index;
		if(in_array($index, $sidebars)){
			$sidebars = get_option('na_sidebars');
			if(!$sidebars){
				$sidebars = array();
			}
		?>
		<div class="sidebar-columns">
			<form action="<?php echo admin_url( 'admin-ajax.php' ); ?>" method="post">
				<input type="hidden" name="sidebar" value="<?php echo $index; ?>" />
				<input type="hidden" name="action" value="na_save_sidebars" />
				<select class="na-sidebar-columns" title="Number of columns" name="columns">
					<option value="-1">Auto</option>
					<option value="0">Hidden</option>
					<?php for($i = 1; $i <= 12; $i ++): ?>
						<option <?php echo isset($sidebars[$index]) && $sidebars[$index][0] == $i ? 'selected="selected"': ''; ?> value="<?php echo $i; ?>"><?php echo $i; ?></option>
					<?php endfor; ?>
				</select>
			</form>
		</div>
		<?php
		}
	}

	public function save_sidebars(){
		$columns = $_POST['columns'];
		$sidebar = $_POST['sidebar'];
		$sidebars = get_option('na_sidebars');
		if(!$sidebars){
			$sidebars = array();
		}
		$sidebars[$sidebar] = array($columns);
		update_option('na_sidebars', $sidebars);
		echo json_encode(array('status' => 'success'));
		wp_die();
	}

	public function classes($tag, $class){
		if(basename( get_page_template() ) == 'page-map.php'){
			echo $class;
			return;
		}
		switch($tag){
			case 'header':
				$class = trim($class)." pattern-1";
				break;
			case 'content':
				break;
			default:
				break;
		}
		echo $class;
	}
    public function page_attributes_meta_box_template( $template, $post ){
		$theme_root = get_template_directory() ;
		$files_array = glob("$theme_root/template-parts/*.php");
		$x = array();
		foreach($files_array as $key => &$value){
			$name = str_replace('.php', '', basename($value));
			$x[$name] = $name;
		}
		$part = get_post_meta($post->ID, '_wp_page_template_part', true);
		$layout = get_post_meta($post->ID, '_wp_page_template_layout', true);
		?>
		<b>Part</b><br/>
		<small class="help">Select the template part, this applies to sections and inner content area.</small>
		<select name="page_template_part">
			<option <?php echo $part == '' ? 'selected': ''; ?>  value="">Default</option>
			<?php foreach($x as $key => $value){ ?>
				<option <?php echo $part == $key ? 'selected': ''; ?> value="<?php echo $key; ?>"><?php echo $value; ?></option>
			<?php } ?>
		</select>
		<p class="post-attributes-label-wrapper"><label class="post-attributes-label">Layout</label>
		<small class="help">Select the template layout.</small>
		<select name="page_template_layout">
			<option <?php echo $layout == '' ? 'selected': ''; ?>  value="">None</option>
			<option <?php echo $layout == 'container' ? 'selected': ''; ?>  value="container">Boxed</option>
			<option <?php echo $layout == 'container-fluid' ? 'selected': ''; ?> value="container-fluid">Fluid</option>
		</select>
		</p>
		<p class="post-attributes-label-wrapper"><label class="post-attributes-label">Template</label>
		<small class="help">Select the Full template.</small></p>
		<?php
	}
	function save_page_template_part($post_ID, $post, $update){
		if(isset($_POST['page_template_part'])){
			update_post_meta($post_ID, '_wp_page_template_part', $_POST['page_template_part']);
		}
		if(isset($_POST['page_template_layout'])){
			update_post_meta($post_ID, '_wp_page_template_layout', $_POST['page_template_layout']);
		}
	}
	function get_template_part($post_id, $default){
		$part = get_post_meta($post_id, '_wp_page_template_part', true);
		if(trim($part) == ''){
			return $default;
		}
		return $part;
	}
	function get_template_layout($post_id, $default){
		$part = get_post_meta($post_id, '_wp_page_template_layout', true);
		return $part;
	}
	public function woocommerce_before_shop_loop()
	{
		?>
			<div class="col-md-9 col-sm-9 col-xs-12">
		<?php

	}

	public function woocommerce_after_shop_loop()
	{
		?>
			</div>
			</div>
		<?php

	}
	public function enable($module){
		if(is_array($module)){
			foreach($module as $key){
				if(isset($this->modules[$key])){
					require_once $this->modules[$key];
				}
			}
		}elseif(isset($this->modules[$module])){
			require_once $this->modules[$module];
		}
	}
	public function enable_search($post_type){
		$this->search[] = $post_type;
	}
	public function search_filter($query) {
		if ($query->is_search && !is_admin() && !empty($this->search)) {
			$query->set('post_type', $this->search);
		}
		return $query;
	}
	public function register($module, $loader){
		$this->modules[$module] = $loader;
	}
}
global $theme;
$theme = new Na_Theme();

require get_template_directory() . '/inc/metaboxes/loader.php';

$theme->register('shortcodes', get_template_directory() . '/inc/shortcodes/shortcodes.php');
$theme->register('twitter', get_template_directory() . '/inc/social/twitter.php');
$theme->register('services', get_template_directory() . '/inc/services/loader.php');
$theme->register('slider', get_template_directory() . '/inc/slider/loader.php');
$theme->register('instagram', get_template_directory() . '/inc/social/instagram.php');
$theme->register('team', get_template_directory() . '/inc/team/loader.php');
$theme->register('case-studies', get_template_directory() . '/inc/case-studies/shortcode.php');
$theme->register('carousel', get_template_directory() . '/inc/carousel/shortcode.php');
$theme->register('testimonials', get_template_directory() . '/inc/testimonials/shortcode.php');
$theme->register('posts', get_template_directory() . '/inc/posts/shortcodes.php');
$theme->register('events', get_template_directory() . '/inc/events/loader.php');
$theme->register('attachment', get_template_directory() . '/inc/attachment/loader.php');
$theme->register('switcher', get_template_directory() . '/inc/switcher/loader.php');

do_action('theme_init', $theme);
?>