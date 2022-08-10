<?php

/**
 * Block attributes.
 *
 * The following attributes are available:
 *
 * @var $attributes array(
 *   'className' (string) => Additional class names which should be added to block.
 * )
 */

/** @var array */
$classes = array('row');
if (array_key_exists('className', $attributes) && !empty($attributes['className'])) {
    array_push($classes, $attributes['className']);
}
$first =$attributes['labels'][0]['tab_id'] ?? '';
?>
<div x-data="{show:'<?php echo $first; ?>'}" class="<?php echo esc_attr(implode(' ', $classes)); ?>">
    <nav>
        <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <?php foreach ($attributes['labels'] as $key => $value) : ?>
                <a @click.prevent @click="show = '<?php echo $value['tab_id']; ?>'" class="nav-link" :class="{'active': show == '<?php echo $value['tab_id']; ?>'}" id="<?php echo "tab-" . $value['tab_id']; ?>" href="#!tabs/tab-1"><?php echo $value['label']; ?></a>
            <?php endforeach; ?>
        </div>
    </nav>
    <div class="tab-content" id="nav-tabContent">
        <?php echo $content; ?>
    </div>
</div>