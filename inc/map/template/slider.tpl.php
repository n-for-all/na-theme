<?php

$classes = [
    'na-slider-wrapper',
    'na-slider-' . ($settings['vertical'] != 0 ? 'vertical' : 'horizontal'),
    'na-' . ($settings['type'] != '' ? $settings['type'] : 'normal'),
    $settings['class'] ?? ''
];

?><slider id="<?php echo $id; ?>" class="<?php echo implode(' ', $classes); ?>">
    <?php foreach ($slides as $slide) :
        $video = $slide['video'] && trim($slide['video']) != '' ? trim($slide['video']) : false;

    ?>
        <slide class="na-slide na-slide-<?php echo $slide['post']->ID; ?> <?php echo $video ? "with-video" : ""; ?>" <?php echo $video ? 'data-youtube-video="' . $video . '"' : ""; ?>>
            <?php echo $slide['content']; ?>
        </slide>
    <?php endforeach; ?>
    <nav class="na-slider-actions prev" action="prev">
        <svg width="64px" height="146px" viewBox="0 0 64 146" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>Path</title>
            <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                <g id="Artboard" transform="translate(-111.000000, -42.000000)" stroke="#000000" stroke-width="4">
                    <polyline id="Path" transform="translate(142.866302, 115.364624) scale(-1, 1) translate(-142.866302, -115.364624) " points="113.303894 44.8295898 172.428711 116.853882 113.303894 185.899658"></polyline>
                </g>
            </g>
        </svg>
    </nav>
    <nav class="na-slider-actions next" action="next">
        <svg width="24px" viewBox="0 0 64 146" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>Path</title>
            <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                <g id="Artboard" transform="translate(-111.000000, -42.000000)" stroke="#000000" stroke-width="4">
                    <polyline id="Path" points="113.303894 44.8295898 172.428711 116.853882 113.303894 185.899658"></polyline>
                </g>
            </g>
        </svg>
    </nav>
    <?php if (isset($settings['bullets']) && $settings['bullets']  && count($slides) > 1) : ?>
        <bullets></bullets>
    <?php endif; ?>
</slider>
<script>
    <?php //wait till the thme to be ready 
    ?>
    app.on('theme-ready', function() {
        new NaSlider('#<?php echo $id; ?>', <?php echo json_encode((array)$settings); ?>);
    });
</script>