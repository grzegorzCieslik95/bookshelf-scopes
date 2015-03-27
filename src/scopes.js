'use strict';

var _ = require('lodash');

module.exports = function(bookshelf) {
  var baseExtend = bookshelf.Model.extend;

  bookshelf.Model.extend = function(protoProps) {
    var self = this;
    self.scopes = _.extend({}, self.scopes || {}, protoProps.scopes || {});

    Object.keys(self.scopes).forEach(function(property) {
      self.prototype[property] = function() {
        var passedInArguments = _.toArray(arguments);

        return this.query(function(qb) {
          passedInArguments.unshift(qb);
          self.scopes[property].apply(self.scopes, passedInArguments);
        });
      };

      self[property] = function() {
        return this.prototype[property].apply(this, arguments);
      }
    });

    return baseExtend.apply(self, arguments);
  }

  var Model = bookshelf.Model.extend({

    scopes: null,

    initialize: function() {
      this.addScope();
    },

    addScope: function() {
      var self = this;
      if (self.scopes && self.scopes.default) {
        self.query(function(qb) {
          var args = new Array();
          args.push(qb);
          self.scopes.default.apply(self.scopes, args);
        });
      }
    },

    unscoped: function() {
      return this.resetQuery();
    }
  }, {
    unscoped: function() {
      return this.forge().unscoped();
    }
  });

  bookshelf.Model = Model;
}