<div method="get" id="full-search" class="fixed top-0 left-0 z-50 flex flex-col hidden w-screen h-screen p-4 cursor-auto backdrop-blur-sm bg-black/40" tabindex="0">
    <div class="flex flex-col w-full max-w-3xl min-h-0 mx-auto bg-white rounded-sm shadow-md">
        <div class="relative z-10 flex items-center flex-none px-4">
            <form class="flex items-center flex-1 w-full min-w-0 mb-0">
                <label>
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <path d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </label>

                <input class="flex-1 h-12 min-w-0 pl-0 ml-3 mr-4 text-base font-light text-gray-900 bg-transparent border-0 appearance-none focus-outline-none focus:outline-none focus:ring-0" autocomplete="off" autocorrect="off" autocapitalize="off" enterkeyhint="go" spellcheck="false" placeholder="Search..." maxlength="64" type="text" value="<?php echo get_query_var('s'); ?>" name="s">
            </form>
            <a href="#!" class="flex-none text-gray-600 rounded-md appearance-none" type="reset">
                <svg class="w-5 h-5" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 21.32L21 3.32001" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M3 3.32001L21 21.32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            </a>
        </div>
    </div>
</div>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        window.addEventListener('hashchange', function() {
            var fullSearch = document.querySelector('#full-search');
            if (window.location.hash === '#!search') {
                fullSearch && fullSearch.classList.remove('hidden');
            } else {
                fullSearch && fullSearch.classList.add('hidden');
            }
        });
        if (window.location.hash === '#!search') {
            var fullSearch = document.querySelector('#full-search');
            fullSearch && fullSearch.classList.remove('hidden');
        }

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                window.location.hash = '';
            }
        });
    });
</script>