'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var spauth = require('node-sp-auth');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the hunky-dory ' + chalk.red('generator-sp-2013-calendar-webpart') + ' generator!'
    ));

    var prompts = [
      {
        type: 'input',
        name: 'url',
        message: 'Enter a valid SharePoint 2013 site collection url.',
        default: 'WARNING: Site URL not entered.'
      },
      {
        type: 'input',
        name: 'username',
        message: 'Enter a username with a permission level of atleast Contribute.',
        default: 'WARNING: Username is not specified.'
      },
      {
        type: 'input',
        name: 'password',
        message: 'Enter the password.',
        default: 'WARNING: Password was not specified.'
      }
    ];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  writing: {
    config: function () {

      // Tests the connection first before continuing.
      spauth.getAuth(this.props.url, {
        username: this.props.username,
        password: this.props.password
      })
      .then(generateProjectFiles.call(this))
      .catch(function(error){
        console.log('\n\n' + chalk.red('ERROR: Installation failed, incorrect user credentials.') + '\n'
            + 'The user credentials you have entered failed when attempting to log into the site. \n'
            + 'The installation will continue however it is recommended that you stop it, delete the files and try again.');
        console.log('\n' + error + '\n');
      });

      function generateProjectFiles(options){
        
        // Encrypts the password
        var password = (function(){
          var cipher = crypto.createCipher('aes192', 'password');
          var encrypted = cipher.update(this.props.password, 'utf8', 'hex');
          encrypted += cipher.final('hex');
          return encrypted;
        }).bind(this)();

        // settings.json
        this.fs.copyTpl(
          this.templatePath('dynamic/settings.json'),
          this.destinationPath('settings.json'), {
            username: this.props.username,
            password: password,
            url: this.props.url
          }
        );

        // Static files that require no input from the developer:
        this.fs.copy(
          this.templatePath('static/**/*.*'),
          this.destinationRoot()
        );

        // Static files with no name:
        this.fs.copy(
          this.templatePath('static/**/.*'),
          this.destinationRoot()
        );
      }
    }
  },

  install: function () {
    this.installDependencies({
      callback: function(){
        this.spawnCommand('typings', ['install']);
      }.bind(this)
    });
  }
});
