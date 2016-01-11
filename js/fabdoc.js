$(function() {

    Parse.$ = jQuery;

    // Replace this line with your Parse token
    Parse.initialize("RU4BgvMuXnlkHDle7VH9EKMapirGjza9Gh3ZgrAR","3ev5gFZeFKSVG6ZPQysKJuK7ncyPIMp6Q2erPJ17");

    function dropzone() {
        $('#dropzone').on('dragover', function() {
            $(this).addClass('hover');
        });
          
        $('#dropzone').on('dragleave', function() {
            $(this).removeClass('hover');
        });
          
        $('#dropzone input').on('change', function(e) {
            var file = this.files[0];

            $('#dropzone').removeClass('hover');
            
            // if (this.accept && $.inArray(file.type, this.accept.split(/, ?/)) == -1) {
            //     return alert('File type not allowed.');
            // }
            
            $('#dropzone').addClass('dropped');
            $('#dropzone img').remove();
            
            if ((/^image\/(gif|png|jpeg)$/i).test(file.type)) {
                var reader = new FileReader(file);

                reader.readAsDataURL(file);
                  
                reader.onload = function(e) {
                    var data = e.target.result,
                        $img = $('<img />').attr('src', data).fadeIn();
                    
                    $('#dropzone div').html($img);
                };
            } else {
                var ext = file.name.split('.').pop();
                  
                $('#dropzone div').html(ext);
            }
        });
    };


    var $container = $('.main-container'),

        Project = Parse.Object.extend('Project', {
            update: function(data) {
                // Only set ACL if the project doesn't have it
                // if ( !this.get('ACL') ) {
                //     // Create an ACL object to grant access to the current user 
                //     // (also the author of the newly created project)
                //     var projectACL = new Parse.ACL(Parse.User.current());
                //     // Grant read-read only access to the public so everyone can see it
                //     projectACL.setPublicReadAccess(true);
                //     // Set this ACL object to the ACL field
                //     this.setACL(projectACL);
                // }

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
                    error: function(project, error) {
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

        AddPhotoView = Parse.View.extend({
            template: Handlebars.compile($('#add-photo-tpl').html()),
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
            signUp: function(e){
                // Prevent default submit event
                e.preventDefault();

                var user = new Parse.User();
                // user.set("email", email); //optional
                user.set("username", $('#inputUsername').val()); //required
                user.set("password", $('#inputPassword').val()); //required
                writeConsole("<p>Processing.....</p>");
                user.signUp(null, {
                    success: function(user) {
                        writeConsole("<p>Completed.</p>");
                        alert("success, signed up");
                        router.navigate('#/project', { trigger: true });
                    },
                    error: function(user, error) {
                        writeConsole("<p>Error occurred.</p>");
                        alert("Error: " + error.code + " " + error.message);
                    }
                });
            },
            login: function(e){
                // Prevent default submit event
                e.preventDefault();

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

        CreateProjectView = Parse.View.extend({
            template: Handlebars.compile($('#create-project-tpl').html()),
            events: {
                'click #startAddPhotoBtn': 'addPhoto'
            },
            addPhoto: function(e){
                // Prevent default submit event
                e.preventDefault();

                var user = Parse.User.current();
                var title = $("#title").val();
                var description = $("#description").val();

                var NewProject = Parse.Object.extend("Project");
                var newProject = new NewProject();
                var projectACL = new Parse.ACL(user);
                
                projectACL.setReadAccess(user, true);
                projectACL.setWriteAccess(user, true);

                newProject.set("title", title);
                newProject.set("description", description);
                newProject.set("host", user);
                newProject.setACL(projectACL);

                newProject.save().then(function() {
                    router.navigate('#/shoot', { trigger: true });
                }, function(error) {
                    alert(error);
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
                'shoot': 'shoot',
                // 'admin': 'admin',
                'login': 'index',
                'create': 'create',
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

            project: function() {
                if (!Parse.User.current()) {
                    this.navigate('#/', { trigger: true });
                } else {
                    this.projects.fetch({
                        success: function(projects) {
                            var projectsView = new ProjectsView({ collection: projects });
                            projectsView.render();
                            $container.html(projectsView.el);
                        },
                        error: function(projects, error) {
                            console.log(error);
                        }
                    });
                }
            },

            shoot: function() {
                if (!Parse.User.current()) {
                    this.navigate('#/', { trigger: true });
                } else {
                    var addPhotoView = new AddPhotoView();
                    addPhotoView.render();
                    $container.html(addPhotoView.el);

                    dropzone();

                    $('#uploadBtn').click(function (e) {
                        // Prevent default submit event
                        e.preventDefault();

                        console.log(1);
                        var fileUploadControl = $("#fileupload")[0];
                        console.log(fileUploadControl.files);
                        if (fileUploadControl.files.length > 0) {
                            var photoFile = fileUploadControl.files[0];
                            var name = "photo.jpg";
                            var parseFile = new Parse.File(name, photoFile);
                            parseFile.save().then(function() {
                                var step = new Parse.Object("Step");
                                console.log(2);
                                step.set("order",1);
                                step.set("photo", parseFile);
                                step.set("commit", "first photo in test");
                                step.set("description", "hello world, I am fablab!");
                                step.save().then(function() {
                                // The file has been saved to Parse.
                                    addPhotoView.render();
                                    $container.html(addPhotoView.el);
                                }, function(error) {
                                    alert(error);
                                // The file either could not be read, or could not be saved to Parse.
                                });
                            });
                        };
                    });
                }
            },
            
            create: function() {
                if (!Parse.User.current()) {
                    this.navigate('#/', { trigger: true });
                } else {
                    var createprojectView = new CreateProjectView();
                    createprojectView.render();
                    $container.html(createprojectView.el);
                }
            }
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