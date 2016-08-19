    
(function () {

    var endpoints = {
        "https://graph.windows.net/isvtools.onmicrosoft.com": "https://graph.windows.net/isvtools.onmicrosoft.com",
    }; 

    // Enter Global Config Values & Instantiate ADAL AuthenticationContext
    window.config = {
        instance: 'https://login.microsoftonline.com/',
        tenant: 'isvtools.onmicrosoft.com',
        clientId: 'fe3ba0e1-1cac-4fe7-9d2e-41f2d8c05d66',
        postLogoutRedirectUri: window.location.origin,
        cacheLocation: 'localStorage', // enable this for IE, as sessionStorage does not work for localhost.
        endpoints: endpoints,
    };
    var authContext = new AuthenticationContext(config);

    // Get UI jQuery Objects
    var $panel = $(".panel-body");
    var $userDisplay = $(".app-user");
    var $signInButton = $(".app-login");
    var $signOutButton = $(".app-logout");
    var $errorMessage = $(".app-error");

    // Check For & Handle Redirect From AAD After Login
    var isCallback = authContext.isCallback(window.location.hash);
    authContext.handleWindowCallback();
    $errorMessage.html(authContext.getLoginError());

    if (isCallback && !authContext.getLoginError()) {
        window.location = authContext._getItem(authContext.CONSTANTS.STORAGE.LOGIN_REQUEST);
    }

    // Check if user is signed in & sign them in
    var token = authContext.getCachedToken(authContext.config.clientId);
    if (token == null) {
        authContext._renewIdToken(function (error, token) {

            console.log('in acquire token');

            // Handle ADAL Error
            if (error || !token) {
r
                console.log('error');
                console.log('user is not logged in');
                var $errorMessage = $(".app-error");
                $errorMessage.html('ADAL Error Occurred: ' + error);
                return;
            }

            console.log(token);

            // Check Login Status, Update UI
            var user = authContext.getCachedUser();
            if (user) {
                $userDisplay.html(user.userName);
                $userDisplay.show();
                $signInButton.hide();
                $signOutButton.show();
            } else {
                $userDispy.empty();
                $userDisplay.hide();
                $signInButton.show();
                $signOutButton.hide();
            }

            // integrate Azure AD Graph 
            authContext.acquireToken("https://graph.windows.net/", function (error, token) {
                console.log(error);
                console.log('graph token'); 
                console.log(token);

                var id; 
                
                //var requestUrl = "https://graph.microsoft.com/beta/servicePrincipals?$filter=displayName eq 'smartsheet'"; 
                $.ajax({
                    //url: "https://graph.windows.net/isvtools.onmicrosoft.com/servicePrincipals?api-version=1.6",
                    url: "https://graph.windows.net/isvtools.onmicrosoft.com/servicePrincipals?api-version=1.6&$filter=displayName eq 'Azure Portal'",
                    type: "GET",
                    beforeSend: function (xhr) { xhr.setRequestHeader('authorization', 'Bearer ' + token); },
                    success: function (data) {
                        console.log(data);
                        // parse through and get id 

                    }
                });

            });
            

        });

    } else {
        // Check Login Status, Update UI
        var user = authContext.getCachedUser();
        if (user) {
            $userDisplay.html(user.userName);
            $userDisplay.show();
            $signInButton.hide();
            $signOutButton.show();
        } else {
            $userDisplay.empty();
            $userDisplay.hide();
            $signInButton.show();
            $signOutButton.hide();
        }

        /*// integrate Azure AD Graph 
        authContext.acquireToken("https://graph.windows.net/isvtools.onmicrosoft.com", function (error, token) {
            console.log(error);
            console.log(token);

            //var requestUrl = "https://graph.microsoft.com/beta/servicePrincipals?$filter=displayName eq 'smartsheet'"; 
            $.ajax({
                url: "https://graph.windows.net/isvtools.onmicrosoft.com/servicePrincipals",
                type: "GET",
                beforeSend: function (xhr) { xhr.setRequestHeader('authorization', 'Bearer' + token); },
                success: function () { alert('Success!' + authHeader); }
            });

        });*/


    }

    // Handle Navigation Directly to View
    window.onhashchange = function () {
        loadView(stripHash(window.location.hash));
    };
    window.onload = function () {
        $(window).trigger("hashchange");
    };

    // Register NavBar Click Handlers
    $signOutButton.click(function () {
        authContext.logOut();
    });
    $signInButton.click(function () {
        authContext.login();
    });

    // Route View Requests To Appropriate Controller
    function loadCtrl(view) {
        switch (view.toLowerCase()) {
            case 'home':
                return homeCtrl;
            case 'todolist':
                return todoListCtrl;
            case 'userdata':
                return userDataCtrl;
        }
    }

    // Show a View
    function loadView(view) {

        $errorMessage.empty();
        var ctrl = loadCtrl(view);

        if (!ctrl)
            return;

        // Check if View Requires Authentication
        if (ctrl.requireADLogin && !authContext.getCachedUser()) {
            authContext.config.redirectUri = window.location.href;
            return;
        }

        // Load View HTML
        $.ajax({
            type: "GET",
            url: "App/Views/" + view + '.html',
            dataType: "html",
        }).done(function (html) {

            // Show HTML Skeleton (Without Data)
            var $html = $(html);
            $html.find(".data-container").empty();
            $panel.html($html.html());
            ctrl.postProcess(html);

        }).fail(function () {
            $errorMessage.html('Error loading page.');
        }).always(function () {

        });
    };

    function stripHash(view) {
        return view.substr(view.indexOf('#') + 1);
    }

}());

        


