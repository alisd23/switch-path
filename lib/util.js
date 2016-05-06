"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPattern = isPattern;
exports.isRouteDefinition = isRouteDefinition;
exports.traverseRoutes = traverseRoutes;
exports.isNotNull = isNotNull;
exports.splitPath = splitPath;
exports.isParam = isParam;
exports.extractPartial = extractPartial;
exports.unprefixed = unprefixed;
function isPattern(candidate) {
  return typeof candidate === "string" && (candidate.charAt(0) === "/" || candidate === "*");
}

function isRouteDefinition(candidate) {
  return !candidate || typeof candidate !== "object" ? false : isPattern(Object.keys(candidate)[0]);
}

function traverseRoutes(routes, callback) {
  var keys = Object.keys(routes);
  for (var i = 0; i < keys.length; ++i) {
    var pattern = keys[i];
    if (pattern === "*") {
      continue;
    }
    callback(pattern);
  }
}

function isNotNull(candidate) {
  return candidate !== null;
}

function splitPath(path) {
  return path.split("/").filter(function (s) {
    return !!s;
  });
}

function isParam(candidate) {
  return candidate.match(/:\w+/) !== null;
}

function extractPartial(sourcePath, pattern) {
  var patternParts = splitPath(pattern);
  var sourceParts = splitPath(sourcePath);

  var matchedParts = [];

  for (var i = 0; i < patternParts.length; ++i) {
    matchedParts.push(sourceParts[i]);
  }

  return matchedParts.filter(isNotNull).join("/");
}

function unprefixed(fullString, prefix) {
  return fullString.split(prefix)[1];
}