<div class="form-inline doctors-search">
    <div class="form-group search-group">
        <div data-live-search="true" endpoint="<?php echo add_query_arg('action', 'doctors_autocomplete', admin_url('admin-ajax.php')); ?>" alllabel="<?php _e('Search all for \'%s\'', 'na-theme'); ?>" searchinglabel="<?php _e('Searching...', 'na-theme'); ?>" placeholder="<?php _e('Search for doctors, division or specialty...', 'na-theme'); ?>"></div>
    </div>
    <div class="form-group">
        <label><?php _e('Sort', 'na-theme'); ?></label>
        <select name="sort" class="form-control form-select">
            <option value="a-z" <?php echo $order == 'ASC' ? 'selected' : ''; ?>><?php _e('Name: A-Z', 'na-theme'); ?></option>
            <option value="z-a" <?php echo $order == 'DESC' ? 'selected' : ''; ?>><?php _e('Name: Z-A', 'na-theme'); ?></option>
        </select>
    </div>
</div>