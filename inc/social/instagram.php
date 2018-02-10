<?php


require_once('lib/CurlRequest.php');
require_once('lib/CurlResponse.php');

class InstagramClient
{
    /**
     * Endpoint url
     * @var string
     */
    public $url = '';

    /**
     * The main request object
     * @var MailchimpRequest
     */
    protected $request;

    /**
     * API key
     * @var string
     */
    protected $client_id;

    /**
     * API key
     * @var string
     */
    protected $client_secret;

    /**
     * API key
     * @var string
     */
    protected $redirect_uri;

    /**
     *
     * @var string
     */
    protected $authEndpoint = 'https://api.instagram.com/oauth/authorize/?client_id=%s&redirect_uri=%s&response_type=code&scope=%s';

    /**
     *
     * @var string
     */
    protected $tokenEndpoint = 'https://api.instagram.com/oauth/access_token';
    /**
     *
     * @var string
     */
    protected $apiEndpoint = 'https://api.instagram.com/v1';

    /**
     *
     * @var string
     */
    protected $session = null;
    /**
     *
     * @var string
     */
    protected $access_token = '';
    /**
     *
     * @var string
     */
    protected $expires_in = 0;


    /**
     * Array of headers
     * @var Array
     */
    protected $headers = array();

    /**
     * Hold the errors
     * @var string
     */
    private $code = '';

    /**
     * Hold the errors
     * @var string
     */
    private $error = '';
    /**
     * Hold the saver
     * @var string
     */
    private $event = '';

    /**
     * Associative array of all registered hooks
     * To add your hooks, extend this class and call register to register a new hook
     * @var array
     */
    private $hooks = array(
        'user/media/recent' => array('get', 'users/%s/media/recent/')
    );

    /**
     * Construct the client
     * @method __construct
     * @param  string      $apiKey api key (https://us12.admin.mailchimp.com/account/api/)
     */
    public function __construct($client_id, $client_secret, $redirect_uri, $event)
    {
        add_action('init', array($this, 'init'));
        add_filter('query_vars', array($this, 'query_vars'));
        add_action('parse_query', array($this, 'setup'));
        add_shortcode('instagram', array(&$this, 'shortcode'));
        $this->client_id = $client_id;
        $this->client_secret = $client_secret;
        $this->redirect_uri = $redirect_uri;
        $this->event = $event;
        if ($this->event == "") {
            throw new Exception('You need to set an event to save the access tokens');
        }
        $this->request = new CurlRequest($this->apiEndpoint,
            array(
                'Accept' => 'Application/json',
                'Content-Type' => 'application/x-www-form-urlencoded; charset=utf-8',
                'User-Agent' => isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT']: 'Mozilla/5.0',
            )
        );
        $this->request->set_referer($this->redirect_uri);
    }

    public function query_vars($query_vars)
    {
        $query_vars[] = 'instagram';
        return $query_vars;
    }
    public function setup( $wp_query )
    {
        global $theme;
        if (get_query_var('instagram') == 1) {
            if (isset($_GET['code'])) {
                $this->setCode($_GET['code']);
                $this->accessToken();
                if ($this->error) {
                    ?>
                    <div style="background: #941212;border: 1px solid #862626;padding:15px;margin:15px;border-radius:3px;color: #fff;font-family: helvetica;"><?php echo $this->error;
                    ?></div>
                    <?php

                } else {
                    ?>
                    <div style="background:#eee;border:1px solid #ccc;padding:15px;margin:15px;border-radius:3px;font-family: helvetica;">Your instagram api is now active</div>
                    <?php

                }
                die();
            }
        }
    }
    public function init()
    {
        add_rewrite_rule(
            // The regex to match the incoming URL
            '^instagram/auth/?$',
            // The resulting internal URL: `index.php` because we still use WordPress
            // `pagename` because we use this WordPress page
            // `designer_slug` because we assign the first captured regex part to this variable
            'index.php?instagram=1',
            // This is a rather specific URL, so we add it to the top of the list
            // Otherwise, the "catch-all" rules at the bottom (for pages and attachments) will "win"
            'top');
        $ver = filemtime(__FILE__); // Get the file time for this file as the version number
            $defaults = array( 'version' => 0, 'time' => time() );
        $r = wp_parse_args(get_option(__CLASS__ . '_flush', array()), $defaults);

        if ($r['version'] != $ver || $r['time'] + 172800 < time()) { // Flush if ver changes or if 48hrs has passed.
                flush_rewrite_rules();
                //print_r('flushed');
                // trace( 'flushed' );
                $args = array( 'version' => $ver, 'time' => time() );
            if (! update_option(__CLASS__ . '_flush', $args)) {
                add_option(__CLASS__ . '_flush', $args);
            }
        }
    }

    /**
     * Register your custom hooks
     * @method register
     * @param  string   $hook   [description]
     * @param  string   $method the method you need to request upon, valid methods are 'get', 'put', 'patch', 'post', 'delete'
     * @param  string   $uri    the uri of the endpoint excluding the base URL, ex: 'lists/%s/members'
     * @return void
     */
    public function register($hook, $method, $uri)
    {
        $this->hooks[$hook] = array($method, $uri);
    }

    /**
     * Search Bullhorn Entity
     * @method search
     * @param  [array]  $entity [description]
     * @param  [string]  $query  http://www.lucenetutorial.com/lucene-query-syntax.html
     * @param  [array]  $fields array of the returned fields
     * @param  integer $count  [description]
     * @param  integer $start  [description]
     * @return [JSON]          list of all found entities
     */
    public function media($user_id = 'self', $type = 'recent', $count = 50)
    {
        if ($type == '') {
            $type = 'recent';
        }
        if ($user_id == '') {
            $user_id = 'self';
        }
        $requestData = array(
            'count' => $count
        );
        return $this->call('user/media/'.$type, array($user_id), $requestData);
    }
    /**
     * Get the status of the current subscriber
     * @method status
     * @param  string $listId the list id
     * @param  string $email  the new/subscribed email
     * @return json           response
     */
    public function setCode($code)
    {
        $this->code = $code;
    }
    public function expired()
    {
        return false; //access token never expires
    }
    public function authorize()
    {
        return  sprintf($this->authEndpoint, $this->client_id, $this->redirect_uri, 'basic+public_content+follower_list');
    }
    public function accessToken()
    {
        if (!$this->code) {
            throw new Exception('You must set the code before you can call the accessToken method');
        }
        $this->error = null;

        $vars =  array(
            'grant_type' => 'authorization_code',
            'code' => $this->code,
            'client_id' => $this->client_id,
            'client_secret' => $this->client_secret,
            'redirect_uri' => $this->redirect_uri
        );
        $this->request->setUrl($this->tokenEndpoint);
        $response = $this->request->post('', $vars);
        if ($response) {
            $json = $response->json();
            if ($json) {
                if (isset($json->access_token)) {
                    $this->access_token = $json->access_token;
                    $this->expires_in = 0;
                    call_user_func_array($this->event, array($json));
                } elseif (isset($json->error_message)) {
                    $this->error = $json->error_message;
                }
            }
        }
        return $this->access_token;
    }
    public function setAccessToken($token)
    {
        if ($token->access_token) {
            $this->access_token = $token->access_token;
            $this->expires_in = 0;
        } else {
            throw new Exception('Invalid access token, You need to set a valid access token.');
        }
    }

    /**
     * Caller function to call the request wrapper to send a curl request to api v3
     * @method call
     * @param  string $hook The hook, it must be registered in the array of hooks
     * @param  array  $main the main args that needs to be sent along with the url
     * @param  array  $args the submission args and data that needs to be sent to mailchimp
     * @return json   json response
     */
    protected function call($hook, $main = array(), $args = null)
    {
        if ($hook == '' || !isset($this->hooks[$hook])) {
            throw new Exception('Hook doesn\t exist, Please use $client->register to register your hook');
        }
        //$args['apikey'] = $this->apiKey;
        $response = null;

        try {
            $obj = $this->hooks[$hook];
            $uri = vsprintf($obj[1], $main);
            if (!isset($args['access_token'])) {
                $args['access_token'] = $this->access_token;
                //$uri = strpos($uri, '?') === false ? $uri.'?access_token='.urlencode($this->access_token) : $uri.'&access_token='.urlencode($this->access_token);
            }
            $response = $this->request->{$obj[0]}($uri, $args);
            return $response->json();
        } catch (Exception $e) {
            return null;
        }
    }
    public function shortcode($atts)
    {
        global $theme;
        $user_id = $atts['user_id'] ? $atts['user_id']: 'self';
        if ($theme->instagram_key == "" || $theme->instagram_secret == "") {
            throw new Exception('Instagram must be configured before using the shortcode, Please go to Appearence->Customize->Social API\'s to configure instagram');
        }
        ob_start();
        $key = base64_encode(serialize($atts));
        $output = get_transient('instagram_'.$key);
        if (!$output) {
            switch ($atts['type']) {
                case 'timeline':
                    break;
                default:
                    unset($atts['type']);
                    $output = $this->media($user_id );
            }
        }
        if (isset($output->data) && !isset($output->error_message)) {
            set_transient('instagram_'.$key, $output, 890);
            $account_user = $output->data[0]->user;
            ?>
            <div class="instagram-account">
                <h3 class="entry-category">
                    <div class="entry-image"><img src="<?php echo $account_user->profile_picture; ?>" /></div>
                    <div class="entry-name"><?php echo $account_user->username; ?></div>
                    <?php echo '<a href="https://instagram.com/'.$account_user->username.'" target="_blank">@'.$account_user->full_name.'</a>';
                ?>
                </h3>
                <div class="entry-meta">
                    <div class="entry-tweets"><?php echo $account_user->statuses_count;
                ?><label>Tweets</label></div>
                    <div class="entry-followers"><?php echo $account_user->followers_count;
                ?><label>Followers</label></div>
                    <div class="entry-friends"><?php echo $account_user->friends_count;
                ?><label>Friends</label></div>

                </div>
            </div>
            <div class="instagram-wrapper instagram-wrapper-<?php echo sizeof($output);
            ?>">
                <div class="account-insta" >
            <?php
            $account_user = null;
            ?>
            <div class="instagram-content-wrapper" style="width:<?php echo sizeof($output->data)*76; ?>px"><?php
            foreach ($output->data as $insta) {
                $time = $insta->created_time;
                $user_mentions = array();
                foreach ($insta->tags as $tag) {
                    $user_mentions[] = '<a href="https://www.instagram.com/explore/tags/'.$tag.'/" target="_blank">#'.$tag.'</a>';
                }
                $replaced = array();
                foreach ($insta->users_in_photo as $user_in_photo) {
                    $users[] = '<a style="background-image:url('.$user_in_photo->user->profile_picture.')" href="https://www.instagram.com/'.$user_in_photo->user->username.'"  target="_blank">@'.$user_in_photo->user->full_name.'</a> ';
                }
                $html_media = array($insta->link, $insta->images->low_resolution->url);
                $user = '<a href="https://instagram.com/'.$insta->user->username.'" target="_blank">@'.$insta->user->full_name.'</a>';
                $account_user = $insta->user;
                ?>

                    <div class="instagram-inner-wrapper" >
                        <div class="entry-image">
                            <img src="<?php echo $html_media[1]; ?>"/>
                        </div>
                        <div class="entry-meta">
            				<div class="entry-date">
            					<?php echo date('F, j Y', $time); ?>
            				</div>

            				<h3 class="entry-category">
            					<span><?php echo implode(', ', $user_mentions);?></span>
            				</h3>
            				<div class="entry-content"><?php echo $insta->caption->text; ?></div>
            				<div class="button-container">
            					<a target="_blank" href="<?php echo $html_media[0]; ?>" class="read-more instagram-post">View on Instagram</a>
            				</div>
        				</div>

        			</div>

                <?php
            }
            ?>
            </div>
        </div>

        </div>
        <?php
            // print_r($output);
            //print_r($output);
        }
        return ob_get_clean();
    }
}
if ($theme->instagram_key != "" && $theme->instagram_secret != "") {
    $theme->instagram = new InstagramClient($theme->instagram_key, $theme->instagram_secret, home_url('instagram/auth'), function ($tokens) {
        // print_r($tokens);
        $tokens->access_token = '2240657935.3a81a9f.78ce0fd7d2b54be6863b04f6ed0d09a2';
        update_option('instagram_tokens', $tokens);
        return $tokens;
    });
    $theme->instagram->setAccessToken(get_option('instagram_tokens'));
}
