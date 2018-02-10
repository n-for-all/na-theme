<?php

/**
 * Basic CURL wrapper
 *
 * See the README for documentation/examples or http://php.net/curl for more information about the libcurl extension for PHP
 * @author Naji Amer
**/

class CurlRequest {

    /**
     * The base url where you want to send the request
     *
     * @var string
    **/
    public $url = '';

    /**
     * The request method
     *
     * @var string
    **/
    public $method = '';

    /**
     * Determines whether or not requests should follow redirects
     *
     * @var boolean
    **/
    public $follow_redirects = true;

    /**
     * An associative array of headers to send along with requests
     *
     * @var array
    **/
    public $headers = array();

    /**
     * An associative array of CURLOPT options to send along with requests
     *
     * @var array
    **/
    public $options = array();

    /**
     * The referer header to send along with requests
     *
     * @var string
    **/
    public $referer;

    /**
     * The user agent to send along with requests
     *
     * @var string
    **/
    public $user_agent;

    /**
     * Stores an info string for the last request if one occurred
     *
     * @var string
     * @access protected
    **/
    protected $info = '';

    /**
     * Stores an error string for the last request if one occurred
     *
     * @var string
     * @access protected
    **/
    protected $error = '';

    /**
     * Stores resource handle for the current CURL request
     *
     * @var resource
     * @access protected
    **/
    protected $request;

    /**
     * Initializes a Curl object
    **/
    function __construct($url, $headers = array(), $options = array()) {
        if($this->check()){
            $this->options = $options;
            if (trim($url) == "") {
                throw new Exception('Request URL must not be empty.');
            }
            $this->url = $url;
            $this->user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'Curl/PHP '.PHP_VERSION;
            $this->headers = $headers;
        }
    }

    /**
     * Check if all dependencies exists and loaded
    **/
    function check(){
        if(!function_exists('curl_version')){
            throw new Exception('Curl extension must be installed and loaded.');
        }
        if(!function_exists('http_build_query')){
            throw new Exception('Php version must be greater than 5.0.0');
        }
        return true;
    }

    /**
     * Makes an HTTP DELETE request to the specified $this->url with an optional array or string of $vars
     *
     * Returns a  object if the request was successful, false otherwise
     *
     * @param array|string $vars
     * @return  object
    **/
    function delete($uri, $vars = array()) {
        return $this->request('DELETE', $this->url, $vars);
    }

    /**
     * Makes an HTTP GET request to the specified $this->url with an optional array or string of $vars
     *
     * Returns a  object if the request was successful, false otherwise
     *

     * @param array|string $vars
     * @return
    **/
    function get($uri, $vars = array()) {
        return $this->request('GET', $uri, $vars);
    }

    /**
     * Makes an HTTP HEAD request to the specified $this->url with an optional array or string of $vars
     *
     * Returns a  object if the request was successful, false otherwise
     *
     * @param array|string $vars
     * @return
    **/
    function head($uri, $vars = array()) {
        return $this->request('HEAD', $uri, $vars);
    }

    /**
     * Makes an HTTP POST request to the specified $this->url with an optional array or string of $vars
     *
     * @param array|string $vars
     * @return |boolean
    **/
    function post($uri, $vars = array()) {
        return $this->request('POST', $uri, $vars);
    }

    /**
     * Makes an HTTP PUT request to the specified $this->url with an optional array or string of $vars
     *
     * Returns a  object if the request was successful, false otherwise
     *
     * @param array|string $vars
     * @return |boolean
    **/
    function put($uri, $vars = array()) {
        return $this->request('PUT', $uri, $vars);
    }

    /**
     * Makes an HTTP PATCH request to the specified $this->url with an optional array or string of $vars
     *
     * Returns a  object if the request was successful, false otherwise
     *
     * @param array|string $vars
     * @return |boolean
    **/
    function patch($uri, $vars = array()) {
        return $this->request('PATCH', $uri, $vars);
    }

    /**
     * Returns the info string of the current request if one occurred
     *
     * @return string
    **/
    function setUrl($url) {
        return $this->url = $url;
    }
    /**
     * Returns the info string of the current request if one occurred
     *
     * @return string
    **/
    function info() {
        return $this->info;
    }
    /**
     * Returns the error string of the current request if one occurred
     *
     * @return string
    **/
    function error() {
        return $this->error;
    }


    /**
     * Formats and adds custom headers to the current request
     *
     * @return void
     * @access protected
    **/
    protected function set_request_headers() {
        $headers = array();
        foreach ($this->headers as $key => $value) {
            $headers[] = $key.': '.$value;
        }
        curl_setopt($this->request, CURLOPT_HTTPHEADER, $headers);
    }

    /**
     * Formats and adds custom headers to the current request
     *
     * @return void
     * @access protected
    **/
    public function set_headers($headers) {
        $headers = array_unique(array_merge($this->headers, $headers));
        $output = array();
        foreach ($headers as $key => $value) {
            $output[trim($key)] = $value;
        }
        $this->headers = $output;
    }

    /**
     * set the curl referer
     *
     * @return void
     * @access protected
    **/
    public function set_referer($referer) {
        $this->referer = $referer;
    }

    /**
     * Set the associated CURL options for a request method
     *
     * @param string $method
     * @return void
     * @access protected
    **/
    protected function set_request_method($method) {
        switch (strtoupper($method)) {
            case 'HEAD':
                curl_setopt($this->request, CURLOPT_NOBODY, true);
                break;
            case 'GET':
                curl_setopt($this->request, CURLOPT_HTTPGET, true);
                break;
            case 'POST':
                curl_setopt($this->request, CURLOPT_POST, true);
                break;
            default:
                curl_setopt($this->request, CURLOPT_CUSTOMREQUEST, $method);
        }
        $this->method = strtoupper($method);
    }

    /**
     * Sets the CURLOPT options for the current request
     *

     * @param string $vars
     * @return void
     * @access protected
    **/
    protected function set_request_options($uri, $vars) {
        $url = rtrim($this->url, "/")."/".$uri;
        if (!empty($vars)) {
            if($this->method == 'GET'){
                $url = rtrim($url, '?').'?';
                $url .= http_build_query($vars, '', '&');
            }else{
                $json_data = null;
                if(is_array($vars)){
                    $json_data = http_build_query($vars, '', '&');
                }else{
                    $json_data = $vars;
                }
                curl_setopt($this->request, CURLOPT_POSTFIELDS, $json_data);
            }
        }
        // echo "ok\n";
        // echo $url;
        // print_r($this->headers );
        curl_setopt($this->request, CURLOPT_URL, $url);
        # Set some default CURL options
        curl_setopt($this->request, CURLOPT_HEADER, true);
        curl_setopt($this->request, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($this->request, CURLINFO_HEADER_OUT, true);
        curl_setopt($this->request, CURLOPT_USERAGENT, $this->user_agent);

        if ($this->follow_redirects) curl_setopt($this->request, CURLOPT_FOLLOWLOCATION, true);
        if ($this->referer) curl_setopt($this->request, CURLOPT_REFERER, $this->referer);

        # Set any custom CURL options
        foreach ($this->options as $option => $value) {
            curl_setopt($this->request, constant('CURLOPT_'.str_replace('CURLOPT_', '', strtoupper($option))), $value);
        }
    }

    /**
     * Makes an HTTP request of the specified $method to a $this->url with an optional array or string of $vars
     *
     * Returns an object if the request was successful, false otherwise
     *
     * @param string $method
     * @param array|string $vars
     * @return |boolean
    **/
    function request($method, $uri, $vars = array()) {
        $this->error = '';
        $this->request = curl_init();

        $this->set_request_method($method);
        $this->set_request_options($uri, $vars);
        $this->set_request_headers();
        $response = curl_exec($this->request);
        if ($response) {
            $response = new CurlResponse($response);
        } else {
            $this->error = curl_errno($this->request).' - '.curl_error($this->request);
        }

        curl_close($this->request);
        return $response;
    }
}
