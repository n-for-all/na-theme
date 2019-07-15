<?php
class NaPreset_UAE{
    public function __construct()
    {
        $this->actions();
        $this->filters();
    }
    public function actions()
    {
        add_action('wp_enqueue_scripts', array($this, 'scripts'));
        add_action('woocommerce_before_checkout_shipping_form', function () {
            echo '<h3>Shipping Details</h3><hr/>';
        });

        add_action('woocommerce_after_checkout_shipping_form', function () {
            echo '<hr/>';
        });
        add_action( 'woocommerce_customer_object_updated_props', array(&$this, 'woocommerce_customer_object_updated_props'), 10, 2 );
    }
    public function filters()
    {
        add_filter( 'woocommerce_customer_meta_fields', array($this, 'woocommerce_customer_meta_fields'), 10, 1);
        add_filter( 'woocommerce_checkout_fields', array($this, 'woocommerce_checkout_fields'), 10, 1);
        add_filter( 'woocommerce_address_to_edit', array($this, 'woocommerce_address_to_edit'), 10, 2);

        add_filter( 'woocommerce_ship_to_different_address_checked', '__return_true');
        add_filter( 'woocommerce_checkout_posted_data' , array($this, 'woocommerce_checkout_posted_data'), 20 );

        add_filter('default_checkout_billing_country', function ($_fields) {
            return 'AE';
        });
        add_filter('default_checkout_shipping_country', function ($_fields) {
            return 'AE';
        });
    }
    public function scripts()
    {
        wp_enqueue_style('preset-styles-uae', get_template_directory_uri() . '/preset/UAE/css/style.css', array(), '1.0.0', 'screen');
    }
    public function woocommerce_customer_meta_fields( $fields ) {
        $address = array();
        $address['shipping_city'] = array_replace($fields['shipping']['fields']['shipping_city'], [
            'type' => 'select',
            'label' => __( 'City', 'woocommerce' ),
            'class' => 'regular-text',
            'options' => [
                'dubai' => 'Dubai',
                'Abu Dhabi' => 'Abu Dhabi',
                'Sharjah' => 'Sharjah',
                'Ajman' => 'Ajman',
                'Ras al-Khaimah' => 'Ras al-Khaimah',
                'Fujairah' => 'Fujairah',
                'Umm al-Quwain' => 'Umm al-Quwain'
            ],
            'value' => '',
        ]);

        $defaults = [ 'label' => '', 'placeholder' => '', 'required' => 1 ,'class' => 'regular-text', 'description' => '' ];
        $address['shipping_building'] = array_replace($defaults, ['label' => 'House / Building', 'description' => 'House / Building Number']);
        $address['shipping_floor'] = array_replace($defaults, ['label' => 'Floor', 'description' => 'Floor number']);
        $address['shipping_directions'] = array_replace($defaults, ['type' => 'textarea', 'label' => 'Extra Directions for Delivery', 'description' => 'Extra Directions for Delivery', 'required' => false]);
        $fields['shipping']['fields'] = array_replace($fields['shipping']['fields'], $address);
        return $fields;
    }
    public function woocommerce_customer_object_updated_props($customer, $updated_props) {
        update_user_meta( $customer->get_id(), 'shipping_building', trim($_POST['shipping_building']) ) ;
        update_user_meta( $customer->get_id(), 'shipping_floor', trim($_POST['shipping_floor']) ) ;
        update_user_meta( $customer->get_id(), 'shipping_directions', trim($_POST['shipping_directions']) ) ;
    }
    public function woocommerce_checkout_fields( $fields ) {
        $fields['shipping']['shipping_city'] = array_replace($fields['shipping']['shipping_city'], [
            'type' => 'select',
            'label' => 'City',
            'options' => [
                'dubai' => 'Dubai',
                'Abu Dhabi' => 'Abu Dhabi',
                'Sharjah' => 'Sharjah',
                'Ajman' => 'Ajman',
                'Ras al-Khaimah' =>
                'Ras al-Khaimah',
                'Fujairah' => 'Fujairah',
                'Umm al-Quwain' => 'Umm al-Quwain'
            ]
        ]);

        $defaults = [ 'label' => '', 'placeholder' => '', 'required' => 1 ,'class' => array ( 'form-row-wide','address-field') ];
        $fields['shipping']['shipping_building'] = array_replace($defaults, ['label' => '', 'placeholder' => 'House / Building']);
        $fields['shipping']['shipping_floor'] = array_replace($defaults, ['label' => '', 'placeholder' => 'Floor']);
        $fields['shipping']['shipping_directions'] = array_replace($defaults, ['type' => 'textarea', 'label' => 'Extra Directions for Delivery', 'placeholder' => 'Extra Directions for Delivery', 'required' => false]);

        unset($fields['billing']['billing_first_name']);
        unset($fields['billing']['billing_last_name']);
        unset($fields['billing']['billing_company']);
        unset($fields['billing']['billing_address_1']);
        unset($fields['billing']['billing_address_2']);
        unset($fields['billing']['billing_postcode']);
        unset($fields['billing']['billing_state']);
        unset($fields['billing']['billing_phone']);
        unset($fields['billing']['billing_address_2']);
        unset($fields['billing']['billing_postcode']);
        unset($fields['billing']['billing_company']);
        unset($fields['billing']['billing_last_name']);
        unset($fields['billing']['billing_email']);
        unset($fields['billing']['billing_country']);
        unset($fields['billing']['billing_city']);

        unset($fields['shipping']['shipping_state']);

        return $fields;
    }
    public function woocommerce_address_to_edit( $address, $load_address ) {
        if($load_address != 'shipping'){
            return $address;
        }
        unset($address['shipping_state']);
        unset($address['shipping_postcode']);
        unset($address['shipping_address_2']);

        $shipping_building = get_user_meta( wp_get_current_user()->ID, 'shipping_building', true);
        $shipping_floor = get_user_meta( wp_get_current_user()->ID, 'shipping_floor', true);
        $shipping_directions = get_user_meta( wp_get_current_user()->ID, 'shipping_directions', true);

        $address['shipping_address_1'] = array_replace($address['shipping_address_1'], ['label' => 'Address']);
        $address['shipping_city'] = array_replace($address['shipping_city'], [
            'type' => 'select',
            'label' => 'City',
            'options' => [
                'dubai' => 'Dubai',
                'Abu Dhabi' => 'Abu Dhabi',
                'Sharjah' => 'Sharjah',
                'Ajman' => 'Ajman',
                'Ras al-Khaimah' =>
                'Ras al-Khaimah',
                'Fujairah' => 'Fujairah',
                'Umm al-Quwain' => 'Umm al-Quwain'
            ]
        ]);

        $defaults = [ 'label' => '', 'placeholder' => '', 'required' => 1 ,'class' => array ( 'form-row-wide','address-field') ];
        $address['shipping_building'] = array_replace($defaults, ['label' => 'House / Building', 'placeholder' => 'House / Building', 'value' => $shipping_building]);
        $address['shipping_floor'] = array_replace($defaults, ['label' => 'Floor', 'placeholder' => 'Floor', 'value' => $shipping_floor]);
        $address['shipping_directions'] = array_replace($defaults, ['type' => 'textarea', 'label' => 'Extra Directions for Delivery', 'placeholder' => 'Extra Directions for Delivery', 'required' => false, 'value' => $shipping_directions]);
        // foreach($address as $key => &$value){
        //     $value['placeholder'] = $value['label'];
        //     $value['label'] = '';
        // }
        return $address;
    }
    public function woocommerce_checkout_posted_data($data){
        $data['ship_to_different_address'] = true;
        return $data;
    }

}
new NaPreset_UAE();

 ?>
