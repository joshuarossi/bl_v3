/**
 * Created by josh on 9/4/14.
 */

// trim helper
var trimInput = function (val) {
    return val.replace(/^\s*|\s*$/g, "");
};

Template.header.events({
    'click #logout': function() {
        Meteor.logout();
    }
});

Template.header.helpers({
    '_id': function () {return Meteor.user()._id}
});

Template.profile.helpers({
    'email': function () {return Meteor.user().emails[0].address},
    'pluginAddress': function () {return 'http://blottery.meteor.com/plugin/' + Meteor.user()._id},
    'display_balance': function () {return Meteor.user().profile.balance/100000000.0}
});

Template.plugin.helpers({
    'jackpot': function () {return Meteor.users.findOne({username: 'blottery'}).profile.jackpot/100000000.0},
    'bitcoin_uri': function () {return Meteor.user().profile.internal_address}
});

Template.login.events({
    'submit #login-form': function (e, t) {
        e.preventDefault();
        // retrieve the input field values
        var email = t.find('#login-email').value,
            password = t.find('#login-password').value;
        // Trim and validate your fields here....
        // If validation passes, supply the appropriate fields to the
        // Meteor.loginWithPassword() function.
        Meteor.loginWithPassword(email, password, function (err) {
            if (err)
            {}
            // The user might not have been found, or their passwword
            // could be incorrect. Inform the user that their
            // login attempt has failed.
            else
            // The user has been logged in.
            if (Meteor.user()){
            Router.go('profile', {_id: Meteor.user()._id});
            }
        });
        return false;
    }
});

Template.signup.events({
    'submit #signup-form': function (e, t) {
        e.preventDefault();
        // retrieve the input field values


        var email = t.find('#login-email').value,
            password = t.find('#login-password').value,
            profile = {
                'website': t.find('#website').value,
                'description': t.find('#description').value,
                'external_address': t.find('#withdrawal_address').value,
                'twitter': t.find('#twitter').value
            };
        Accounts.createUser(
            {
                email: trimInput(email),
                password: password,
                profile: profile
            },
            function (err) {
                if (err) {
                    // Inform the user that account creation failed
                }
                else {
                    // Success. Account has been created and the user
                    // has logged in successfully.
                    Router.go('profile', {_id: Meteor.user()._id});
                }
            });
        return false;
    }
});

function drawQR(uri) {
    var qrcodesvg = new Qrcodesvg(uri, "qrcode", 250);
    console.log(uri);
    qrcodesvg.draw();
}

Template.plugin.rendered = function () {
    drawQR('bitcoin:' + this.data.profile.internal_address);
};
