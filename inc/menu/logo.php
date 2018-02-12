<?php if($theme->logo): ?>
    <a class="navbar-brand" href="<?php echo home_url("/"); ?>">
        <span class="vertical-center <?php echo $theme->glitch == 1 ? 'glitch' : ''; ?>" <?php echo $theme->glitch == 1 ? 'style="background-image:url('.esc_url( $theme->logo ).'"': ''; ?> >
            <img class="logo" src="<?php echo esc_url( $theme->logo ); ?>" alt="" />
            <?php if($theme->logo_dark): ?>
            <img class="logo-dark" src="<?php echo esc_url( $theme->logo_dark ); ?>" alt="" />
            <?php endif; ?>
        </span>
    </a>
<?php else: ?>
    <a class="navbar-brand" href="<?php echo home_url("/"); ?>">
        <span class="vertical-center"><?php echo bloginfo('title'); ?></span>
    </a>
<?php endif; ?>
