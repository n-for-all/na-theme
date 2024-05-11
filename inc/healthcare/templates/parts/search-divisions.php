<div class="searchHolder search-wrapper divisions-search-live" x-data="departmentSearchComponent()" x-init="$watch('divisions.values')" @click.away="divisions.listActive = false">
    <input x-model="divisions.search" placeholder="<?php echo __('Enter a Division, Department or Speciality...', 'aaa-ssmc'); ?>" class="searchDoctors" type="text" x-on:input.debounce="divisions.find($event)" />
    <button class="searchDoctorTrigger" x-bind:class="{ 'loading': divisions.loading }"><i class="fal" x-bind:class="{ 'fa-spinner': divisions.loading, 'fa-search': !divisions.loading }"></i></button>
    <ul class="search-items" x-show.transition="divisions.listActive" role="listbox">
        <template x-for="(tag, index) in divisions.values">
            <li aria-role="button" x-bind:data-index="index" role="option">
                <a x-bind:href="tag.url">
                    <div class="item-image" :style="'background-image: url(' + tag.image + ')'"></div>
                    <span class="item-content">
                        <span class="item-name" x-text="tag.name"></span>
                        <span class="item-position" x-html="tag.subtitle"></span>
                    </span>
                </a>
            </li>
        </template>
    </ul>
</div>
<script>
    function departmentSearchComponent() {
        var data = {
            divisions: {
                loading: false,
                listActive: false,
                search: "",
                values: [],
                find: function(e) {
                    var value = e.target.value;
                    var me = this;
                    if (value == '') {
                        me.loading = false;
                        me.listActive = false;
                        return;
                    }
                    this.loading = true;
                    this.listActive = false;
                    fetch("<?php echo admin_url('admin-ajax.php') . '?action=divisions&s='; ?>" + value)
                        .then(function(response) {
                            return response.json()
                        })
                        .then(function(response) {
                            if (value == '') {
                                me.loading = false;
                                me.listActive = false;
                                return;
                            } else if (response.data.length) {
                                me.values = response.data;
                            } else {
                                me.values = [{
                                    name: '<?php echo __('No results found', 'aaa-ssmc'); ?>',
                                    subtitle: '<?php echo __('Please try another query', 'aaa-ssmc'); ?>',
                                    url: '#'
                                }];
                            }
                            me.loading = false;
                            me.listActive = true;
                        });
                }
            }
        };
        return data;
    }
</script>