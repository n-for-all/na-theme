<?php

namespace NaTheme\Inc\User;

class Filter
{
    public function __construct()
    {
        if(!is_admin()){
            return;
        }
        $this->filters();
    }

    public function filters()
    {
        add_filter( 'manage_users_columns',  array($this, 'add_user_table_columns'));
        add_filter( 'manage_users_custom_column', array($this, 'modify_user_table_row'), 10, 3 );
        add_filter( 'manage_users_sortable_columns', array($this, 'get_sortable_columns') );
        add_action( 'restrict_manage_users', array($this, 'users_months_dropdown') );
        add_action( 'pre_user_query', array($this, 'extended_user_search') );
    }

    public function add_user_table_columns( $column ) {
    	$column['registered'] = __( 'Date Registered', 'na-theme' );
    	return $column;
    }

    public function modify_user_table_row( $val, $column_name, $user_id ) {
    	$user = get_userdata( $user_id );
    	switch( $column_name ) {
    		case 'registered' :
    			$t_time    = get_the_time( 'Y/m/d g:i:s A' );
    			$m_time    = $user->user_registered;
    			$time      = get_post_time( 'G', true, $user );
    			$time_diff = time() - $time;
    			if ( $time_diff > 0 && $time_diff < DAY_IN_SECONDS ) {
    				$h_time = sprintf( __( '%s ago', 'na-theme' ), human_time_diff( $time ) );
    			}
    			else {
    				$h_time = mysql2date( get_option( 'date_format' ), $m_time );
    			}
    			return '<abbr title="' . $t_time . '">' . apply_filters( 'user_registered_date_column_time', $h_time, $user, $column_name ) . '</abbr>';
    			break;
    		default:
    			break;
    	}
    }
    public function get_sortable_columns() {
    	return array(
    		'registered' => array( 'registered', true )
    	);
    }

    public function users_months_dropdown( $which ) {
    	global $wpdb, $wp_locale;
    	// Bail if current user cannot manage options
    	if ( !current_user_can( 'manage_options' ) ) {
    		return;
    	}
    	if ( $which != 'top') {
    		return;
    	}
    	$months = $wpdb->get_results( "
    		SELECT DISTINCT YEAR( user_registered ) AS year, MONTH( user_registered ) AS month
    		FROM $wpdb->users ORDER BY user_registered DESC" );

    	$month_count = count( $months );
    	if ( !$month_count || ( 1 == $month_count && 0 == $months[0]->month ) ) {
    		return;
    	}
    	if ( isset( $_GET[ 'date' ]) ) {
    		$m = $_GET[ 'date' ];
    	}
    	else {
    		$m = (int) 0;
    	}
    	?>
    	<label for="filter-date" class="screen-reader-text"><?php _e( 'Filter by date', 'na-theme' ); ?></label>
    		<select name="date" id="filter-date" style="display:inline-block; float:none;">
    			<option<?php selected( $m, "0" ); ?> value="0"><?php _e( 'All dates', 'na-theme' ); ?></option>
    			<?php
    			foreach ( $months as $arc_row ) {
    				if ( 0 == $arc_row->year )
    					continue;
    				$month = zeroise( $arc_row->month, 2 );
    				$year  = $arc_row->year;
    				printf( "<option %s value='%s'>%s</option>\n",
    					selected( $m, $year . $month, false ),
    					esc_attr( $arc_row->year . $month ),
    					/* translators: 1: month name, 2: 4-digit year */
    					sprintf( __( '%1$s %2$d', 'na-theme' ), $wp_locale->get_month( $month ), $year )
    				);
    			}
    			?>
    		</select>
    		<?php
    		submit_button( __( 'Filter By Date', 'na-theme' ), 'secondary', 'filterdate', false );
    }
    function extended_user_search( $user_query ){
    	global $pagenow, $wpdb;
    	if ( 'users.php' == $pagenow && isset( $_GET[ 'date' ] ) && is_numeric( $_GET[ 'date' ] ) ) {
    		$date = $_GET[ 'date' ];
    		if ( empty( $date ) ) {
    			return;
    		}
    		$year  = substr( $date, 0, -2 );
    		$month = substr( $date, -2, 5 );
    		switch( $month ) {
    			case "01":
    				$last_day = 31;
    			break;
    			case "02":
    				$last_day = 28;
    			break;
    			case "03":
    				$last_day = 31;
    			break;
    			case "04":
    				$last_day = 30;
    			break;
    			case "05":
    				$last_day = 31;
    			break;
    			case "06":
    				$last_day = 30;
    			break;
    			case "07":
    				$last_day = 31;
    			break;
    			case "08":
    				$last_day = 31;
    			break;
    			case "09":
    				$last_day = 30;
    			break;
    			case "10":
    				$last_day = 31;
    			break;
    			case "11":
    				$last_day = 30;
    			break;
    			case "12":
    				$last_day = 31;
    			break;
    		}
    		$user_query->query_where .= " AND user_registered >= '" . $year . "-" . $month . "-01 00:00:00' AND user_registered <= '" . $year . "-" . $month . "-" . $last_day . " 23:59:59'";
    	}
    }
}

?>
