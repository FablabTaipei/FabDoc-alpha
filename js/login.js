$(function() {

    Parse.$ = jQuery;


    Parse.initialize(
        "RU4BgvMuXnlkHDle7VH9EKMapirGjza9Gh3ZgrAR",
            "3ev5gFZeFKSVG6ZPQysKJuK7ncyPIMp6Q2erPJ17"
        );


    // var Blog = Parse.Object.extend('Blog', {
    //         update: function(data) {
    //             // Only set ACL if the blog doesn't have it
    //             if ( !this.get('ACL') ) {
    //                 // Create an ACL object to grant access to the current user 
    //                 // (also the author of the newly created blog)
    //                 var blogACL = new Parse.ACL(Parse.User.current());
    //                 // Grant read-read only access to the public so everyone can see it
    //                 blogACL.setPublicReadAccess(true);
    //                 // Set this ACL object to the ACL field
    //                 this.setACL(blogACL);
    //             }

    //             var category = new Category();
    //             category.id = data.category;

    //             this.set({
    //                 'title': data.title,
    //                 'category': category,
    //                 'summary': data.summary,
    //                 'content': data.content,
    //                 // Set author to the existing blog author if editing, use current user if creating
    //                 // The same logic goes into the following three fields
    //                 'author': this.get('author') || Parse.User.current(),
    //                 'authorName': this.get('authorName') || Parse.User.current().get('username'),
    //                 'time': this.get('time') || new Date().toDateString()
    //             }).save(null, {
    //                 success: function(blog) {
    //                     blogRouter.navigate('#/admin', { trigger: true });
    //                 },
    //                 error: function(blog, error) {
    //                     console.log(blog);
    //                     console.log(error);
    //                 }
    //             });
    //         }
    //     }),
    //     Comment = Parse.Object.extend('Comment', {
    //         add: function(data) {
    //             this.set({
    //                 'blog': data.blog,
    //                 'authorName': data.authorName,
    //                 'email': data.email,
    //                 'content': data.content
    //             }).save(null, {
    //                 success: function(comment) {
    //                     // Just reload the page so the author can see the comment being posted.
    //                     window.location.reload();
    //                 },
    //                 error: function(comment, error) {
    //                     console.log(blog);
    //                     console.log(error);
    //                 }
    //             });
    //         }
    //     }),
    //     Category = Parse.Object.extend('Category', {}),
    //     Blogs = Parse.Collection.extend({
    //         model: Blog,
    //         query: (new Parse.Query(Blog)).descending('createdAt')
    //     }),
    //     Categories = Parse.Collection.extend({
    //         model: Category
    //     }),
    // var BlogView = Parse.View.extend({
    //         template: Handlebars.compile($('#blog-tpl').html()),
    //         events: {
    //             'submit #form-comment': 'submit'
    //         },
    //         submit: function(e) {
    //             e.preventDefault();
    //             var data = $(e.target).serializeArray(),
    //                 comment = new Comment();
    //             comment.add({
    //                 blog: this.model,
    //                 authorName: data[0].value, 
    //                 email: data[1].value,
    //                 content: data[2].value
    //             });
    //         },
    //         render: function() { 
    //             var self = this,
    //                 attributes = this.model.toJSON(),
    //                 // A new query to filter out all the comment in this blog
    //                 query = new Parse.Query(Comment).equalTo("blog", this.model).descending('createdAt'),
    //                 // Create a collection base on that new query
    //                 collection = query.collection();
    //             // Fetch the collection
    //             collection.fetch().then(function(comments) {
    //                 // Store the comments as a JSON object and add it into attributes object
    //                 attributes.comment = comments.toJSON();
    //                 self.$el.html(self.template(attributes));
    //             });
    //         }
    //     }),
    //     BlogsView = Parse.View.extend({
    //         template: Handlebars.compile($('#blogs-tpl').html()),
    //         render: function() { 
    //             var collection = { blog: this.collection.toJSON() };
    //             this.$el.html(this.template(collection));
    //         }
    //     }),
    //     CategoriesView = Parse.View.extend({
    //         template: Handlebars.compile($('#categories-tpl').html()),
    //         render: function() { 
    //             var collection = { category: this.collection.toJSON() };
    //             this.$el.html(this.template(collection));
    //         }
    //     }),
    var LoginView = Parse.View.extend({
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
        // BlogsAdminView = Parse.View.extend({
        //     template: Handlebars.compile($('#admin-tpl').html()),
        //     render: function() {
        //         var collection = { 
        //             username: this.options.username,
        //             blog: this.collection.toJSON()
        //         };
        //         this.$el.html(this.template(collection));
        //     }
        // }),
        // WriteBlogView = Parse.View.extend({
        //     template: Handlebars.compile($('#write-tpl').html()),
        //     events: {
        //         'submit .form-write': 'submit'
        //     },
        //     submit: function(e) {
        //         e.preventDefault();
        //         var data = $(e.target).serializeArray();
        //         // If there's no blog data, then create a new blog
        //         this.model = this.model || new Blog();
        //         this.model.update({
        //             title: data[0].value,
        //             category: data[1].value,
        //             summary: data[2].value,
        //             content: data[3].value
        //         });
        //     },
        //     render: function(){
        //         var attributes;
        //         // If the user is editing a blog, that means there will be a blog set as this.model
        //         // therefore, we use this logic to render different titles and pass in empty strings
        //         if (this.model) {
        //             attributes = this.model.toJSON();
        //             attributes.form_title = 'Edit Blog';
        //         } else {
        //             attributes = {
        //                 form_title: 'Add a Blog',
        //                 title: '',
        //                 summary: '',
        //                 content: ''
        //             }
        //         }

        //         var self = this,
        //             categories = new Categories();

        //         categories.fetch().then(function(categories){
        //             attributes.categories = categories.toJSON();
        //             // Get current selected category
        //             if (attributes.category) {
        //                 attributes.categories.forEach(function(category, i){
        //                     if (category == attributes.category) {
        //                         attributes.categories[i].selected = true;
        //                     }
        //                 });
        //             }
        //             console.log(attributes);
        //             self.$el.html(self.template(attributes)).find('.write-content').wysihtml5();
        //         });
                
        //     }
        // }),
        // BlogRouter = Parse.Router.extend({
        
        //     // Here you can define some shared variables
        //     initialize: function(options){
        //         this.blogs = new Blogs();
        //         this.categories = new Categories();
        //     },
            
        //     // This runs when we start the router. Just leave it for now.
        //     start: function(){
        //         Parse.history.start({
        //             // put in your directory below
        //             root: '/tutorial_blog/'
        //         });
        //         this.categories.fetch().then(function(categories){
        //             var categoriesView = new CategoriesView({ collection: categories });
        //             categoriesView.render();
        //             $('.blog-sidebar').html(categoriesView.el);
        //         });
        //     },
                
        //     // This is where you map functions to urls.
        //     // Just add '{{URL pattern}}': '{{function name}}'
        //     routes: {
        //         '': 'index',
        //         'blog/:id': 'blog',
        //         'admin': 'admin',
        //         'login': 'login',
        //         'add': 'add',
        //         'edit/:id': 'edit',
        //         'del/:id': 'del',
        //         'logout': 'logout',
        //         'category/:id': 'category'
        //     },

        //     index: function() {
        //         this.blogs.fetch({
        //             success: function(blogs) {
        //                 var blogsView = new BlogsView({ collection: blogs });
        //                 blogsView.render();
        //                 $container.html(blogsView.el);
        //             },
        //             error: function(blogs, error) {
        //                 console.log(error);
        //             }
        //         });
        //     },
        //     category: function(id) {
        //         // Get the current category object
        //         var query = new Parse.Query(Category);
        //         query.get(id, {
        //             success: function(category) {
        //                 // Query to get the blogs under that category
        //                 var blogQuery = new Parse.Query(Blog).equalTo("category", category).descending('createdAt');
        //                 collection = blogQuery.collection();
        //                 // Fetch blogs
        //                 collection.fetch().then(function(blogs){
        //                     // Render blogs
        //                     var blogsView = new BlogsView({ collection: blogs });
        //                     blogsView.render();
        //                     $container.html(blogsView.el);
        //                 });
        //             },
        //             error: function(category, error) {
        //                 console.log(error);
        //             }
        //         });
        //     },
        //     blog: function(id) {
        //         var query = new Parse.Query(Blog);
        //         query.get(id, {
        //             success: function(blog) {
        //                 var blogView = new BlogView({ model: blog });
        //                 blogView.render();
        //                 $container.html(blogView.el);
        //             },
        //             error: function(blog, error) {
        //                 console.log(error);
        //             }
        //         });
        //     },
        //     admin: function() {

        //         var currentUser = Parse.User.current();

        //         // Check login
        //         if (!currentUser) {
        //             this.navigate('#/login', { trigger: true });
        //         } else {
        //             this.blogs.fetch({
        //                 success: function(blogs) {
        //                     var blogsAdminView = new BlogsAdminView({ 
        //                         // Pass in current username to be rendered in #admin-tpl
        //                         username: currentUser.get('username'),
        //                         collection: blogs 
        //                     });
        //                     blogsAdminView.render();
        //                     $container.html(blogsAdminView.el);
        //                 },
        //                 error: function(blogs, error) {
        //                     console.log(error);
        //                 }
        //             });
        //         }
        //     },
        //     login: function() {
        //         var loginView = new LoginView();
        //         loginView.render();
        //         $container.html(loginView.el);
        //     },
        //     add: function() {
        //         // Check login
        //         if (!Parse.User.current()) {
        //             this.navigate('#/login', { trigger: true });
        //         } else {
        //             var writeBlogView = new WriteBlogView();
        //             writeBlogView.render();
        //             $container.html(writeBlogView.el);
        //         }
        //     },
        //     edit: function(id) {
        //         // Check login
        //         if (!Parse.User.current()) {
        //             this.navigate('#/login', { trigger: true });
        //         } else {
        //             var query = new Parse.Query(Blog);
        //             query.get(id, {
        //                 success: function(blog) {
        //                     var writeBlogView = new WriteBlogView({ model: blog });
        //                     writeBlogView.render();
        //                     $container.html(writeBlogView.el);
        //                 },
        //                 error: function(blog, error) {
        //                     console.log(error);
        //                 }
        //             });
        //         }
        //     },
        //     del: function(id) {
        //         if (!Parse.User.current()) {
        //             this.navigate('#/login', { trigger: true });
        //         } else {
        //             var self = this,
        //                 query = new Parse.Query(Blog);
        //             query.get(id).then(function(blog){
        //                 blog.destroy().then(function(blog){
        //                     self.navigate('admin', { trigger: true });
        //                 })
        //             });
        //         }
        //     },
        //     logout: function () {
        //         Parse.User.logOut();
        //         this.navigate('#/login', { trigger: true });
        //     }
        
        // blogRouter = new BlogRouter();
        loginView = new LoginView();
        loginView.render();
        $('.main-container').html(loginView.el);
        // blogRouter.start();
});