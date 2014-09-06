/**
 * Created by josh on 6/21/14.
 */
Router.configure({
    notFoundTemplate: 'notFound'
});

Router.map(function () {
    this.route('home', {
        path: '/',
        layoutTemplate: 'layout',
        yieldTemplates: {
            'header': {to: 'header'},
            'footer': {to: 'footer'}
        }
    });

    this.route('login', {
        path: '/login',
        layoutTemplate: 'layout',
        yieldTemplates: {
            'header': {to: 'header'},
            'footer': {to: 'footer'}
        }
    });

    this.route('signup', {
        path: '/signup',
        layoutTemplate: 'layout',
        yieldTemplates: {
            'header': {to: 'header'},
            'footer': {to: 'footer'}
        }
    });

    this.route('about', {
        path: '/about',
        layoutTemplate: 'layout',
        yieldTemplates: {
            'header': {to: 'header'},
            'footer': {to: 'footer'}
        }
    });

    this.route('terms');

    this.route('profile', {
        path: '/profile/:_id',
        data: function () {return Meteor.user()},
        layoutTemplate: 'layout',
        yieldTemplates: {
            'header': {to: 'header'},
            'footer': {to: 'footer'}
        }
    });
    this.route('plugin', {
        path: '/plugin/:_id',
        data: function () {
            return Meteor.user()
        },
        layoutTemplate: 'layout',
        yieldTemplates: {
            'header': {to: 'header'},
            'footer': {to: 'footer'}
        }
    });
});
