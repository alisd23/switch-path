'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('./util');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function switchPathInputGuard(path, routes) {
  if (!(0, _util.isPattern)(path)) {
    throw new Error('First parameter to switchPath must be a route path.');
  }
  if (!(0, _util.isRouteDefinition)(routes)) {
    throw new Error('Second parameter to switchPath must be an object ' + 'containing route patterns.');
  }
}

function betterMatch(candidate, reference) {
  if (!(0, _util.isNotNull)(candidate)) {
    return false;
  }
  if (!(0, _util.isNotNull)(reference)) {
    return true;
  }
  return candidate.length >= reference.length;
}

function matchesWithParams(sourcePath, pattern) {
  var sourceParts = (0, _util.splitPath)(sourcePath);
  var patternParts = (0, _util.splitPath)(pattern);

  var params = patternParts.map(function (part, i) {
    return (0, _util.isParam)(part) ? sourceParts[i] : null;
  }).filter(_util.isNotNull);

  var matched = patternParts.every(function (part, i) {
    return (0, _util.isParam)(part) || part === sourceParts[i];
  });

  return matched ? params : [];
}

function getParamFnValue(paramFn, params) {
  var _paramFn = (0, _util.isRouteDefinition)(paramFn) ? paramFn['/'] : paramFn;
  return typeof _paramFn === 'function' ? _paramFn.apply(undefined, _toConsumableArray(params)) : _paramFn;
}

function validatePath(sourcePath, matchedPath) {
  var sourceParts = (0, _util.splitPath)(sourcePath);
  var matchedParts = (0, _util.splitPath)(matchedPath);

  for (var i = 0; i < matchedParts.length; ++i) {
    if (matchedParts[i] !== sourceParts[i]) {
      return null;
    }
  }

  return '/' + (0, _util.extractPartial)(sourcePath, matchedPath);
}

function validate(_ref) {
  var sourcePath = _ref.sourcePath;
  var matchedPath = _ref.matchedPath;
  var matchedValue = _ref.matchedValue;
  var routes = _ref.routes;

  var path = matchedPath ? validatePath(sourcePath, matchedPath) : null;
  var value = matchedValue;
  if (!path) {
    path = routes['*'] ? sourcePath : null;
    value = path ? routes['*'] : null;
  }
  return { path: path, value: value };
}

function switchPath(sourcePath, routes) {
  switchPathInputGuard(sourcePath, routes);
  var matchedPath = null;
  var matchedValue = null;

  (0, _util.traverseRoutes)(routes, function matchPattern(pattern) {
    if (sourcePath.search(pattern) === 0 && betterMatch(pattern, matchedPath)) {
      matchedPath = pattern;
      matchedValue = routes[pattern];
    }

    var params = matchesWithParams(sourcePath, pattern).filter(Boolean);

    if (params.length > 0 && betterMatch(sourcePath, matchedPath)) {
      matchedPath = (0, _util.extractPartial)(sourcePath, pattern);
      matchedValue = getParamFnValue(routes[pattern], params);
    }

    if ((0, _util.isRouteDefinition)(routes[pattern]) && params.length === 0) {
      if (sourcePath !== '/') {
        var child = switchPath((0, _util.unprefixed)(sourcePath, pattern) || '/', routes[pattern]);
        var nestedPath = pattern + child.path;
        if (!child.path !== null && betterMatch(nestedPath, matchedPath)) {
          matchedPath = nestedPath;
          matchedValue = child.value;
        }
      }
    }
  });

  return validate({ sourcePath: sourcePath, matchedPath: matchedPath, matchedValue: matchedValue, routes: routes });
}

exports.default = switchPath;