<?php


$bullets = false;
if (isset($settings['bullets']) && $settings['bullets']  && count($slides) > 1) :
    $bullets = true;
endif;

$classes = [
    'na-slider-wrapper',
    'na-slider-' . ($settings['vertical'] != 0 ? 'vertical' : 'horizontal'),
    'na-' . ($settings['type'] != '' ? $settings['type'] : 'normal'),
    'na-' . ($bullets ? 'with-bullets' : 'no-bullets'),
    $settings['class'] ?? ''
];

$slide_classes = [
    'na-slide'
];

?><slider id="<?php echo $id; ?>" class="<?php echo implode(' ', $classes); ?>">
    <?php foreach ($slides as $slide) :
        $post_id = null;
        if (isset($slide['post']) && $slide['post']->ID) {
            $post_id = $slide['post']->ID;
            $slide_classes[] = 'na-slide-' . $slide['post']->ID;
        }
        $video = isset($slide['video']) && trim($slide['video']) != '' ? trim($slide['video']) : false;
        if ($video) {
            $slide_classes[] = 'with-video';
        }
    ?>
        <slide class="<?php echo implode(" ", $slide_classes); ?>" <?php echo $video ? 'data-youtube-video="' . $video . '"' : ""; ?>>
            <?php echo $slide['content']; ?>
            <?php isset($slide['post']) ? edit_post_link('Edit This Slide', '', '', $slide['post']->ID) : ''; ?>
        </slide>
    <?php endforeach; ?>
    <?php if (!isset($settings['no-arrows']) || !$settings['no-arrows']) : ?>
        <nav class="na-slider-actions prev" action="prev">
            <svg width="24px" height="56px" viewBox="0 0 24 56" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                    <g class="arrow-path" transform="translate(-1.000000, 0.000000)" stroke="currentColor" stroke-width="1.5">
                        <g transform="translate(12.863960, 28.061096) scale(-1, 1) translate(-12.863960, -28.061096) translate(1.863960, 1.061096)">
                            <polyline points="0 0 22 27.5700709 0 54"></polyline>
                        </g>
                    </g>
                </g>
            </svg>
        </nav>
        <nav class="na-slider-actions next" action="next">
            <svg width="24px" height="56px" viewBox="0 0 24 56" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                    <g class="arrow-path" transform="translate(-1.000000, 0.000000)" stroke="currentColor" stroke-width="1.5">
                        <g transform="translate(1.863960, 1.061096)">
                            <polyline points="0 0 22 27.5700709 0 54"></polyline>
                        </g>
                    </g>
                </g>
            </svg>
        </nav>
    <?php endif; ?>
    <?php if (isset($settings['bullets']) && $settings['bullets']  && count($slides) > 1) : ?>
        <bullets class="bottom-0"></bullets>
    <?php endif; ?>
</slider>
<script>
    <?php //wait till the thme to be ready 
    ?>
    app.on('theme-ready', function() {
        new NaSlider('#<?php echo $id; ?>', <?php echo json_encode((array)$settings); ?>);
    });
</script>