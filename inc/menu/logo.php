<?php if ($naTheme->logo) : ?>
    <a class="flex items-center navbar-brand flex-shrink-0 <?php echo $naTheme->glitch == 1 ? 'glitch' : ''; ?>" <?php echo $naTheme->glitch == 1 ? 'style="background-image:url(' . esc_url($naTheme->logo) . '"' : ''; ?> href="<?php echo home_url("/"); ?>">
        <img class="h-14 logo" src="<?php echo esc_url($naTheme->logo); ?>" alt="<?php echo esc_attr(bloginfo('title')); ?>" />
        <?php if ($naTheme->logo_dark) : ?>
            <img class="h-14 logo-dark" src="<?php echo esc_url($naTheme->logo_dark); ?>" alt="<?php echo esc_attr(bloginfo('title')); ?>" />
        <?php endif; ?>
    </a>
<?php else : ?>
    <a class="flex items-center flex-shrink-0 navbar-brand" href="<?php echo home_url("/"); ?>">
        <?php echo bloginfo('title'); ?>
    </a>
<?php endif; ?>