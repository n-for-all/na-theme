<?php

$departments = \NaTheme\Inc\Healthcare\Doctor::getDepartments();

$filters = isset($_GET['filter']) ? $_GET['filter'] : array();
$departmentFilter = isset($filters['department']) ? $filters['department'] : '';
?>
<form method="get" id="department-filter" class="mb-10">
    <div class="form-group department-filter">
        <h5 class="mb-4 text-xl font-medium opacity-80"><?php _e('Departments', 'na-theme'); ?></h5>
        <label class="flex items-center mb-2 cursor-pointer">
            <input type="radio" name="filter[department]" <?php if ($departmentFilter == ''): ?>checked<?php endif; ?> value="" class="sr-only peer">
            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span class="text-gray-900 ms-3 dark:text-gray-300"><?php _e('All Departments', 'na-theme'); ?></span>
        </label>
        <?php foreach ($departments as $department) : ?>
            <label class="flex items-center mb-2 cursor-pointer">
                <input type="radio" name="filter[department]" <?php if ($departmentFilter == $department->ID): ?>checked<?php endif; ?> value="<?php echo $department->ID; ?>" class="sr-only peer">
                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span class="text-gray-900 ms-3 dark:text-gray-300"><?php echo $department->post_title; ?></span>
            </label>
        <?php endforeach; ?>
    </div>
</form>
<script>
    app.ready(function() {
        var departments = document.querySelectorAll('.department-filter input[type="radio"]');
        departments.forEach(function(department) {
            department.addEventListener('change', function() {
                app.trigger('department.filter', this.value);

                document.getElementById('department-filter').submit();
            });
        });
    })
</script>