$(function() {

    Parse.$ = jQuery;

    // Replace this line with your Parse token
    Parse.initialize("RU4BgvMuXnlkHDle7VH9EKMapirGjza9Gh3ZgrAR","3ev5gFZeFKSVG6ZPQysKJuK7ncyPIMp6Q2erPJ17");

    var $container = $('.main-container'),

        // ProjectView = Parse.View.extend({
        //     template: Handlebars.compile($('#project-tpl').html()),
        //     render: function() { 
        //         var self = this,
        //             attributes = this.model.toJSON(),
        //             // Create a collection base on that new query
        //             collection = query.collection();
        //         // Fetch the collection
        //         collection.fetch().then(function(comments) {
        //             // Store the comments as a JSON object and add it into attributes object
        //             attributes.comment = comments.toJSON();
        //             self.$el.html(self.template(attributes));
        //         });
        //     }
        // }),

        

        Project = Parse.Object.extend('Project', {
            update: function(data) {
                // Only set ACL if the project doesn't have it
                if ( !this.get('ACL') ) {
                    // Create an ACL object to grant access to the current user 
                    // (also the author of the newly created project)
                    var projectACL = new Parse.ACL(Parse.User.current());
                    // Grant read-read only access to the public so everyone can see it
                    projectACL.setPublicReadAccess(true);
                    // Set this ACL object to the ACL field
                    this.setACL(projectACL);
                }

                this.set({
                    'title': data.title,
                    'description': data.description,
                    // Set author to the existing project author if editing, use current user if creating
                    // The same logic goes into the following three fields
                    'host': this.get('host') || Parse.User.current(),
                }).save(null, {
                    success: function(project) {
                        router.navigate('#/index', { trigger: true });
                    },
                    error: function(blog, error) {
                        console.log(project);
                        console.log(error);
                    }
                });
            }
        }),

        Projects = Parse.Collection.extend({
            model: Project,
            query: (new Parse.Query(Project)).descending('createdAt')
        }),

        ProjectsView = Parse.View.extend({
            template: Handlebars.compile($('#projects-tpl').html()),
            render: function() { 
                var collection = { project: this.collection.toJSON() };
                this.$el.html(this.template(collection));
            }
        }),

        NewProject = Parse.View.extend({
            template: Handlebars.compile($('#new-project-tpl').html()),
            events: {
                'fileupload #fileupload': 'upload'
            },
            upload: $('#fileupload').fileupload({
                        dataType: 'json',
                        add: function (e, data) {
                            data.context = $('<button/>').text('Upload')
                                .appendTo(document.body)
                                .click(function () {
                                    data.context = $('<p/>').text('Uploading...').replaceAll($(this));
                                    data.submit();
                                });
                        },
                        done: function (e, data) {
                            $.each(data.result.files, function (index, file) {
                                $('<p/>').text(file.name).appendTo(document.body);
                            });
                        },
                        progressall: function (e, data) {
                        var progress = parseInt(data.loaded / data.total * 100, 10);
                        $('#progress .progress-bar').css(
                            'width',
                            progress + '%'
                        )}
                    }),
            render: function(){
                this.$el.html(this.template());
            }
        }),

        LoginView = Parse.View.extend({
            template: Handlebars.compile($('#login-tpl').html()),
            events: {
                'click #signUpBtn': 'signUp',
                'click #signInBtn': 'login'
            },
            signUp: function(){
                var user = new Parse.User();
                // user.set("email", email); //optional
                user.set("username", $('#inputUsername').val()); //required
                user.set("password", $('#inputPassword').val()); //required
                writeConsole("<p>Processing.....</p>");
                user.signUp(null, {
                    success: function(user) {
                        writeConsole("<p>Completed.</p>");
                        alert("success, signed up!");
                    },
                    error: function(user, error) {
                        writeConsole("<p>Error occurred.</p>");
                        alert("Error: " + error.code + " " + error.message);
                    }
                });
            },
            login: function(){
                var n = $('#inputUsername').val();
                var p = $('#inputPassword').val();
                Parse.User.logIn(n, p, {
                    success: function(user) {
                        // writeConsole("<p>Completed.</p>");
                        alert("success, welcome " + user.getUsername());
                        router.navigate('#/project', { trigger: true });
                    },
                    error: function(user, error) {
                        // writeConsole("<p>Error occurred.</p>");
                        alert("Error: " + error.code + " " + error.message);
                    }
                });
            },
            render: function(){
                this.$el.html(this.template());
            }
        }),


        Router = Parse.Router.extend({

            // Here you can define some shared variables
            initialize: function(options){
                this.projects = new Projects();
                // this.categories = new Categories();
            },
            
            // This runs when we start the router. Just leave it for now.
            start: function(){
                Parse.history.start({
                    // put in your directory below
                    // root: '//'
                });
                // this.categories.fetch().then(function(categories){
                //     var categoriesView = new CategoriesView({ collection: categories });
                //     categoriesView.render();
                //     $('.blog-sidebar').html(categoriesView.el);
                // });
            },

            // This is where you map functions to urls.
            // Just add '{{URL pattern}}': '{{function name}}'
            routes: {
                '': 'index',
                'index': 'index',
                'project': 'project',
                'new_project': 'new_project',
                // 'admin': 'admin',
                'login': 'index',
                // 'add': 'add',
                // 'edit/:id': 'edit',
                // 'del/:id': 'del',
                // 'logout': 'logout',
                // 'category/:id': 'category'
            },

            index: function() {
                var loginView = new LoginView();
                loginView.render();
                $container.html(loginView.el);
            },

            // category: function(id) {
            //     // Get the current category object
            //     var query = new Parse.Query(Category);
            //     query.get(id, {
            //         success: function(category) {
            //             // Query to get the blogs under that category
            //             var blogQuery = new Parse.Query(Blog).equalTo("category", category).descending('createdAt');
            //             collection = blogQuery.collection();
            //             // Fetch blogs
            //             collection.fetch().then(function(blogs){
            //                 // Render blogs
            //                 var blogsView = new BlogsView({ collection: blogs });
            //                 blogsView.render();
            //                 $container.html(blogsView.el);
            //             });
            //         },
            //         error: function(category, error) {
            //             console.log(error);
            //         }
            //     });
            // },
            project: function() {
                this.projects.fetch({
                    success: function(projects) {
                        var projectsView = new ProjectsView({ collection: projects });
                        projectsView.render();
                        $container.html(projectsView.el);
                    },
                    error: function(blogs, error) {
                        console.log(error);
                    }
                });
            },

            new_project: function() {
                var newProject = new NewProject();
                newProject.render();
                $container.html(newProject.el);
            }

            // admin: function() {
            //     var currentUser = Parse.User.current();

            //     // Check login
            //     if (!currentUser) {
            //         this.navigate('#/login', { trigger: true });
            //     } else {
            //         this.blogs.fetch({
            //             success: function(blogs) {
            //                 var blogsAdminView = new BlogsAdminView({ 
            //                     // Pass in current username to be rendered in #admin-tpl
            //                     username: currentUser.get('username'),
            //                     collection: blogs 
            //                 });
            //                 blogsAdminView.render();
            //                 $container.html(blogsAdminView.el);
            //             },
            //             error: function(blogs, error) {
            //                 console.log(error);
            //             }
            //         });
            //     }
            // },
            // login: function() {
            //     var loginView = new LoginView();
            //     loginView.render();
            //     $container.html(loginView.el);
            // },
            // add: function() {
            //     // Check login
            //     if (!Parse.User.current()) {
            //         this.navigate('#/login', { trigger: true });
            //     } else {
            //         var writeprojectView = new WriteprojectView();
            //         writeprojectView.render();
            //         $container.html(writeprojectView.el);
            //     }
            // },
            // edit: function(id) {
            //     // Check login
            //     if (!Parse.User.current()) {
            //         this.navigate('#/login', { trigger: true });
            //     } else {
            //         var query = new Parse.Query(Blog);
            //         query.get(id, {
            //             success: function(blog) {
            //                 var writeprojectView = new WriteprojectView({ model: blog });
            //                 writeprojectView.render();
            //                 $container.html(writeprojectView.el);
            //             },
            //             error: function(blog, error) {
            //                 console.log(error);
            //             }
            //         });
            //     }
            // },
            // del: function(id) {
            //     if (!Parse.User.current()) {
            //         this.navigate('#/login', { trigger: true });
            //     } else {
            //         var self = this,
            //             query = new Parse.Query(Blog);
            //         query.get(id).then(function(blog){
            //             blog.destroy().then(function(blog){
            //                 self.navigate('admin', { trigger: true });
            //             })
            //         });
            //     }
            // },
            // logout: function () {
            //     Parse.User.logOut();
            //     this.navigate('#/login', { trigger: true });
            // }
        }),
        router = new Router();

    router.start();
});