$(function() {

    Parse.$ = jQuery;

    //   ======================================================================
    //   Initialize Parse with your Parse "Application ID" and "Javascript Key".
    //   After register Parse.com and create a new app, please replace here with
    //   your Parse token!
    //   ======================================================================
    Parse.initialize("RU4BgvMuXnlkHDle7VH9EKMapirGjza9Gh3ZgrAR","3ev5gFZeFKSVG6ZPQysKJuK7ncyPIMp6Q2erPJ17");

    var dropzone = function() {
        $('#dropzone').on('dragover', function() {
            $(this).addClass('hover');
        });
        $('#dropzone').on('dragleave', function() {
            $(this).removeClass('hover');
        });
        $('#dropzone input').on('change', function(e) {
            var file = this.files[0];
            $('#dropzone').removeClass('hover');
            // if (!file.type.match('image.*')) {
            //     continue;
            // }
            $('#dropzone').addClass('dropped');
            $('#dropzone img').remove();
            if ((/^image\/(gif|png|jpeg)$/i).test(file.type)) {
                var reader = new FileReader(file);
                reader.readAsDataURL(file);
                reader.onload = function(e) {
                    var data = e.target.result,
                        $img = $('<img />').attr('src', data).width(150).height(150).fadeIn();
                    $('#dropzone div').html($img);
                };
            } else {
                var ext = file.name.split('.').pop();
                $('#dropzone div').html(ext);
            }
        });
    };

    var $container = $('.main-container'),

        Project = Parse.Object.extend('Project'),
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

        Step = Parse.Object.extend('Step'),
        Steps = Parse.Collection.extend({
            model: Step,
            query: (new Parse.Query(Step)).ascending('order')
        }),
        StepsView = Parse.View.extend({
            template: Handlebars.compile($('#steps-tpl').html()),
            render: function() { 
                var collection = { step: this.collection.toJSON() };
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
                        alert("success, welcome " + user.getUsername());
                        router.navigate('#/project', { trigger: true });
                    },
                    error: function(user, error) {
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
                // Set ACL control to each Project object
                var projectACL = new Parse.ACL(user);
                projectACL.setReadAccess(user, true);
                projectACL.setWriteAccess(user, true);

                newProject.set("host", user);
                newProject.set("title", title);
                newProject.set("description", description);
                newProject.setACL(projectACL);

                newProject.save().then(function() {
                    // Navigate to upload photo page which belongs to this project
                    router.navigate('#/shoot/'+ newProject.id, { trigger: true });
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
            },
            start: function(){
                Parse.history.start({
                });
            },
            // This is where you map functions to urls.
            // e.g. '{{URL pattern}}': '{{function name}}'
            routes: {
                '': 'index',
                'index': 'index',
                'project': 'project',
                'project/': 'project',
                'project/:id': 'step',
                'shoot/:id': 'shoot',
                'login': 'index',
                'create': 'create',
                // 'edit/:id': 'edit',
                // 'del/:id': 'del',
                // 'logout': 'logout',
            },
            index: function() {
                var loginView = new LoginView();
                loginView.render();
                $container.html(loginView.el);
            },
            project: function() {
                // List of projects which user has Read Access to control
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
            step: function(id) {
                // List of steps(photos, commits, description...) for each projects
                if (!Parse.User.current()) {
                    this.navigate('#/', { trigger: true });
                } else {
                    var projectQuery = new Parse.Query("Project");
                    var matchProject = new Parse.Object("Project");
                    matchProject.id = id;

                    var stepQuery = new Parse.Query("Step").equalTo("project", matchProject).ascending('order');
                    collection = stepQuery.collection();
                    // Fetch steps only in Project with this ObjectId
                    collection.fetch().then(function(steps){
                        // Render steps
                        var stepsView = new StepsView({ collection: steps });
                        stepsView.render();
                        $container.html(stepsView.el);
                        $("#add-new-steps").append('<a href="#/shoot/'+id+'">Add New Steps</a>');
                    });
                }
            },
            shoot: function(id) {
                // Render upload photo page
                if (!Parse.User.current()) {
                    this.navigate('#/', { trigger: true });
                } else {
                    var self = this,
                        query = new Parse.Query("Project"),
                        addPhotoView = new AddPhotoView();
                    query.get(id, {
                        success: function() {
                            addPhotoView.render();
                            $container.html(addPhotoView.el);
                            // Render dropzone and wait for file dropping or adding
                            $("#back-to-edit").append('<a href="#/project/'+id+'">Edit Steps</a>');
                            dropzone();
                            // Click event to start uploading
                            $('#uploadBtn').click(function (e) {
                                // Prevent default submit event
                                e.preventDefault();

                                var fileUploadControl = $("#fileupload")[0];
                                var commit = $("#commit").val();
                                writeConsole("<p>Uploading photo...</p>");
                                if (fileUploadControl.files.length > 0) {
                                    var photoFile = fileUploadControl.files[0];
                                    var name = "photo.jpg";
                                    var parseFile = new Parse.File(name, photoFile);
                                    // Save photos to Parse cloud first
                                    parseFile.save().then(function() {
                                        writeConsole("<p>Almost there...</p>");
                                        var step = new Parse.Object("Step");
                                        var project = new Parse.Object("Project");
                                        project.id = id;

                                        var queryStep = new Parse.Query("Step");
                                        var orderMax = 0;
                                        queryStep.equalTo("project", project);
                                        queryStep.descending("order");
                                        queryStep.first().then(function(result) {
                                            if (typeof(result) !== 'undefined') {
                                                // Onlt if this is a existing project
                                                orderMax = result.get("order");
                                            }
                                            step.set("uploadedBy", Parse.User.current());
                                            step.set("project", project);
                                            step.set("order", orderMax+1);
                                            step.set("photo", parseFile);
                                            step.set("imgUrl", parseFile.url());
                                            step.set("commit", commit);
                                            step.save().then(function() {
                                                // The file has been saved to Parse.
                                                writeConsole("<p>Completed.</p>");
                                                // Render again
                                                Parse.history.stop();
                                                Parse.history.start();
                                            }, function(error) {
                                                // The file either could not be read, or could not be saved to Parse.
                                                alert(error);
                                            });
                                        });
                                    });
                                };
                            });
                        },
                        error: function() {
                            alert("Please add new project or choose existing one");
                            self.navigate('#/project', { trigger: true });
                        }
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
        }),
        router = new Router();

    router.start();
});