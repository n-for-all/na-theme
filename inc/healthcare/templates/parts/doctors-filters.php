<div class="flex w-full form-inline doctors-search">
    <div class="flex-1 mr-4 border border-gray-300 rounded-sm bg-gray-50 form-group search-group">
        <div data-live-search="true" endpoint="<?php echo add_query_arg('action', 'doctors_autocomplete', admin_url('admin-ajax.php')); ?>" alllabel="<?php _e('Search all for \'%s\'', 'na-theme'); ?>" searchinglabel="<?php _e('Searching...', 'na-theme'); ?>" placeholder="<?php _e('Search for doctors, division or specialty...', 'na-theme'); ?>"></div>
    </div>
    <div class="flex items-center form-group">
        <label class="mr-2 text-sm"><?php _e('Sort', 'na-theme'); ?></label>
        <select name="sort" class="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-sm bg-gray-50 form-control form-select sort-divisions">
            <option value="a-z" <?php echo $order == 'ASC' ? 'selected' : ''; ?>><?php _e('Name: A-Z', 'na-theme'); ?></option>
            <option value="z-a" <?php echo $order == 'DESC' ? 'selected' : ''; ?>><?php _e('Name: Z-A', 'na-theme'); ?></option>
        </select>
    </div>
</div>