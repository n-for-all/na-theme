<?php

require_once('lib/CurlRequest.php');
require_once('lib/CurlResponse.php');

class TwitterClient
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
     *
     * @var string
     */
    protected $authEndpoint = 'https://api.twitter.com/oauth2/token';
    protected $restEndpoint = 'https://api.twitter.com/1.1';

    /**
     *
     * @var string
     */
    protected $session = null;
    /**
     *
     * @var string
     */
    protected $access_token = null;
    protected $access_token_type = 'Bearer';

    /**
     * Array of headers
     * @var Array
     */
    protected $headers = array();

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
        'token' => array('post', 'oauth2/token'),
        'search/tweets' => array('get', 'search/tweets.json'),
        'statuses/user_timeline' => array('get', 'statuses/user_timeline.json'),
        //'search/tweets' => array('get', 'statuses/user_timeline.json')
    );

    /**
     * Construct the mailchimp client
     * @method __construct
     * @param  string      $apiKey mailchimp api key (https://us12.admin.mailchimp.com/account/api/)
     */
    public function __construct($client_id, $client_secret, $event)
    {
        $this->client_id = $client_id;
        $this->client_secret = $client_secret;
        $this->event = $event;
        if($this->event == ""){
            throw new Exception('You need to set an event to save the access token');
        }
        $this->request = new CurlRequest($this->restEndpoint,
            array(
                'Authorization' => 'Basic '.base64_encode(urlencode($this->client_id).':'.urlencode($this->client_secret)),
                'Accept-Encoding' => 'gzip',
                'Content-Type' => 'application/x-www-form-urlencoded; charset=utf-8',
                'User-Agent' => 'Ajaxy Twitter v1.0',
            ),
            array('encoding' => 'gzip')
        );
        add_shortcode( 'twitter',  array(&$this, 'twitter_shortcode') );
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
     * @param  [array]  $fields array of the returned fields
     * @param  integer $count  [description]
     * @param  integer $start  [description]
     * @return [JSON]          list of all found entities
     */
    public function search($entity, $query, $filter = array(), $count = 1)
    {
        $requestData = array(
            'q' => urlencode($query)
        );
        $requestData = array_merge($filter, $requestData);
        return $this->call('search/'.$entity, array(), $requestData);
    }
    public function statuses($entity, $query, $filter = array(), $count = 1)
    {
        $requestData = array();
        if(is_numeric($query)){
            $requestData = array(
                'user_id' => $query
            );
        }else{
            $requestData = array(
                'screen_name' => urlencode($query)
            );
        }
        $requestData = array_merge($filter, $requestData);
        return $this->call('statuses/'.$entity, array(), $requestData);
    }


    public function accessToken()
    {
        $this->access_token = get_option('twitter_tokens');
        if (!$this->access_token) {
            $vars =  array(
                'grant_type' => 'client_credentials'
            );
            $this->request->setUrl($this->authEndpoint);
            $obj = $this->hooks['token'];
            $response = $this->request->{$obj[0]}('', $vars);
            if ($response) {
                $json = $response->json();
                if ($json) {
                    if (isset($json->access_token)) {
                        //update the access tokens
                        call_user_func_array($this->event, array($json));
                        $this->access_token = $json->access_token;
                        $this->access_token_type = $json->token_type;
                    }
                }
            }
            return $response;
        } else {
            return $this->access_token;
        }
    }
    public function setAccessToken($token)
    {
        if ($token->access_token) {
            $this->access_token = $token->access_token;
            $this->access_token_type = $token->token_type;
        } else {
            throw new Exception('Invalid access token, You need to set a valid access token.');
        }
    }

    /**
     * Caller function to call the request wrapper to send a curl request
     * @method call
     * @param  string $hook The hook, it must be registered in the array of hooks
     * @param  array  $main the main args that needs to be sent along with the url
     * @param  array  $args the submission args and data that needs to be sent
     * @return json   mailchimp json response
     */
    protected function call($hook, $main = array(), $args = null)
    {
        if ($hook == '' || !isset($this->hooks[$hook])) {
            throw new Exception('Hook doesn\t exist, Please use $client->register to register your hook');
        }
        //$args['apikey'] = $this->apiKey;
        $response = null;

        try {
            $session = $this->accessToken();
            $this->request->set_headers(array('Authorization' => 'Bearer '.$session->access_token));
            $obj = $this->hooks[$hook];
            $uri = vsprintf($obj[1], $main);
            // $uri = $this->restEndpoint."/".$uri;
            $response = $this->request->{$obj[0]}($uri, $args);
            return $response->json();
        } catch (Exception $e) {
            return null;
        }
    }
    public function twitter_shortcode($atts){
        global $theme;
        if($theme->twitter_key == "" || $theme->twitter_secret == ""){
            throw new Exception('Twitter must be configured before using the shortcode, Please go to Appearence->Customize->Social API\'s to configure twitter');
        }
        ob_start();
        $key = base64_encode(serialize($atts));
        $output = get_transient('twitter_'.$key);
        if(!$output){
            switch($atts['type']){
                case 'timeline' :
                    unset($atts['type']);
                    $output = $this->statuses('user_timeline', $atts['q'], $atts);
                    break;
                default:
                    unset($atts['type']);
                    $output = $this->search('tweets', $atts['q'], $atts);
            }
        }
        if($output && !isset($output->errors)){
            set_transient('twitter_'.$key, $output, 890);
            ?>
            <div class="twitter-wrapper twitter-wrapper-<?php echo sizeof($output); ?>">
                <div class="account-tweets">
            <?php
            $account_user = null;
            foreach($output as $tweet){
                $time = strtotime($tweet->created_at);
                $user_mentions = array();
                foreach($tweet->entities->user_mentions as $mention){
                    $user_mentions[] = '<a href="https://twitter.com/'.$mention->screen_name.'" target="_blank">@'.$mention->screen_name.'</a>';
                }
                $replaced = array();
                foreach($tweet->entities->hashtags as $hashtag){
                    if(!in_array($replaced, $hashtag->text)){
                        $tweet->text = str_replace('#'.$hashtag->text." ",'<a href="https://twitter.com/search?q=#'.$hashtag->text.'"  target="_blank">#'.$hashtag->text.'</a> ', $tweet->text);
                        $replaced[] = $hashtag->text;
                        //die();
                    }
                }
                $html_media = array();
                foreach($tweet->entities->media as $media){
                    if($media->type == 'photo'){
                        $html_media[] = $media->media_url_https;
                        break;
                    }

                }
                $user = '<a href="https://twitter.com/'.$tweet->user->screen_name.'" target="_blank">@'.$tweet->user->screen_name.'</a>';
                $account_user = $tweet->user;
                ?>
                <div class="twitter-content-wrapper <?php echo (sizeof($html_media) >0 ? 'has-image':''); ?>">
                    <div class="twitter-inner-wrapper">
                    <div class="tweet-icon">
                        <svg width="101px" height="83px" viewBox="50 68 101 83" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <!-- Generator: Sketch 40.1 (33804) - http://www.bohemiancoding.com/sketch -->
                            <desc>Created with Sketch.</desc>
                            <defs></defs>
                            <path d="M150.003072,78.3542955 C146.323959,79.9863457 142.369338,81.0888795 138.21971,81.5848948 C142.45534,79.0458168 145.70894,75.0251933 147.240487,70.2340461 C143.275865,72.5856183 138.885231,74.2926708 134.211587,75.212699 C130.469472,71.2250765 125.137308,68.734 119.236127,68.734 C107.905779,68.734 98.7189967,77.9197822 98.7189967,89.2501303 C98.7189967,90.8581797 98.9005022,92.4242278 99.250013,93.9257739 C82.1984891,93.0702476 67.0810247,84.9019967 56.9617139,72.4891154 C55.1956596,75.5192084 54.1836285,79.0433167 54.1836285,82.8034322 C54.1836285,89.9216509 57.8057398,96.2013438 63.3109089,99.8804568 C59.9478056,99.7739536 56.7842084,98.8509252 54.0181234,97.314378 C54.0161234,97.3998806 54.0161234,97.4858833 54.0161234,97.5723859 C54.0161234,107.512691 61.0883406,115.804946 70.474129,117.690004 C68.7525761,118.159018 66.9400204,118.409526 65.0689629,118.409526 C63.7469223,118.409526 62.4618828,118.280522 61.2088443,118.041515 C63.8199246,126.192265 71.3966573,132.124447 80.3749331,132.289452 C73.3532174,137.792622 64.5069457,141.072222 54.8941504,141.072222 C53.2380995,141.072222 51.6050493,140.975219 50,140.785213 C59.0797789,146.606892 69.8641102,150.003997 81.4504662,150.003997 C119.188125,150.003997 139.825259,118.741036 139.825259,91.6287033 C139.825259,90.739176 139.805259,89.8546488 139.765758,88.9741218 C143.774381,86.0820329 147.252488,82.4684219 150.003072,78.3542955 L150.003072,78.3542955 Z" id="Shape" stroke="none" fill="#c0deed" fill-rule="evenodd"></path>
                        </svg>
                    </div>
    				<div class="entry-date">
    					<?php echo date('F, j Y', $time); ?>
    				</div>

    				<h3 class="entry-category">
                        <!-- <div class="entry-image"><img src="<?php echo $tweet->user->profile_image_url_https; ?>" /></div>
                        <?php echo $user; ?> <br>-->
    					<span><?php echo implode(', ',$user_mentions); ?></span>
    				</h3>


    				<div class="entry-content"><?php echo preg_replace('/(( https| http:\/\/)[^ ]+)/', '<a href="\1">\1</a>', $tweet->text); ?></div>

    				<div class="social-icons">
    					<a target="_blank" class="reply" href="https://twitter.com/intent/tweet?in_reply_to=<?php echo $tweet->id;?>">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
                            <path fill="#fff" d="M9 3.881v-3.881l6 6-6 6v-3.966c-6.98-0.164-6.681 4.747-4.904 7.966-4.386-4.741-3.455-12.337 4.904-12.119z"></path>
                            </svg>
                        </a>
    					<a target="_blank" class="retweet" href="https://twitter.com/intent/retweet?tweet_id=<?php echo $tweet->id;?>">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
<path fill="#fff" d="M2 5h10v3l4-4-4-4v3h-12v6h2zM14 11h-10v-3l-4 4 4 4v-3h12v-6h-2z"></path>
</svg>
    					</a>
    					<a target="_blank" class="favorite" href="https://twitter.com/intent/favorite?tweet_id=<?php echo $tweet->id;?>">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
<path fill="#fff" d="M16 6.204l-5.528-0.803-2.472-5.009-2.472 5.009-5.528 0.803 4 3.899-0.944 5.505 4.944-2.599 4.944 2.599-0.944-5.505 4-3.899zM8 11.773l-3.492 1.836 0.667-3.888-2.825-2.753 3.904-0.567 1.746-3.537 1.746 3.537 3.904 0.567-2.825 2.753 0.667 3.888-3.492-1.836z"></path>
</svg>
    					</a>
    				</div>

    				<div class="button-container">
    					<a target="_blank" href="https://twitter.com/statuses/<?php echo $tweet->id;?>" class="read-more twitter-post">View on Twitter</a>
    				</div>

    			</div>
                <div class="entry-media">
                    <?php foreach($html_media as $media){
                            ?>
                            <div class="entry-photo" style="background-image:url(<?php echo $media; ?>)"></div>
                            <?php
                        }
                    ?>
                </div>
    			</div>
                <?php
                break;
            }
            ?>
        </div>
        <div class="twitter-account">
            <h3 class="entry-category">
                <div class="entry-image"><img src="<?php echo $account_user->profile_image_url_https; ?>" /></div>
                <div class="entry-name"><?php echo $account_user->name; ?></div>
                <?php echo '<a href="https://twitter.com/'.$account_user->screen_name.'" target="_blank">@'.$account_user->screen_name.'</a>'; ?> <small class="description"><?php echo $account_user->description; ?></small>
            </h3>
            <div class="entry-meta">
                <div class="entry-tweets"><?php echo $account_user->statuses_count; ?><label>Tweets</label></div>
                <div class="entry-followers"><?php echo $account_user->followers_count; ?><label>Followers</label></div>
                <div class="entry-friends"><?php echo $account_user->friends_count; ?><label>Friends</label></div>

            </div>
        </div>
        </div>
        <?php
            //print_r($output);
            //print_r($output);
        }
        return ob_get_clean();
    }
}
global $theme;
if($theme->twitter_key != "" && $theme->twitter_secret != ""){
    $client = new TwitterClient($theme->twitter_key, $theme->twitter_secret, function($tokens){
        update_option('twitter_tokens', $tokens);
        return $tokens;
    });
}


//die();
?>
