<div class="searchHolder search-wrapper doctors-search-live" x-data="searchComponent()" x-init="$watch('doctors.values')" @click.away="doctors.listActive = false">
    <input x-model="doctors.search" placeholder="<?php echo __('Enter a doctor name...', 'aaa-ssmc'); ?>" class="searchDoctors" type="text" x-on:input.debounce="doctors.find($event)" />
    <button class="searchDoctorTrigger" x-bind:class="{ 'loading': doctors.loading }"><i class="fal" x-bind:class="{ 'fa-spinner': doctors.loading, 'fa-search': !doctors.loading }"></i></button>
    <ul class="search-items" x-show.transition="doctors.listActive" role="listbox">
        <template x-for="(tag, index) in doctors.values">
            <li aria-role="button" x-bind:data-index="index" role="option">
                <a x-bind:href="tag.url">
                    <div class="item-image" x-show="tag.image" :style="'background-image: url(' + tag.image + ')'"></div>
                    <span class="item-content">
                        <span class="item-name" x-text="tag.name"></span>
                        <span class="item-position" x-html="tag.position"></span>
                    </span>
                </a>
            </li>
        </template>
    </ul>
</div>
<script>
    function searchComponent() {
        var data = {
            doctors: {
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
                    fetch("<?php echo admin_url('admin-ajax.php') . '?action=doctors&s='; ?>" + value)
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
                                    name: '<?php echo __('No doctors found', 'aaa-ssmc'); ?>',
                                    position: '<?php echo __('Please try another query', 'aaa-ssmc'); ?>',
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