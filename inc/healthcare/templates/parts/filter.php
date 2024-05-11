<?php

$specialities = \SSMC\Search\Helper::getSpecialitiesWithDepartments();
$types = \SSMC\Search\Helper::getTypes();
$languages = \SSMC\Search\Helper::getLanguages(pll_current_language());


$treatmentsIds = explode(',', $selectedTreatments);
$treatments = [];
foreach ($treatmentsIds as $treatmentId) {
    $treatment = get_term($treatmentId);
    if ($treatment && !is_wp_error($treatment)) {
        $treatments[] = [
            'id' => $treatment->term_id,
            'name' => $treatment->name,
            'url' => get_term_link($treatment)
        ];
    }
}

?>
<script>
    var filtersData = {
        treatments: [],
        specialities: <?php echo json_encode($specialities); ?>,
        types: <?php echo json_encode($types); ?>,
        languages: <?php echo json_encode($languages); ?>,
        selected: <?php echo json_encode(
                        [
                            "departments" => $selectedDepartments,
                            "languages" => $selectedLanguages,
                            "treatments" => [$selectedTreatments, $treatments],
                            "divisions" => $selectedDivisions,
                            "types" => $selectedTypes,
                            "order" => $selectedOrder,
                        ]
                    ); ?>
    };
</script>
<form action="<?php echo get_post_type_archive_link('doctors'); ?>" class="search-filter" x-data="multiselectComponent()">
    <div class="search-filter-main">
        <label><?php echo __("Filter By:", "aaa-ssmc"); ?></label>
        <div class="search-filter-wrap">
            <div class="search-filter-wrapper">
                <input x-model="department.selectedString" type="text" aria-hidden="true" x-bind:aria-expanded="department.listActive.toString()" hidden name="department">
                <div class="input-presentation" @click="department.listActive = !department.listActive" @click.away="department.listActive = false" x-bind:class="{'active': department.listActive}">
                    <span class="placeholder" x-show="department.selected.length == 0"><?php echo __("Department", "aaa-ssmc"); ?></span>
                    <template x-for="(tag, index) in department.selected">
                        <div class="tag-badge">
                            <span x-text="tag.name"></span>
                            <button x-bind:data-index="index" @click.stop="department.removeMe($event)">x</button>
                        </div>
                    </template>
                </div>
                <ul x-show.transition="department.listActive" role="listbox">
                    <template x-for="(tag, index, collection) in department.unselected">
                        <li x-show="!department.selected.includes(tag)" x-bind:value="tag.id" x-text="tag.name" aria-role="button" @click.stop="department.addMe($event)" x-bind:data-index="index" role="option"></li>
                    </template>
                </ul>
            </div>
            <div class="search-filter-wrapper slim-wrapper" x-show="department.selected.length">
                <input x-model="division.selectedString" type="text" aria-hidden="true" x-bind:aria-expanded="division.listActive.toString()" name="division" hidden>
                <div class="input-presentation" @click="division.listActive = !division.listActive" @click.away="division.listActive = false" x-bind:class="{'active': division.listActive}">
                    <span class="placeholder" x-show="division.selected.length == 0"><?php echo __("Division", "aaa-ssmc"); ?></span>
                    <template x-for="(tag, index) in division.selected">
                        <div class="tag-badge">
                            <span x-text="tag.name"></span>
                            <button x-bind:data-index="index" @click.stop="division.removeMe($event)">x</button>
                        </div>
                    </template>
                </div>
                <ul x-show.transition="division.listActive" role="listbox">
                    <template x-for="(tag, index, collection) in division.unselected">
                        <li x-show="!division.selected.includes(tag)" x-bind:value="tag.id" x-text="tag.name" aria-role="button" @click.stop="division.addMe($event)" x-bind:data-index="index" role="option"></li>
                    </template>
                </ul>
            </div>
            <div class="search-filter-wrapper slim-wrapper">
                <input x-model="type.selectedString" type="text" aria-hidden="true" x-bind:aria-expanded="type.listActive.toString()" name="type" hidden>
                <div class="input-presentation" @click="type.listActive = !type.listActive" @click.away="type.listActive = false" x-bind:class="{'active': type.listActive}">
                    <span class="placeholder" x-show="type.selected.length == 0"><?php echo __("Type", "aaa-ssmc"); ?></span>
                    <template x-for="(tag, index) in type.selected">
                        <div class="tag-badge">
                            <span x-text="tag.name"></span>
                            <button x-bind:data-index="index" @click.stop="type.removeMe($event)">x</button>
                        </div>
                    </template>
                </div>
                <ul x-show.transition="type.listActive" role="listbox">
                    <template x-for="(tag, index, collection) in type.unselected">
                        <li x-show="!type.selected.includes(tag)" x-bind:value="tag.id" x-text="tag.name" aria-role="button" @click.stop="type.addMe($event)" x-bind:data-index="index" role="option"></li>
                    </template>
                </ul>
            </div>
            <div class="search-filter-wrapper slim-wrapper">
                <div class="input-presentation search-icon" @click="treatments.listActive = !department.listActive" @click.away="treatments.listActive = false" x-bind:class="{'active': treatments.listActive, 'loading': treatments.loading}">
                    <input x-model="treatments.selectedString" type="text" aria-hidden="true" x-bind:aria-expanded="treatments.listActive.toString()" name="treatments" hidden>
                    <template x-for="(tag, index) in treatments.selected">
                        <div class="tag-badge">
                            <span x-text="tag.name"></span>
                            <button x-bind:data-index="index" @click.stop="treatments.removeMe($event, tag)">x</button>
                        </div>
                    </template>
                    <input x-model="treatments.searchString" placeholder="<?php echo __("Treatments", "aaa-ssmc"); ?>" class="border-0 placeholder" x-on:input.debounce="treatments.find($event)">
                </div>
                <ul x-show.transition="treatments.listActive" role="listbox">
                    <template x-for="(tag, index) in treatments.values">
                        <li x-bind:value="tag" x-text="tag.name" aria-role="button" @click.stop="treatments.addMe($event, tag)" x-bind:data-index="index" role="option"></li>
                    </template>
                </ul>
            </div>
            <div class="search-filter-wrapper slim-wrapper">
                <input x-model="language.selectedString" type="text" aria-hidden="true" x-bind:aria-expanded="language.listActive.toString()" name="language" hidden>
                <div class="input-presentation" @click="language.listActive = !department.listActive" @click.away="language.listActive = false" x-bind:class="{'active': language.listActive}">
                    <span class="placeholder" x-show="language.selected.length == 0"><?php echo __("Language", "aaa-ssmc"); ?></span>
                    <template x-for="(tag, index) in language.selected">
                        <div class="tag-badge">
                            <span x-text="tag"></span>
                            <button x-bind:data-index="index" @click.stop="language.removeMe($event)">x</button>
                        </div>
                    </template>
                </div>
                <ul x-show.transition="language.listActive" role="listbox">
                    <template x-for="(tag, index, collection) in language.unselected">
                        <li x-show="!language.selected.includes(tag)" x-bind:value="tag" x-text="tag" aria-role="button" @click.stop="language.addMe($event)" x-bind:data-index="index" role="option"></li>
                    </template>
                </ul>
            </div>
            <button type="submit" class="btn btn-default btn-sm"><?php echo __('Apply filters', "aaa-ssmc"); ?></button>
        </div>
    </div>
    <div class="search-filter-main">
        <label><?php echo __("Sort By:", "aaa-ssmc"); ?></label>
        <div class="search-filter-wrap">
            <div class="search-filter-wrapper slim-wrapper">
                <input x-model="sorting.selectedString" type="text" aria-hidden="true" x-bind:aria-expanded="sorting.listActive.toString()" name="order" hidden>
                <div class="input-presentation" @click="sorting.listActive = !department.listActive" @click.away="sorting.listActive = false" x-bind:class="{'active': sorting.listActive}">
                    <span class="placeholder" x-show="sorting.selected.length == 0"><?php echo __("Default", "aaa-ssmc"); ?></span>
                    <template x-for="(tag, index) in sorting.selected">
                        <div class="tag-badge">
                            <span x-text="tag.name"></span>
                            <button x-bind:data-index="index" @click.stop="sorting.removeMe($event)">x</button>
                        </div>
                    </template>
                </div>
                <ul x-show.transition="sorting.listActive" role="listbox">
                    <template x-for="(tag, index, collection) in sorting.unselected">
                        <li x-show="!sorting.selected.includes(tag)" x-bind:value="tag.id" x-text="tag.name" aria-role="button" @click.stop="sorting.addMe($event)" x-bind:data-index="index" role="option"></li>
                    </template>
                </ul>
            </div>
        </div>
    </div>
</form>
<script>
    var divisions = filtersData.specialities.divisions;
    var departments = filtersData.specialities.departments;

    function departmentsData(data) {
        this.data = data;
        this.getAll = function(exclude) {
            if (exclude) {
                exclude = exclude.map(function(excluded) {
                    return excluded.id;
                });
                return data.filter(function(department) {
                    return department.id != exclude;
                });
            } else {
                return data;
            }

        };
        this.getDivisions = function(id) {
            return divisions.filter(function(division) {
                return division.department.id == id;
            });
        };
        this.getDivisionById = function(id) {
            var dep = divisions.filter(function(division) {
                return division.id == id;
            });
            if (dep && dep.length) {
                return dep[0];
            }
            return null;
        };
        this.getById = function(id) {
            var dep = departments.filter(function(department) {
                return department.id == id;
            });
            if (dep && dep.length) {
                return dep[0];
            }
            return null;
        };
    }

    function multiselectComponent() {
        var departmentManager = new departmentsData(departments);
        var form = document.querySelector('form.search-filter');

        var data = {
            department: {
                listActive: false,
                selectedString: filtersData.selected.departments,
                selected: [],
                unselected: [],
                addMe: function(e) {
                    e.preventDefault();
                    var index = e.target.dataset.index;
                    var extracted = this.unselected.splice(index, 1);
                    this.selected.push(extracted[0]);
                    this.updateDivisions();
                    this.listActive = false;

                    this.selectedString = this.selected.map(function(item) {
                        return item.id
                    }).join(",");
                },
                removeMe: function(e) {
                    e.preventDefault();
                    var index = e.target.dataset.index;
                    var extracted = this.selected.splice(index, 1);
                    this.unselected.push(extracted[0]);
                    this.updateDivisions();

                    this.selectedString = this.selected.map(function(item) {
                        return item.id
                    }).join(",");
                },
                updateDivisions: function() {
                    data.division.unselected = [];
                    this.selected.map(function(department) {
                        data.division.selected = [];
                        data.division.unselected = data.division.unselected.concat(
                            departmentManager.getDivisions(department.id)
                        );

                        data.division.selectedString = data.division.selected.map(function(item) {
                            return item.id
                        }).join(",");
                    });
                }
            },
            division: {
                listActive: false,
                selectedString: filtersData.selected.divisions,
                selected: [],
                unselected: [],
                addMe: function(e) {
                    e.preventDefault();
                    var index = e.target.dataset.index;
                    var extracted = this.unselected.splice(index, 1);
                    this.selected.push(extracted[0]);
                    this.listActive = false;

                    this.selectedString = this.selected.map(function(item) {
                        return item.id
                    }).join(",");
                },
                removeMe: function(e) {
                    e.preventDefault();
                    var index = e.target.dataset.index;
                    var extracted = this.selected.splice(index, 1);
                    this.unselected.push(extracted[0]);

                    this.selectedString = this.selected.map(function(item) {
                        return item.id
                    }).join(",");
                }
            },
            language: {
                listActive: false,
                selectedString: filtersData.selected.languages,
                selected: [],
                unselected: filtersData.languages,
                addMe: function(e) {
                    e.preventDefault();
                    var index = e.target.dataset.index;
                    var extracted = this.unselected.splice(index, 1);
                    this.selected.push(extracted[0]);
                    this.listActive = false;

                    this.selectedString = this.selected.map(function(item) {
                        return item
                    }).join(",");
                },
                removeMe: function(e) {
                    e.preventDefault();
                    var index = e.target.dataset.index;
                    var extracted = this.selected.splice(index, 1);
                    this.unselected.push(extracted[0]);

                    this.selectedString = this.selected.map(function(item) {
                        return item
                    }).join(",");
                }
            },
            treatments: {
                loading: false,
                search: "",
                values: [],
                listActive: false,
                selectedString: filtersData.selected.treatments[0],
                selected: filtersData.selected.treatments[1],
                searchString: '',
                addMe: function(e, tag) {
                    e.preventDefault();
                    var index = e.target.dataset.index;
                    var extracted = this.values.splice(index, 1);
                    this.selected.push(extracted[0]);
                    this.listActive = false;
                    this.searchString = '';

                    this.selectedString = this.selected.map(function(item) {
                        return item.id
                    }).join(",");
                },
                removeMe: function(e, tag) {
                    e.preventDefault();
                    var index = e.target.dataset.index;
                    var extracted = this.values.splice(index, 1);
                    // this.unselected.push(extracted[0].name);
                    this.searchString = '';

                    this.selected = this.selected.filter(function(item) {
                        return item.id != tag.id;
                    });

                    this.selectedString = this.selected.map(function(item) {
                        return item.id
                    }).join(",");
                },
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
                    fetch("<?php echo admin_url('admin-ajax.php') . '?action=treatments&s='; ?>" + value)
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
                                    id: 0,
                                    name: '<?php echo __('No treatments found', 'aaa-ssmc'); ?>',
                                    position: '<?php echo __('Please try another query', 'aaa-ssmc'); ?>',
                                    url: '#'
                                }];
                            }
                            me.loading = false;
                            me.listActive = true;
                        });
                }
            },
            type: {
                listActive: false,
                selectedString: filtersData.selected.types,
                selected: [],
                unselected: filtersData.types,
                addMe: function(e) {
                    e.preventDefault();
                    var index = e.target.dataset.index;
                    var extracted = this.unselected.splice(index, 1);
                    this.selected.push(extracted[0]);
                    this.listActive = false;

                    this.selectedString = this.selected.map(function(item) {
                        return item.id
                    }).join(",");
                },
                removeMe: function(e) {
                    e.preventDefault();
                    var index = e.target.dataset.index;
                    var extracted = this.selected.splice(index, 1);
                    this.unselected.push(extracted[0]);

                    this.selectedString = this.selected.map(function(item) {
                        return item.id
                    }).join(",");
                }
            },
            sorting: {
                listActive: false,
                selectedString: "",
                selected: [],
                unselected: <?php echo json_encode($sorting); ?>,
                addMe: function(e) {
                    e.preventDefault();
                    var index = e.target.dataset.index;
                    var extracted = this.unselected[index];
                    this.selected = [extracted];
                    this.listActive = false;

                    this.selectedString = this.selected.map(function(item) {
                        return item.id
                    }).join(",");

                    setTimeout(function() {
                        form.submit();
                    }, 500);
                },
                removeMe: function(e) {
                    e.preventDefault();
                    var index = e.target.dataset.index;
                    this.selected = [];

                    this.selectedString = this.selected.map(function(item) {
                        return item.id
                    }).join(",");
                    setTimeout(function() {
                        form.submit();
                    }, 500);
                }
            }
        };
        if (filtersData.selected.departments != '') {
            var deps = filtersData.selected.departments.split(',');
            deps.map(function(dep) {
                var department = departmentManager.getById(dep);
                if (department != null) {
                    data.department.selected.push(department);
                }
            });
            data.department.updateDivisions();
            if (filtersData.selected.divisions != '') {
                data.division.selectedString = filtersData.selected.divisions;
                var deps = filtersData.selected.divisions.split(',');
                deps.map(function(dep) {
                    var division = departmentManager.getDivisionById(dep);
                    if (division != null) {
                        data.division.selected.push(division);
                    }
                });
            }
        }
        if (filtersData.selected.languages != '') {
            var deps = filtersData.selected.languages.split(',');
            deps.map(function(dep) {
                data.language.selected.push(dep.trim());
            });
        }
        if (filtersData.selected.types != '') {
            var deps = filtersData.selected.types.split(',');
            data.type.selected = data.type.unselected.filter(function(type) {
                return deps.indexOf(type.id.toString()) >= 0;
            });
            data.type.unselected = data.type.unselected.filter(function(type) {
                return deps.indexOf(type.id.toString()) < 0;
            });
        }
        if (filtersData.selected.order != '') {
            data.sorting.selectedString = filtersData.selected.order;
            data.sorting.selected = data.sorting.unselected.filter(function(sorting) {
                return sorting.id == filtersData.selected.order;
            });
            data.sorting.unselected = data.sorting.unselected.filter(function(sorting) {
                return sorting.id != filtersData.selected.order;
            });
        }

        data.department.unselected = departmentManager.getAll(data.department.selected);
        return data;
    }
</script>