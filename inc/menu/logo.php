<?php if($naTheme->logo): ?>
    <a class="flex items-center navbar-brand" href="<?php echo home_url("/"); ?>">
        <span class="vertical-center <?php echo $naTheme->glitch == 1 ? 'glitch' : ''; ?>" <?php echo $naTheme->glitch == 1 ? 'style="background-image:url('.esc_url( $naTheme->logo ).'"': ''; ?> >
            <img class="logo" src="<?php echo esc_url( $naTheme->logo ); ?>" alt="" />
            <?php if($naTheme->logo_dark): ?>
            <img class="logo-dark" src="<?php echo esc_url( $naTheme->logo_dark ); ?>" alt="" />
            <?php endif; ?>
        </span>
    </a>
<?php else: ?>
    <a class="flex items-center navbar-brand" href="<?php echo home_url("/"); ?>">
        <span class="vertical-center"><?php echo bloginfo('title'); ?></span>
    </a>
<?php endif; ?>
