$(function() {

    Parse.$ = jQuery;

    //   ======================================================================
    //   Initialize Parse with your Parse "Application ID" and "Javascript Key".
    //   After register Parse.com and create a new app, please replace here with
    //   your Parse token!
    //   ======================================================================
    Parse.initialize("RU4BgvMuXnlkHDle7VH9EKMapirGjza9Gh3ZgrAR","3ev5gFZeFKSVG6ZPQysKJuK7ncyPIMp6Q2erPJ17");

    window._currentImage = null;
    window._transformCanvas = null;

    Handlebars.registerHelper('getUrl', function(photo, photo2) {
      var valid = photo? photo : photo2;
      return valid.url || "";
    });

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
            if ((/^image\/(gif|png|jpeg|jpg)$/i).test(file.type)) {
                var reader = new FileReader(file);
                reader.readAsDataURL(file);
                reader.onload = function(e) {
                    var data = e.target.result,
                        $img = $('<img />').attr('src', data).width('100%').fadeIn(),
                        $imgOriginal = $('<img />').attr('src', data);
                    $('#dropzone div').html($img);
                    // _currentImage = $imgOriginal[0];
                    // getOrientation(file, function(orientation){
                    //     if(orientation > 1){
                    //         // var canvas = document.getElementById('testCanvas');
                    //         var canvas = document.createElement('canvas');
                    //         var context = canvas.getContext('2d');
                    //         var width = _currentImage.width;
                    //         var height = _currentImage.height;
                    //         if(orientation == 3){
                    //             canvas.width = width;
                    //             canvas.height = height;
                    //             context.transform(-1, 0, 0, -1, width, height);
                    //         }else if(orientation == 6){
                    //             // context.rotate(180);
                    //             canvas.width = height;
                    //             canvas.height = width;
                    //             context.transform(0, 1, -1, 0, height , 0);
                    //         }else if(orientation == 8){
                    //             canvas.width = height;
                    //             canvas.height = width;
                    //             context.transform(0, -1, 1, 0, 0, width);
                    //         }
                    //         context.drawImage(_currentImage, 0, 0);
                    //         // alert(orientation);
                    //         _transformCanvas = canvas;
                    //     }
                    // });
                };
                // getOrientation(file, function(a){
                //     alert(a);
                // });
            } else {
                var ext = file.name.split('.').pop();
                $('#dropzone div').html(ext);
            }
        });
    };

    var $container = $('#main-container'),

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
                'click #signInBtn': 'login',
                'click #sendResetMail': 'forgotPassword'
            },
            signUp: function(e){
                // Prevent default submit event
                e.preventDefault();

                var user = new Parse.User();
                // user.set("email", email); //optional
                user.set("username", $('#inputUsername').val()); //required
                user.set("password", $('#inputPassword').val()); //required
                user.set("email", $('#inputUsername').val()); //same as username

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
            forgotPassword: function(e){
                // Prevent default submit event
                e.preventDefault();

                var n = $('#forgetMail').val();

                writeConsole("<p>Processing.....</p>");
                Parse.User.requestPasswordReset( n, {
                    success: function() {
                        // Password reset request was sent successfully
                        alert("The password reset link is send to your e-mail: " + n + ". Please check your mailbox and reset your password.");
                        location.reload();
                    },
                    error: function(error) {
                        // Show the error message somewhere
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
                newProject.set("hostName", user.attributes.username);
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
                        // If click "Edit", modal would show up
                        $('#edit-step').on('show.bs.modal', function (event) {
                            var button = $(event.relatedTarget);
                            var order = button.data('order');
                            var description = button.data('description');
                            var code = button.data('code-link');

                            var modal = $(this);
                            modal.find('.modal-title').text('Step ' + order);
                            modal.find('.modal-body #description-text').val(description);
                            modal.find('.modal-body #code-text').val(code);

                            $('#save-step-btn').click(function (e) {
                                var step = new Parse.Object("Step");
                                step.id = steps.models[order-1].id;

                                step.set('description', $("#description-text").val());
                                step.set('code', $("#code-text").val());
                                step.save().then(function() {
                                    $('.modal').modal('hide');
                                    Parse.history.stop();
                                    Parse.history.start();
                                }, function(e) {
                                    console.log(e);
                                });
                            });
                        });

                        $('.collapse').on('show.bs.collapse', function () {
                            var order = $(this).attr('order');
                            $('#delete-step-btn-'+order).click(function (e) {
                                var step = new Parse.Object("Step");
                                var nextStep = new Parse.Object("Step");

                                step.id = steps.models[order-1].id;
                                step.set('project', null);
                                
                                for (var i = order; i < steps.models.length; i++) {
                                    step.id = steps.models[order].id;
                                    step.set('order', steps.models[order].attributes.order-1);
                                }

                                step.save().then(function() {
                                    Parse.history.stop();
                                    Parse.history.start();
                                }, function(e) {
                                    console.log(e);
                                });
                            });
                        });
                        // to do rotation
                        doRotation();
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

                                var $btn = $(this).button('loading');

                                var fileUploadControl = $("#fileupload")[0];
                                var commit = $("#commit").val();

                                // Make sure at least one photo and it is under 5 MB.
                                if (fileUploadControl.files.length > 0 && fileUploadControl.files[0].size <= 5*1024*1024) {
                                    var toDoUpload = function(theFile) {
                                        var name = "photo.jpg";
                                        var parseFile = new Parse.File(name, theFile);
                                        // Save photos to Parse cloud first
                                        parseFile.save().then(function() {
                                            var step = new Parse.Object("Step");
                                            var project = new Parse.Object("Project");
                                            project.id = id;

                                            var queryStep = new Parse.Query("Step");
                                            var orderMax = 0;
                                            queryStep.equalTo("project", project);
                                            queryStep.descending("order");
                                            queryStep.first().then(function(result) {
                                                if (typeof(result) !== 'undefined') {
                                                    // Onlt if this is an existing project
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
                                                    // Render again
                                                    Parse.history.stop();
                                                    Parse.history.start();
                                                    _transformCanvas = null;
                                                }, function(error) {
                                                    // The file either could not be read, or could not be saved to Parse.
                                                    alert(error);
                                                });
                                            });
                                        });
                                    };
                                    // if(_transformCanvas){
                                    //     _transformCanvas.toBlob(function(blob){
                                    //         toDoUpload(new File([blob], "name"));
                                    //     });
                                    // }else{
                                    //     toDoUpload(fileUploadControl.files[0]);
                                    // }
                                    toDoUpload(fileUploadControl.files[0]);
                                } else {
                                    alert("Please add at least one photo and it should be under 5 MB.");
                                    $(uploadBtn).button("reset");
                                }
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

    // $("#compressTest")
    // $("#compressTestBtn").click(function(){
    //     var fileUploadControl = $("#compressTest")[0];
    //     // var commit = $("#commit").val();
    //     if (fileUploadControl.files.length > 0) {
    //         var toDoUpload = function(theFile){
    //             var name = "photo.jpg";
    //             var parseFile = new Parse.File(name, theFile);
    //             // Save photos to Parse cloud first
    //             parseFile.save().then(function() {
    //                 var step = new Parse.Object("PhotoCompressTest");
    //                 // var project = new Parse.Object("Project");
    //                 // project.id = id;
    //                 step.set("photo", parseFile);
    //                 step.set("imgUrl", parseFile.url());
    //                 // step.set("imgUrl", parseFile.url());
    //                 // step.set("commit", commit);
    //                 step.save().then(function(response) {
    //                     // The file has been saved to Parse.
    //                     // Render again
    //                     // Parse.history.stop();
    //                     // Parse.history.start();
    //                     // _transformCanvas = null;
    //                     console.log(response);
    //                 }, function(error) {
    //                     // The file either could not be read, or could not be saved to Parse.
    //                     alert(error);
    //                 });
    //             });
    //         };
    //         // if(_transformCanvas){
    //         //     _transformCanvas.toBlob(function(blob){
    //         //         toDoUpload(new File([blob], "name"));
    //         //     });
    //         // }else{
    //         //     toDoUpload(fileUploadControl.files[0]);
    //         // }
    //         toDoUpload(fileUploadControl.files[0]);
    //     };
    // });

});

function getOrientation(file, callback) {
    // var reader = new FileReader();
    // reader.onload = function(e) {

    //     var view = new DataView(e.target.result);
    //     if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
    //     var length = view.byteLength, offset = 2;
    //     while (offset < length) {
    //         var marker = view.getUint16(offset, false);
    //         offset += 2;
    //         if (marker == 0xFFE1) {
    //             if (view.getUint32(offset += 2, false) != 0x45786966) callback(-1);
    //             var little = view.getUint16(offset += 6, false) == 0x4949;
    //             offset += view.getUint32(offset + 4, little);
    //             var tags = view.getUint16(offset, little);
    //             offset += 2;
    //             for (var i = 0; i < tags; i++)
    //                 if (view.getUint16(offset + (i * 12), little) == 0x0112)
    //                     return callback(view.getUint16(offset + (i * 12) + 8, little));
    //         }
    //         else if ((marker & 0xFF00) != 0xFF00) break;
    //         else offset += view.getUint16(offset, false);
    //     }
    //     return callback(-1);
    // };
    // reader.readAsArrayBuffer(file.slice(0, 64 * 1024));

    // var base64 = file.split(',').pop();
    // var binary_string = atob(base64);
    // var len = binary_string.length;
    // var bytes = new Uint8Array( len );
    // for (var i = 0; i < len; i++)        {
    //     bytes[i] = binary_string.charCodeAt(i);
    // }
    // var view = new DataView(bytes.buffer);
    var view = new DataView(file);
    if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
    var length = view.byteLength, offset = 2;
    while (offset < length) {
        var marker = view.getUint16(offset, false);
        offset += 2;
        if (marker == 0xFFE1) {
            if (view.getUint32(offset += 2, false) != 0x45786966) callback(-1);
            var little = view.getUint16(offset += 6, false) == 0x4949;
            offset += view.getUint32(offset + 4, little);
            var tags = view.getUint16(offset, little);
            offset += 2;
            for (var i = 0; i < tags; i++)
                if (view.getUint16(offset + (i * 12), little) == 0x0112)
                    return callback(view.getUint16(offset + (i * 12) + 8, little));
        }
        else if ((marker & 0xFF00) != 0xFF00) break;
        else offset += view.getUint16(offset, false);
    }
    return callback(-1);
}

function doRotation(){
    // xhr.responseType = 'arraybuffer';
    $('.blog-post img').each(function(idx){
        // "this" is native imgae
        // var originCanvas = document.createElement('canvas');
        // var originContext = originCanvas.getContext('2d'); 
        // var w = this.width;
        // var h = this.height;
        // // canvas.width = this.width;
        // // canvas.height = this.height;
        // originCanvas.width = w; originCanvas.height = h;
        // originContext.drawImage(this,0,0,w,h);

        var newImg = new Image();
        // fix this bug: Uncaught SecurityError: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported.
        newImg.setAttribute('crossOrigin', 'anonymous');
        newImg.onload = (function(scope, origin){
            return function(){
                var xhr = new XMLHttpRequest();
                xhr.open('GET', origin.alt, true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = (function(img, originImage){
                    // console.log(img);
                    // console.log(originImage);
                    return function(e) {
                        getOrientation(this.response, function(orientation){
                            if(orientation > 1){
                                // $(originImage).hide();
                                // var canvas = document.getElementById('testCanvas');
                                var canvas = document.createElement('canvas');
                                var context;
                                var width = img.width;
                                var height = img.height;
                                if(orientation == 3){
                                    canvas.width = width;
                                    canvas.height = height;
                                    context = canvas.getContext('2d');
                                    context.transform(-1, 0, 0, -1, width, height);
                                }else if(orientation == 6){
                                    // context.rotate(180);
                                    canvas.width = height;
                                    canvas.height = width;
                                    context = canvas.getContext('2d');
                                    context.transform(0, 1, -1, 0, height , 0);
                                }else if(orientation == 8){
                                    canvas.width = height;
                                    canvas.height = width;
                                    context = canvas.getContext('2d');
                                    context.transform(0, -1, 1, 0, 0, width);
                                }
                                context.drawImage(img, 0, 0);
                                // alert(orientation);
                                // _transformCanvas = canvas;
                                var url = canvas.toDataURL();
                                originImage.src = url;
                                // $(originImage).show();
                            }else{
                                originImage.src = originImage.alt;
                            }
                        });
                    };
                })(scope, origin);
                xhr.send();
            };
        })(newImg, this);

        setTimeout((function(tmpimg, oldimg){
            return function(){ tmpimg.src = oldimg.alt; };
        })(newImg, this), idx * 200);

        // newImg.src = this.alt;
    });
}

