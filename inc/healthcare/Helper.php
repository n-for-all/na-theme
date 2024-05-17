<?php

namespace NaTheme\Inc\Healthcare;

class Helper
{
    /**
     * It returns an array of all the specialties and departments
     * 
     * @return array
     */
    public static function getSpecialtiesWithDepartments()
    {
        $args = array(
            'taxonomy'   => 'doctors-specialities',
            'parent' => 0,
            'hide_empty' => false,
        );

        $return = ['divisions' => [], 'departments' => []];

        $getSubSpecialities = function ($parent) use ($args) {
            $args['parent'] = $parent;
            $specialities = get_terms($args);
            return array_map(function ($term) {
                return $term->name;
            }, $specialities);
        };

        $departments = get_posts([
            'post_type' => 'department',
            'posts_per_page' => -1,
            'orderby' => 'title',
            'order' => 'ASC',
            'post_status' => 'publish',
        ]);
        $divisions = get_posts([
            'post_type' => 'division',
            'posts_per_page' => -1,
            'orderby' => 'title',
            'order' => 'ASC',
            'post_status' => 'publish',
        ]);
        foreach ($divisions as $division) {
            $department_meta = get_post_meta($division->ID, '_meta_na_department', true);
            if (!empty($department_meta)) {
                $data = [
                    'name' => trim(html_entity_decode($division->name)),
                    'id' => $division->term_id,
                    'department' => null,
                    'specialities' => $getSubSpecialities($division->term_id),
                ];
                $department = get_term($department_meta);
                $data['department'] = [
                    'name' => trim(html_entity_decode($department->name)),
                    'id' => $department->term_id
                ];

                if ($department && !isset($departments[$department->term_id])) {
                    $departments[$department->term_id] = [
                        'name' => trim(html_entity_decode($department->name)),
                        'id' => $department->term_id
                    ];
                }
                $return['divisions'][] = $data;
            }
        }

        $return['departments'] = array_values($departments);

        return $return;
    }

    /**
     * Get doctor taxonomy types (Consultant or specialist)
     *
     * @date 2022-07-10
     *
     * @return void
     */
    public static function getTypes()
    {
        $args = array(
            'taxonomy'   => 'doctors-types',
            'parent' => 0,
            'hide_empty' => false,
        );

        $types = get_terms($args);


        return array_map(function ($item) {
            return [
                'name' => trim(html_entity_decode($item->name)),
                'id' => $item->term_id
            ];
        }, $types);
    }

    /**
     * Get all languages of the doctors
     *
     * @date 2022-07-10
     *
     * @param string $locale
     *
     * @return array
     */
    public static function getLanguages($locale = 'ar')
    {
        global $wpdb;

        $sep = $locale == 'ar' ? ' و' : ',';
        $out = ['en' => [], 'ar' => []];
        $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}postmeta WHERE meta_key = 'languages'");
        foreach ($results as $row) {
            $value = $row->meta_value;
            $languages = explode($sep, $value);
            foreach ($languages as $language) {
                if (trim($language) != '') {
                    if (self::isEnglish($language)) {
                        $out['en'][trim($language)] = trim($language);
                    } else {
                        $out['ar'][trim($language)] = trim($language);
                    }
                }
            }
        }
        $return = array_keys($out[$locale]);
        sort($return);
        return $return;
    }

    /**
     * If the string is not the same length as the string converted to UTF-8, then it's not English
     * 
     * @param $str The string to check.
     * 
     * @return boolean
     */
    public static function isEnglish($str)
    {
        $converted_str = iconv('UTF-8', 'UTF-8//IGNORE', $str);
        if (strlen($str) != strlen($converted_str)) {
            return false;
        } else {
            return true;
        }
    }
}
